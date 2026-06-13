import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JobsDispatcherService } from '../jobs-dispatcher.service';

export const ANALYTICS_QUEUE = 'analytics';

export enum AnalyticsJobName {
  SNAPSHOT = 'snapshot',
}

export interface AnalyticsJobPayload {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly';
}

@Processor(ANALYTICS_QUEUE)
export class AnalyticsQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(AnalyticsQueueProcessor.name);

  constructor(private readonly dispatcher: JobsDispatcherService) {
    super();
  }

  async process(job: Job<AnalyticsJobPayload>): Promise<void> {
    this.logger.debug(`Processing analytics job ${job.name} for ${job.data.userId}`);
    await this.dispatcher.processAnalyticsSnapshot(job.data);
  }
}
