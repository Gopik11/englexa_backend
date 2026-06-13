import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class ExerciseAnswerDto {
  @IsUUID()
  exerciseId!: string;

  @IsDefined()
  answer!: unknown;
}

export class SubmitProgressDto {
  @IsUUID()
  lessonId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseAnswerDto)
  answers!: ExerciseAnswerDto[];
}
