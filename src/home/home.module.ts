import { Module } from '@nestjs/common';
import { MiniLessonsModule } from '../mini-lessons/mini-lessons.module';
import { SrsModule } from '../srs/srs.module';
import { PredictionModule } from '../prediction/prediction.module';
import { DailyChallengeModule } from '../daily-challenge/daily-challenge.module';
import { GamificationModule } from '../gamification/gamification.module';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

@Module({
  imports: [
    MiniLessonsModule,
    SrsModule,
    PredictionModule,
    DailyChallengeModule,
    GamificationModule,
  ],
  controllers: [HomeController],
  providers: [HomeService],
  exports: [HomeService],
})
export class HomeModule {}
