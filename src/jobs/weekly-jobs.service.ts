import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { SimpleCacheService } from '../common/cache/simple-cache.service';
import { todayUtcKey } from '../home/utils/daily-seed';
import { MasteryService } from '../mastery/mastery.service';
import { PrismaService } from '../prisma/prisma.service';
import { WeeklyPlanService } from '../weekly-plan/weekly-plan.service';
import { JobsDispatcherService } from './jobs-dispatcher.service';
import { JobsStatusService } from './jobs-status.service';
import { decayMasteryScore, daysSince } from './utils/mastery-decay';
import { listLearnerUserIds } from './utils/user-batch';

@Injectable()
export class WeeklyJobsService {
  private readonly logger = new Logger(WeeklyJobsService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly cache: SimpleCacheService,
    private readonly weeklyPlanService: WeeklyPlanService,
    private readonly masteryService: MasteryService,
    private readonly dispatcher: JobsDispatcherService,
    private readonly status: JobsStatusService,
  ) {}

  @Cron('0 0 * * 1', { name: 'weekly-jobs' })
  async runWeeklyJobs(): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    this.logger.log('Starting weekly background jobs');
    const userIds = await listLearnerUserIds(this.prisma);

    try {
      for (const userId of userIds) {
        await this.generateWeeklyPlan(userId);
        await this.recalcStrengthsWeaknesses(userId);
        await this.applyMasteryDecay(userId);
        await this.queueWeeklyAnalytics(userId);
      }

      this.status.record('weekly', userIds.length, true, 'Weekly jobs completed');
      this.logger.log(`Weekly jobs completed for ${userIds.length} learners`);
    } catch (error) {
      this.status.record(
        'weekly',
        userIds.length,
        false,
        error instanceof Error ? error.message : 'Weekly jobs failed',
      );
      this.logger.error('Weekly jobs failed', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async generateWeeklyPlan(userId: string): Promise<void> {
    const weekStart = todayUtcKey();
    this.cache.delete(`weekly-plan:${userId}:${weekStart}`);
    await this.weeklyPlanService.getWeeklyPlan(userId);
  }

  async recalcStrengthsWeaknesses(userId: string): Promise<void> {
    await this.masteryService.getOverview(userId);
    await this.masteryService.getRecommendation(userId);
  }

  async applyMasteryDecay(userId: string): Promise<void> {
    const now = new Date();

    const skillRows = await this.prisma.skillConceptMastery.findMany({
      where: { userId },
    });

    for (const row of skillRows) {
      const nextScore = decayMasteryScore(
        row.masteryScore,
        daysSince(row.updatedAt, now),
      );
      if (nextScore === row.masteryScore) continue;

      await this.prisma.skillConceptMastery.update({
        where: {
          userId_module_concept: {
            userId,
            module: row.module,
            concept: row.concept,
          },
        },
        data: { masteryScore: nextScore },
      });
    }

    const grammarRows = await this.prisma.grammarConceptProgress.findMany({
      where: { userId },
    });

    for (const row of grammarRows) {
      const nextScore = decayMasteryScore(
        row.masteryScore,
        daysSince(row.updatedAt, now),
      );
      if (nextScore === row.masteryScore) continue;

      await this.prisma.grammarConceptProgress.update({
        where: {
          userId_concept: { userId, concept: row.concept },
        },
        data: { masteryScore: nextScore },
      });
    }
  }

  async queueWeeklyAnalytics(userId: string): Promise<void> {
    await this.dispatcher.queueWeeklyAnalytics(userId);
  }

  private isEnabled(): boolean {
    return this.config.get<boolean>('jobs.enabled') !== false;
  }
}
