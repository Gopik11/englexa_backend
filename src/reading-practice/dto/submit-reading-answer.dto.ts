import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { ReadingTopic } from '../interfaces/reading-passage.interface';
import { ReadingLevel, ReadingTopicParam } from './get-reading-passage.dto';

export class ReadingAnswerItemDto {
  @IsString()
  @MinLength(1)
  questionId!: string;

  @IsString()
  userAnswer!: string;
}

export class SubmitReadingAnswerDto {
  @IsString()
  @MinLength(1)
  passageId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReadingAnswerItemDto)
  answers!: ReadingAnswerItemDto[];

  @IsEnum(ReadingLevel)
  level!: LearnerLevel;

  @IsEnum(ReadingTopicParam)
  topic!: ReadingTopic;
}
