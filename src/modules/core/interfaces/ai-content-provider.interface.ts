import { PracticeLevel } from '../types/practice-level.type';

export interface GeneratedExercise {
  type: string;
  question: string;
  options: string[] | null;
  correctAnswer: string;
  explanation: string;
}

export interface GeneratedExample {
  sentence: string;
  highlight: string | null;
  note: string | null;
}

export interface GenerateExercisesInput {
  topicId: string;
  level: PracticeLevel;
  count: number;
}

export interface GenerateExamplesInput {
  topicId: string;
  level: PracticeLevel;
  count: number;
}

/** Provider-agnostic AI content generation contract (Phase 2). */
export interface AiContentProvider {
  generateExercises(input: GenerateExercisesInput): Promise<GeneratedExercise[]>;
  generateExamples(input: GenerateExamplesInput): Promise<GeneratedExample[]>;
}

export const AI_CONTENT_PROVIDER = Symbol('AI_CONTENT_PROVIDER');
