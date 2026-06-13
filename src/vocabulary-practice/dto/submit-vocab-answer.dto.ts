import { IsEnum, IsString, MinLength } from 'class-validator';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { VocabTopic } from '../interfaces/vocab-exercise.interface';
import { VocabLevel, VocabTopicParam } from './get-vocab-exercises.dto';

export class SubmitVocabAnswerDto {
  @IsString()
  @MinLength(1)
  exerciseId!: string;

  @IsString()
  userAnswer!: string;

  @IsEnum(VocabLevel)
  level!: LearnerLevel;

  @IsEnum(VocabTopicParam)
  topic!: VocabTopic;
}
