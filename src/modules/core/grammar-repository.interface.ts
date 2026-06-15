/** Shared record shapes for grammar repository contracts (Phase 2A). */

export interface GrammarTopicRecord {
  id: string;
  slug: string;
  name: string;
  level: string;
  tags: string[];
  description: string | null;
  sortOrder: number;
  isPublished: boolean;
  version: number;
}

export interface GrammarExerciseRecord {
  id: string;
  topicId: string;
  legacyId: string | null;
  type: string;
  question: string;
  optionsJson: unknown;
  answerJson: unknown;
  explanation: string | null;
  difficulty: number;
  status: string;
}

export interface GrammarExampleRecord {
  id: string;
  topicId: string;
  sentence: string;
  highlight: string | null;
  note: string | null;
  status: string;
}

export interface UserGrammarProgressRecord {
  id: string;
  userId: string;
  topicId: string;
  status: string;
  lastScore: number | null;
  attempts: number;
  lastAttemptAt: Date | null;
}

export interface GrammarTopicRepository {
  findAllPublished(): Promise<GrammarTopicRecord[]>;
  findById(id: string): Promise<GrammarTopicRecord | null>;
  findBySlug(slug: string): Promise<GrammarTopicRecord | null>;
  findByLevel(level: string): Promise<GrammarTopicRecord[]>;
}

export interface GrammarExerciseRepository {
  findByTopicId(topicId: string): Promise<GrammarExerciseRecord[]>;
  findPublishedByTopicId(topicId: string): Promise<GrammarExerciseRecord[]>;
}

export interface GrammarExampleRepository {
  findByTopicId(topicId: string): Promise<GrammarExampleRecord[]>;
  findPublishedByTopicId(topicId: string): Promise<GrammarExampleRecord[]>;
}

export interface UserGrammarProgressRepository {
  getUserProgress(userId: string): Promise<UserGrammarProgressRecord[]>;
  upsertProgress(
    userId: string,
    topicId: string,
    score: number,
  ): Promise<UserGrammarProgressRecord>;
}
