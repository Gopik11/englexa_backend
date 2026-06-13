import { Module } from '@nestjs/common';
import { ErrorPatternsModule } from '../error-patterns/error-patterns.module';
import { GamificationModule } from '../gamification/gamification.module';
import { MasteryModule } from '../mastery/mastery.module';
import { MiniLessonsModule } from '../mini-lessons/mini-lessons.module';
import { SrsModule } from '../srs/srs.module';
import { PredictionModule } from '../prediction/prediction.module';
import { DailyChallengeModule } from '../daily-challenge/daily-challenge.module';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { LearnerDashboardService } from './learner-dashboard.service';

@Module({
  imports: [ErrorPatternsModule, GamificationModule, MasteryModule, MiniLessonsModule, SrsModule, PredictionModule, DailyChallengeModule],
  controllers: [AdminAnalyticsController, AnalyticsController],
  providers: [AnalyticsService, LearnerDashboardService],
  exports: [LearnerDashboardService],
})
export class AnalyticsModule {}
