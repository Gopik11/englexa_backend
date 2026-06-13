import { IsEnum, IsString, MinLength } from 'class-validator';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { GrammarTopic } from '../interfaces/grammar-exercise.interface';
import { GrammarLevel, GrammarTopicParam } from './get-exercises.dto';

/** Body for POST /grammar/submit */
export class SubmitAnswerDto {
  @IsString()
  @MinLength(1)
  exerciseId!: string;

  @IsString()
  userAnswer!: string;

  @IsEnum(GrammarLevel)
  level!: LearnerLevel;

  @IsEnum(GrammarTopicParam)
  topic!: GrammarTopic;
}
