import { Module } from '@nestjs/common';
import { ExercisesModule } from '../exercises/exercises.module';
import { GamificationModule } from '../gamification/gamification.module';
import { ProfileModule } from '../profile/profile.module';
import { LessonsModule } from '../lessons/lessons.module';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

@Module({
  imports: [LessonsModule, ExercisesModule, GamificationModule, ProfileModule],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
