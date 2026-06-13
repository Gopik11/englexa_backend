import { LearnerLevel } from './englexa-content-spec.constants';

export interface FeedbackExample {
  text: string;
  isCorrect: boolean;
  note?: string;
}

/** Shared enriched feedback returned by all practice modules on submit. */
export interface EnrichedFeedback {
  corrected_sentence?: string;
  grammar_feedback?: string;
  vocabulary_feedback?: string;
  comprehension_feedback?: string;
  pronunciation_feedback?: string;
  fluency_feedback?: string;
  coherence_feedback?: string;
  structure_feedback?: string;
  concept_explanation?: string;
  examples?: FeedbackExample[];
  counter_examples?: FeedbackExample[];
  mini_tip?: string;
  micro_lesson?: unknown;
  encouragement?: string;
  next_step?: string;
}

export interface BuildEnrichedFeedbackInput {
  userId: string;
  level: LearnerLevel;
  isCorrect: boolean;
  /** Grammar rule key, vocab topic, reading concept, etc. */
  conceptKey?: string;
  correctAnswer?: string;
  userAnswer?: string;
  /** Existing module-specific feedback to preserve. */
  grammarFeedback?: string;
  vocabularyFeedback?: string;
  comprehensionFeedback?: string;
  pronunciationFeedback?: string;
  fluencyFeedback?: string;
  coherenceFeedback?: string;
  structureFeedback?: string;
  correctedSentence?: string;
  microLesson?: unknown;
  nextStep?: string;
}
