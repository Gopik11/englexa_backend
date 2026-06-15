/**
 * Contract for AI content generation.
 * Phase 1: stub provider only — no real AI calls.
 */
export interface AiContentProvider {
  generateExplanation(input: any): Promise<any>;
  generateExercises(input: any): Promise<any>;
  generateExamples(input: any): Promise<any>;
}

export const AI_CONTENT_PROVIDER = Symbol('AI_CONTENT_PROVIDER');
