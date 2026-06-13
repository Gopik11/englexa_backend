import { IsEnum, IsObject, IsString, IsUUID } from 'class-validator';
import { ExerciseType } from '@prisma/client';

export class CreateExerciseDto {
  @IsUUID()
  lessonId!: string;

  @IsEnum(ExerciseType)
  type!: ExerciseType;

  @IsString()
  prompt!: string;

  @IsObject()
  optionsJson!: Record<string, unknown>;

  @IsObject()
  answerJson!: Record<string, unknown>;
}
