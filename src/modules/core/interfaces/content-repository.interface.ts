import { PracticeLevel } from '../types/practice-level.type';

export interface GrammarTopicRecord {
  id: string;
  slug: string;
  name: string;
  level: PracticeLevel;
  tags: string[];
  description: string | null;
}

export interface GrammarExampleRecord {
  id: string;
  topicId: string;
  sentence: string;
  highlight: string | null;
  note: string | null;
}

export interface GrammarTopicRepository {
  listByLevel(level?: PracticeLevel): Promise<GrammarTopicRecord[]>;
  findBySlug(slug: string): Promise<GrammarTopicRecord | null>;
}

export interface GrammarExerciseRepository {
  findByTopic(level: PracticeLevel, topicSlug: string): Promise<unknown[]>;
}

export interface GrammarExampleRepository {
  findByTopic(topicSlug: string): Promise<GrammarExampleRecord[]>;
}
