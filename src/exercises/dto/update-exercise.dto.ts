import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateExerciseDto } from './create-exercise.dto';

export class UpdateExerciseDto extends PartialType(
  OmitType(CreateExerciseDto, ['lessonId'] as const),
) {}
