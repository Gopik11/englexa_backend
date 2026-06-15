/**
 * Contract for AI content generation (Phase 2C).
 */
export interface AiContentProvider {
  generateTopic(input: any): Promise<any>;
  generateExplanation(input: any): Promise<any>;
  generateExercises(input: any): Promise<any>;
  generateExamples(input: any): Promise<any>;
  generateVocabulary(input: {
    level: string;
    topic: string;
    userId?: string;
    word?: string;
    count?: number;
  }): Promise<any>;
  generateSpeaking(input: {
    level: string;
    topic: string;
    userId?: string;
    message?: string;
  }): Promise<any>;
}

export const AI_CONTENT_PROVIDER = Symbol('AI_CONTENT_PROVIDER');
