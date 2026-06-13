import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { SimpleCacheService } from '../common/cache/simple-cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { JobsDispatcherService } from './jobs-dispatcher.service';
import { JobsStatusService } from './jobs-status.service';
import { CleanupJobName } from './queues/cleanup.queue';
import { listLearnerUserIds } from './utils/user-batch';

@Injectable()
export class MonthlyJobsService {
  private readonly logger = new Logger(MonthlyJobsService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly cache: SimpleCacheService,
    private readonly dispatcher: JobsDispatcherService,
    private readonly status: JobsStatusService,
  ) {}

  @Cron('0 0 1 * *', { name: 'monthly-jobs' })
  async runMonthlyJobs(): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    this.logger.log('Starting monthly background jobs');
    const userIds = await listLearnerUserIds(this.prisma);

    try {
      await this.archiveOldSessions();
      await this.cleanupLogs();
      await this.optimizeDatabase();

      for (const userId of userIds) {
        await this.generateMonthlyReport(userId);
      }

      this.status.record('monthly', userIds.length, true, 'Monthly jobs completed');
      this.logger.log(`Monthly jobs completed for ${userIds.length} learners`);
    } catch (error) {
      this.status.record(
        'monthly',
        userIds.length,
        false,
        error instanceof Error ? error.message : 'Monthly jobs failed',
      );
      this.logger.error('Monthly jobs failed', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async archiveOldSessions(): Promise<void> {
    await this.dispatcher.queueCleanupTask({
      task: CleanupJobName.ARCHIVE_SESSIONS,
    });
  }

  async cleanupLogs(): Promise<void> {
    this.cache.clear();
    await this.dispatcher.queueCleanupTask({
      task: CleanupJobName.CLEANUP_LOGS,
    });
  }

  async optimizeDatabase(): Promise<void> {
    await this.dispatcher.queueCleanupTask({
      task: CleanupJobName.OPTIMIZE_DB,
    });
  }

  async generateMonthlyReport(userId: string): Promise<void> {
    await this.dispatcher.queueCleanupTask({
      task: CleanupJobName.MONTHLY_REPORT,
      userId,
    });
  }

  private isEnabled(): boolean {
    return this.config.get<boolean>('jobs.enabled') !== false;
  }
}
