import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JobsDispatcherService } from '../jobs-dispatcher.service';

export const CLEANUP_QUEUE = 'cleanup';

export enum CleanupJobName {
  ARCHIVE_SESSIONS = 'archive-sessions',
  CLEANUP_LOGS = 'cleanup-logs',
  OPTIMIZE_DB = 'optimize-db',
  MONTHLY_REPORT = 'monthly-report',
}

export type CleanupJobPayload =
  | { task: CleanupJobName.ARCHIVE_SESSIONS }
  | { task: CleanupJobName.CLEANUP_LOGS }
  | { task: CleanupJobName.OPTIMIZE_DB }
  | { task: CleanupJobName.MONTHLY_REPORT; userId: string };

@Processor(CLEANUP_QUEUE)
export class CleanupQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(CleanupQueueProcessor.name);

  constructor(private readonly dispatcher: JobsDispatcherService) {
    super();
  }

  async process(job: Job<CleanupJobPayload>): Promise<void> {
    this.logger.debug(`Processing cleanup job ${job.data.task}`);
    await this.dispatcher.processCleanup(job.data);
  }
}
