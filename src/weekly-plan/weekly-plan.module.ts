import { Module } from '@nestjs/common';
import { CacheModule } from '../common/cache/cache.module';
import { MasteryModule } from '../mastery/mastery.module';
import { MiniLessonsModule } from '../mini-lessons/mini-lessons.module';
import { SrsModule } from '../srs/srs.module';
import { PredictionModule } from '../prediction/prediction.module';
import { WeeklyPlanController } from './weekly-plan.controller';
import { WeeklyPlanService } from './weekly-plan.service';

@Module({
  imports: [CacheModule, MasteryModule, MiniLessonsModule, SrsModule, PredictionModule],
  controllers: [WeeklyPlanController],
  providers: [WeeklyPlanService],
  exports: [WeeklyPlanService],
})
export class WeeklyPlanModule {}
