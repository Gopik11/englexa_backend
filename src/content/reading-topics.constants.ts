import { LearnerLevel } from './englexa-content-spec.constants';
import { ReadingTopic } from '../reading-practice/interfaces/reading-passage.interface';

export const READING_TOPICS_BY_LEVEL: Record<LearnerLevel, ReadingTopic[]> = {
  beginner: ['short_dialogues', 'simple_stories'],
  intermediate: ['news_snippets', 'opinion_paragraphs'],
  advanced: ['essays', 'argumentative_texts'],
};

export const ALL_READING_TOPICS: ReadingTopic[] = [
  ...READING_TOPICS_BY_LEVEL.beginner,
  ...READING_TOPICS_BY_LEVEL.intermediate,
  ...READING_TOPICS_BY_LEVEL.advanced,
];
