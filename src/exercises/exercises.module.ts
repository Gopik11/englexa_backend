import { Module, forwardRef } from '@nestjs/common';
import { LessonsModule } from '../lessons/lessons.module';
import { ExercisesController } from './exercises.controller';
import { ExerciseEvaluatorService } from './exercise-evaluator.service';
import { ExercisesService } from './exercises.service';

@Module({
  imports: [forwardRef(() => LessonsModule)],
  controllers: [ExercisesController],
  providers: [ExercisesService, ExerciseEvaluatorService],
  exports: [ExercisesService, ExerciseEvaluatorService],
})
export class ExercisesModule {}
