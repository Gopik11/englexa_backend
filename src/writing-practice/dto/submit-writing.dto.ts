import { IsEnum, IsString, MinLength } from 'class-validator';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { WritingTopic } from '../interfaces/writing-prompt.interface';
import { WritingLevel, WritingTopicParam } from './get-writing-prompt.dto';

export class SubmitWritingDto {
  @IsEnum(WritingLevel)
  level!: LearnerLevel;

  @IsEnum(WritingTopicParam)
  topic!: WritingTopic;

  @IsString()
  @MinLength(10)
  text!: string;
}
