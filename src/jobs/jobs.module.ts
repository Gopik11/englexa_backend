import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { Queue } from 'bullmq';
import { AnalyticsModule } from '../analytics/analytics.module';
import { CacheModule } from '../common/cache/cache.module';
import { DailyChallengeModule } from '../daily-challenge/daily-challenge.module';
import { MiniLessonsModule } from '../mini-lessons/mini-lessons.module';
import { MasteryModule } from '../mastery/mastery.module';
import { PredictionModule } from '../prediction/prediction.module';
import { PrismaService } from '../prisma/prisma.service';
import { SrsModule } from '../srs/srs.module';
import { SrsService } from '../srs/srs.service';
import { PredictionService } from '../prediction/prediction.service';
import { LearnerDashboardService } from '../analytics/learner-dashboard.service';
import { WeeklyPlanModule } from '../weekly-plan/weekly-plan.module';
import { DailyJobsService } from './daily-jobs.service';
import { JobsController } from './jobs.controller';
import { JobsDispatcherService } from './jobs-dispatcher.service';
import { JobsStatusService } from './jobs-status.service';
import { MonthlyJobsService } from './monthly-jobs.service';
import { ANALYTICS_QUEUE, AnalyticsQueueProcessor } from './queues/analytics.queue';
import { CLEANUP_QUEUE, CleanupQueueProcessor } from './queues/cleanup.queue';
import {
  PREDICTION_QUEUE,
  PredictionQueueProcessor,
} from './queues/prediction.queue';
import { SRS_QUEUE, SrsQueueProcessor } from './queues/srs.queue';
import { WeeklyJobsService } from './weekly-jobs.service';

function buildBullImports(): DynamicModule[] {
  return [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>('redis.url'),
        },
      }),
    }),
    BullModule.registerQueue(
      { name: ANALYTICS_QUEUE },
      { name: SRS_QUEUE },
      { name: PREDICTION_QUEUE },
      { name: CLEANUP_QUEUE },
    ),
  ];
}

function buildDispatcherProvider(redisEnabled: boolean) {
  if (!redisEnabled) {
    return {
      provide: JobsDispatcherService,
      useFactory: (
        prisma: PrismaService,
        srsService: SrsService,
        predictionService: PredictionService,
        learnerDashboardService: LearnerDashboardService,
      ) =>
        new JobsDispatcherService(
          prisma,
          srsService,
          predictionService,
          learnerDashboardService,
        ),
      inject: [
        PrismaService,
        SrsService,
        PredictionService,
        LearnerDashboardService,
      ],
    };
  }

  return {
    provide: JobsDispatcherService,
    useFactory: (
      prisma: PrismaService,
      srsService: SrsService,
      predictionService: PredictionService,
      learnerDashboardService: LearnerDashboardService,
      analyticsQueue: Queue,
      srsQueue: Queue,
      predictionQueue: Queue,
      cleanupQueue: Queue,
    ) =>
      new JobsDispatcherService(
        prisma,
        srsService,
        predictionService,
        learnerDashboardService,
        {
          analytics: analyticsQueue,
          srs: srsQueue,
          prediction: predictionQueue,
          cleanup: cleanupQueue,
        },
      ),
    inject: [
      PrismaService,
      SrsService,
      PredictionService,
      LearnerDashboardService,
      getQueueToken(ANALYTICS_QUEUE),
      getQueueToken(SRS_QUEUE),
      getQueueToken(PREDICTION_QUEUE),
      getQueueToken(CLEANUP_QUEUE),
    ],
  };
}

@Module({})
export class JobsModule {
  static register(): DynamicModule {
    const redisEnabled = process.env.REDIS_ENABLED === 'true';
    const jobsEnabled = process.env.JOBS_ENABLED !== 'false';

    const bullImports = redisEnabled && jobsEnabled ? buildBullImports() : [];
    const queueProcessors =
      redisEnabled && jobsEnabled
        ? [
            AnalyticsQueueProcessor,
            SrsQueueProcessor,
            PredictionQueueProcessor,
            CleanupQueueProcessor,
          ]
        : [];

    const cronProviders = jobsEnabled
      ? [DailyJobsService, WeeklyJobsService, MonthlyJobsService]
      : [];

    return {
      module: JobsModule,
      imports: [
        ScheduleModule.forRoot(),
        ...bullImports,
        CacheModule,
        DailyChallengeModule,
        MiniLessonsModule,
        SrsModule,
        PredictionModule,
        MasteryModule,
        WeeklyPlanModule,
        AnalyticsModule,
      ],
      controllers: jobsEnabled ? [JobsController] : [],
      providers: [
        JobsStatusService,
        buildDispatcherProvider(redisEnabled && jobsEnabled),
        ...cronProviders,
        ...queueProcessors,
      ],
      exports: [JobsStatusService],
    };
  }
}
