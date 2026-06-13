import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { SimpleCacheService } from '../common/cache/simple-cache.service';
import { DailyChallengeService } from '../daily-challenge/daily-challenge.service';
import { todayUtcKey } from '../home/utils/daily-seed';
import { MiniLessonsService } from '../mini-lessons/mini-lessons.service';
import { effectiveStreak } from '../profile/utils/streak-manager';
import { PrismaService } from '../prisma/prisma.service';
import { JobsDispatcherService } from './jobs-dispatcher.service';
import { JobsStatusService } from './jobs-status.service';
import { listLearnerUserIds } from './utils/user-batch';

const DAILY_HOME_FEATURES = ['word', 'quote', 'puzzle', 'crossword'] as const;

@Injectable()
export class DailyJobsService {
  private readonly logger = new Logger(DailyJobsService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly cache: SimpleCacheService,
    private readonly dailyChallengeService: DailyChallengeService,
    private readonly miniLessonsService: MiniLessonsService,
    private readonly dispatcher: JobsDispatcherService,
    private readonly status: JobsStatusService,
  ) {}

  @Cron('0 0 * * *', { name: 'daily-jobs' })
  async runDailyJobs(): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    this.logger.log('Starting daily background jobs');
    const userIds = await listLearnerUserIds(this.prisma);

    try {
      for (const userId of userIds) {
        await this.generateDailyChallenge(userId);
        await this.refreshMiniLessons(userId);
        await this.updateSrsOverdue(userId);
        await this.recalcPredictiveDifficulty(userId);
        await this.invalidateDailyCaches(userId);
        await this.queueAnalyticsSnapshot(userId);
      }

      await this.updateStreaks();
      this.status.record('daily', userIds.length, true, 'Daily jobs completed');
      this.logger.log(`Daily jobs completed for ${userIds.length} learners`);
    } catch (error) {
      this.status.record(
        'daily',
        userIds.length,
        false,
        error instanceof Error ? error.message : 'Daily jobs failed',
      );
      this.logger.error('Daily jobs failed', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async generateDailyChallenge(userId: string): Promise<void> {
    await this.dailyChallengeService.generateDailyChallenge(userId);
  }

  async refreshMiniLessons(userId: string): Promise<void> {
    await this.miniLessonsService.getLessonsForWeakAreas(userId);
    await this.miniLessonsService.getFeaturedLesson(userId);
  }

  async updateSrsOverdue(userId: string): Promise<void> {
    await this.dispatcher.queueSrsOverdueUpdate(userId);
  }

  async recalcPredictiveDifficulty(userId: string): Promise<void> {
    await this.dispatcher.queuePredictionRecalc(userId);
  }

  async queueAnalyticsSnapshot(userId: string): Promise<void> {
    await this.dispatcher.queueAnalyticsSnapshot(userId, 'daily');
  }

  async updateStreaks(): Promise<void> {
    const users = await this.prisma.user.findMany({
      where: { role: 'LEARNER', streak: { gt: 0 } },
      select: { id: true, streak: true, lastActiveAt: true },
    });

    const now = new Date();
    for (const user of users) {
      const displayStreak = effectiveStreak(
        user.streak,
        user.lastActiveAt,
        now,
      );
      if (displayStreak === 0 && user.streak > 0) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { streak: 0 },
        });
      }
    }
  }

  private invalidateDailyCaches(userId: string): void {
    const dateKey = todayUtcKey();
    for (const feature of DAILY_HOME_FEATURES) {
      this.cache.delete(`home:${userId}:${feature}:${dateKey}`);
    }
    this.cache.delete(`weekly-plan:${userId}:${dateKey}`);
  }

  private isEnabled(): boolean {
    return this.config.get<boolean>('jobs.enabled') !== false;
  }
}
