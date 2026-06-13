import { LearnerLevel } from './englexa-content-spec.constants';
import { WritingTopic } from '../writing-practice/interfaces/writing-prompt.interface';

export const WRITING_TOPICS_BY_LEVEL: Record<LearnerLevel, WritingTopic[]> = {
  beginner: ['personal_paragraph', 'short_email'],
  intermediate: ['opinion_paragraph', 'story_paragraph'],
  advanced: ['argumentative_essay', 'formal_summary'],
};

export const ALL_WRITING_TOPICS: WritingTopic[] = [
  ...WRITING_TOPICS_BY_LEVEL.beginner,
  ...WRITING_TOPICS_BY_LEVEL.intermediate,
  ...WRITING_TOPICS_BY_LEVEL.advanced,
];
