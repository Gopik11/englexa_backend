import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';
import { WinstonLogger } from './common/logging/winston.logger';
import { CacheModule } from './common/cache/cache.module';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { ApiRootController } from './api-root.controller';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai/ai.module';
import { AiModule as AiStubModule } from './modules/ai';
import { ContentPipelineModule } from './modules/content-pipeline';
import { AnalyticsModule } from './analytics/analytics.module';
import { LessonSummaryModule } from './lesson-summary/lesson-summary.module';
import { AuthModule } from './auth/auth.module';
import { GamificationModule } from './gamification/gamification.module';
import { MissionsModule } from './missions/missions.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { configuration } from './config/configuration';
import { validateConfig } from './config/env.validation';
import { ExercisesModule } from './exercises/exercises.module';
import { GrammarPracticeModule } from './grammar-practice/grammar-practice.module';
import { GrammarModule } from './modules/grammar/grammar.module';
import { AdminModule } from './modules/admin/admin.module';
import { VocabularyPracticeModule } from './vocabulary-practice/vocabulary-practice.module';
import { ReadingPracticeModule } from './reading-practice/reading-practice.module';
import { SpeakingPracticeModule } from './speaking-practice/speaking-practice.module';
import { WritingPracticeModule } from './writing-practice/writing-practice.module';
import { HomeModule } from './home/home.module';
import { AdaptiveModule } from './adaptive/adaptive.module';
import { ErrorPatternsModule } from './error-patterns/error-patterns.module';
import { MasteryModule } from './mastery/mastery.module';
import { WeeklyPlanModule } from './weekly-plan/weekly-plan.module';
import { MiniLessonsModule } from './mini-lessons/mini-lessons.module';
import { ConversationModule } from './conversation/conversation.module';
import { SrsModule } from './srs/srs.module';
import { PredictionModule } from './prediction/prediction.module';
import { DailyChallengeModule } from './daily-challenge/daily-challenge.module';
import { ProfileModule } from './profile/profile.module';
import { JobsModule } from './jobs/jobs.module';
import { HealthModule } from './health/health.module';
import { LessonsModule } from './lessons/lessons.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProgressModule } from './progress/progress.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateConfig,
    }),
    CacheModule,
    PrismaModule,
    SubscriptionModule,
    HealthModule,
    AuthModule,
    UsersModule,
    LessonsModule,
    ExercisesModule,
    ProgressModule,
    GamificationModule,
    AiModule,
    AiStubModule,
    ContentPipelineModule,
    GrammarModule,
    AdminModule,
    GrammarPracticeModule,
    VocabularyPracticeModule,
    ReadingPracticeModule,
    SpeakingPracticeModule,
    WritingPracticeModule,
    HomeModule,
    AdaptiveModule,
    ErrorPatternsModule,
    MasteryModule,
    WeeklyPlanModule,
    MiniLessonsModule,
    ConversationModule,
    SrsModule,
    PredictionModule,
    DailyChallengeModule,
    ProfileModule,
    JobsModule.register(),
    MissionsModule,
    AnalyticsModule,
    LessonSummaryModule,
  ],
  controllers: [ApiRootController],
  providers: [WinstonLogger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RateLimitMiddleware, LoggingMiddleware)
      .forRoutes('*');
  }
}
