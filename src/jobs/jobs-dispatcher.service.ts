import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { LearnerDashboardService } from '../analytics/learner-dashboard.service';
import { PredictionService } from '../prediction/prediction.service';
import { PrismaService } from '../prisma/prisma.service';
import { SrsService } from '../srs/srs.service';
import {
  AnalyticsJobName,
  AnalyticsJobPayload,
} from './queues/analytics.queue';
import {
  CleanupJobName,
  CleanupJobPayload,
} from './queues/cleanup.queue';
import {
  PredictionJobName,
  PredictionJobPayload,
} from './queues/prediction.queue';
import { SrsJobName, SrsJobPayload } from './queues/srs.queue';
import { analyticsSnapshotClient } from './utils/prisma-analytics-snapshot';

export interface JobQueues {
  analytics?: Queue;
  srs?: Queue;
  prediction?: Queue;
  cleanup?: Queue;
}

@Injectable()
export class JobsDispatcherService {
  private readonly logger = new Logger(JobsDispatcherService.name);
  private readonly analyticsQueue?: Queue;
  private readonly srsQueue?: Queue;
  private readonly predictionQueue?: Queue;
  private readonly cleanupQueue?: Queue;

  constructor(
    private readonly prisma: PrismaService,
    private readonly srsService: SrsService,
    private readonly predictionService: PredictionService,
    private readonly learnerDashboardService: LearnerDashboardService,
    queues: JobQueues = {},
  ) {
    this.analyticsQueue = queues.analytics;
    this.srsQueue = queues.srs;
    this.predictionQueue = queues.prediction;
    this.cleanupQueue = queues.cleanup;
  }

  async queueAnalyticsSnapshot(
    userId: string,
    period: AnalyticsJobPayload['period'],
  ): Promise<void> {
    await this.dispatch(
      this.analyticsQueue,
      AnalyticsJobName.SNAPSHOT,
      { userId, period },
      () => this.processAnalyticsSnapshot({ userId, period }),
    );
  }

  async queueWeeklyAnalytics(userId: string): Promise<void> {
    await this.queueAnalyticsSnapshot(userId, 'weekly');
  }

  async queueSrsOverdueUpdate(userId: string): Promise<void> {
    await this.dispatch(
      this.srsQueue,
      SrsJobName.UPDATE_OVERDUE,
      { userId },
      () => this.processSrsOverdue({ userId }),
    );
  }

  async queuePredictionRecalc(userId: string): Promise<void> {
    await this.dispatch(
      this.predictionQueue,
      PredictionJobName.RECALC,
      { userId },
      () => this.processPredictionRecalc({ userId }),
    );
  }

  async queueCleanupTask(payload: CleanupJobPayload): Promise<void> {
    await this.dispatch(
      this.cleanupQueue,
      payload.task,
      payload,
      () => this.processCleanup(payload),
    );
  }

  async processAnalyticsSnapshot(payload: AnalyticsJobPayload): Promise<void> {
    const dashboard = await this.learnerDashboardService.getDashboard(
      payload.userId,
    );
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await analyticsSnapshotClient(this.prisma).upsert({
      where: {
        userId_period_snapshotDate: {
          userId: payload.userId,
          period: payload.period,
          snapshotDate: today,
        },
      },
      create: {
        userId: payload.userId,
        period: payload.period,
        snapshotDate: today,
        data: dashboard,
      },
      update: {
        data: dashboard,
      },
    });
  }

  async processSrsOverdue(payload: SrsJobPayload): Promise<void> {
    await this.srsService.getDueReviews(payload.userId, 20);
  }

  async processPredictionRecalc(payload: PredictionJobPayload): Promise<void> {
    await this.predictionService.getRecommendations(payload.userId);
  }

  async processCleanup(payload: CleanupJobPayload): Promise<void> {
    switch (payload.task) {
      case CleanupJobName.ARCHIVE_SESSIONS: {
        const cutoff = new Date();
        cutoff.setUTCDate(cutoff.getUTCDate() - 90);
        await this.prisma.conversationSession.updateMany({
          where: {
            updatedAt: { lt: cutoff },
            status: { not: 'archived' },
          },
          data: { status: 'archived' },
        });
        break;
      }
      case CleanupJobName.CLEANUP_LOGS: {
        const cutoff = new Date();
        cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 1);
        await analyticsSnapshotClient(this.prisma).deleteMany({
          where: { createdAt: { lt: cutoff } },
        });
        break;
      }
      case CleanupJobName.OPTIMIZE_DB: {
        try {
          await this.prisma.$executeRawUnsafe('ANALYZE;');
          for (const table of [
            'conversation_sessions',
            'analytics_snapshots',
            'srs_reviews',
            'skill_concept_mastery',
          ]) {
            try {
              await this.prisma.$executeRawUnsafe(
                `VACUUM ANALYZE ${table};`,
              );
            } catch {
              // Table may not exist until schema is fully migrated.
            }
          }
        } catch (error) {
          this.logger.warn(`Database optimize skipped: ${String(error)}`);
        }
        break;
      }
      case CleanupJobName.MONTHLY_REPORT: {
        if (payload.userId) {
          await this.processAnalyticsSnapshot({
            userId: payload.userId,
            period: 'monthly',
          });
        }
        break;
      }
      default:
        break;
    }
  }

  private async dispatch<T extends Record<string, unknown>>(
    queue: Queue | undefined,
    jobName: string,
    payload: T,
    fallback: () => Promise<void>,
  ): Promise<void> {
    if (queue) {
      await queue.add(jobName, payload, {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      });
      return;
    }

    await fallback();
  }
}
