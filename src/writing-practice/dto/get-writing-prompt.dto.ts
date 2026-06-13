import { IsEnum } from 'class-validator';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { WritingTopic } from '../interfaces/writing-prompt.interface';

export enum WritingLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum WritingTopicParam {
  PERSONAL_PARAGRAPH = 'personal_paragraph',
  SHORT_EMAIL = 'short_email',
  OPINION_PARAGRAPH = 'opinion_paragraph',
  STORY_PARAGRAPH = 'story_paragraph',
  ARGUMENTATIVE_ESSAY = 'argumentative_essay',
  FORMAL_SUMMARY = 'formal_summary',
}

export class GetWritingPromptDto {
  @IsEnum(WritingLevel)
  level!: LearnerLevel;

  @IsEnum(WritingTopicParam)
  topic!: WritingTopic;
}
