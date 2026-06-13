import { IsEnum } from 'class-validator';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { SpeakingTopic } from '../interfaces/speaking-prompt.interface';

export enum SpeakingLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum SpeakingTopicParam {
  SELF_INTRODUCTION = 'self_introduction',
  DAILY_ROUTINES = 'daily_routines',
  TRAVEL_STORIES = 'travel_stories',
  OPINIONS = 'opinions',
  PRESENTATIONS = 'presentations',
  DEBATES = 'debates',
}

export class GetSpeakingPromptDto {
  @IsEnum(SpeakingLevel)
  level!: LearnerLevel;

  @IsEnum(SpeakingTopicParam)
  topic!: SpeakingTopic;
}
