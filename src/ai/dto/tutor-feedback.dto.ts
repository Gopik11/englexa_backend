import { IsEnum, IsString, MinLength } from 'class-validator';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';

export enum TutorFeedbackLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export class TutorFeedbackRequestDto {
  @IsString()
  @MinLength(1)
  sentence!: string;

  @IsEnum(TutorFeedbackLevel)
  level!: LearnerLevel;
}
