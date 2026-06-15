/**
 * Contract for any learning module (grammar, vocabulary, speaking, etc.).
 * Phase 1: structural placeholder only — no implementations in this file.
 */
export interface PracticeModule {
  moduleName: string;
  getTopics(): Promise<any>;
  getExercises(topic: string): Promise<any>;
  getExamples(topic: string): Promise<any>;
}
