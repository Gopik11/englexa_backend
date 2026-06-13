import {
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { SpeakingTopic } from '../interfaces/speaking-prompt.interface';
import { SpeakingLevel, SpeakingTopicParam } from './get-speaking-prompt.dto';

export class SubmitSpeakingAudioDto {
  @IsString()
  @MinLength(1)
  promptId!: string;

  @IsEnum(SpeakingLevel)
  level!: LearnerLevel;

  @IsEnum(SpeakingTopicParam)
  topic!: SpeakingTopic;

  @ValidateIf((dto) => !dto.audioBlobRef)
  @IsString()
  @MinLength(1)
  audioUrl?: string;

  @ValidateIf((dto) => !dto.audioUrl)
  @IsString()
  @MinLength(1)
  audioBlobRef?: string;
}
