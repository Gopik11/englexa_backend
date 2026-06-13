import { IsEnum } from 'class-validator';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { ReadingTopic } from '../interfaces/reading-passage.interface';

export enum ReadingLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum ReadingTopicParam {
  SHORT_DIALOGUES = 'short_dialogues',
  SIMPLE_STORIES = 'simple_stories',
  NEWS_SNIPPETS = 'news_snippets',
  OPINION_PARAGRAPHS = 'opinion_paragraphs',
  ESSAYS = 'essays',
  ARGUMENTATIVE_TEXTS = 'argumentative_texts',
}

export class GetReadingPassageDto {
  @IsEnum(ReadingLevel)
  level!: LearnerLevel;

  @IsEnum(ReadingTopicParam)
  topic!: ReadingTopic;
}
