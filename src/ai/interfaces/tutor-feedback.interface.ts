import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import {
  EnrichedFeedback,
  FeedbackExample,
} from '../../content/enriched-feedback.interface';

export type { FeedbackExample };

export interface TutorFeedbackJson extends EnrichedFeedback {
  corrected_sentence: string;
  grammar_feedback: string;
  vocabulary_feedback: string;
  encouragement: string;
  next_step: string;
  micro_lesson: string | unknown | null;
  concept_explanation: string;
  examples: FeedbackExample[];
  counter_examples: FeedbackExample[];
  mini_tip: string;
}

export interface GenerateTutorFeedbackInput {
  userSentence: string;
  userId?: string;
  level?: LearnerLevel;
}
