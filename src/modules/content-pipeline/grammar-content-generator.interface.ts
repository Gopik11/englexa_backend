/**
 * Contract for generating grammar explanations, examples, and exercises.
 * Phase 1: stub implementation only.
 */
export interface GrammarContentGenerator {
  generateTopicExplanation(topic: string): Promise<any>;
  generateExamples(topic: string): Promise<any>;
  generateExercises(topic: string): Promise<any>;
}
