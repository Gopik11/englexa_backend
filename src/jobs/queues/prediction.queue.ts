import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JobsDispatcherService } from '../jobs-dispatcher.service';

export const PREDICTION_QUEUE = 'prediction';

export enum PredictionJobName {
  RECALC = 'recalc',
}

export interface PredictionJobPayload {
  userId: string;
}

@Processor(PREDICTION_QUEUE)
export class PredictionQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(PredictionQueueProcessor.name);

  constructor(private readonly dispatcher: JobsDispatcherService) {
    super();
  }

  async process(job: Job<PredictionJobPayload>): Promise<void> {
    this.logger.debug(
      `Processing prediction job ${job.name} for ${job.data.userId}`,
    );
    await this.dispatcher.processPredictionRecalc(job.data);
  }
}
