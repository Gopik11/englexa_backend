import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JobsDispatcherService } from '../jobs-dispatcher.service';

export const SRS_QUEUE = 'srs';

export enum SrsJobName {
  UPDATE_OVERDUE = 'update-overdue',
}

export interface SrsJobPayload {
  userId: string;
}

@Processor(SRS_QUEUE)
export class SrsQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(SrsQueueProcessor.name);

  constructor(private readonly dispatcher: JobsDispatcherService) {
    super();
  }

  async process(job: Job<SrsJobPayload>): Promise<void> {
    this.logger.debug(`Processing SRS job ${job.name} for ${job.data.userId}`);
    await this.dispatcher.processSrsOverdue(job.data);
  }
}
