import { Module } from '@nestjs/common';
import { LearnerLessonsController } from './learner-lessons.controller';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';

@Module({
  controllers: [LessonsController, LearnerLessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
