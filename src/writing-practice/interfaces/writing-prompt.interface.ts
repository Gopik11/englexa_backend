import { LearnerLevel } from '../../content/englexa-content-spec.constants';

export type WritingTopic =
  | 'personal_paragraph'
  | 'short_email'
  | 'opinion_paragraph'
  | 'story_paragraph'
  | 'argumentative_essay'
  | 'formal_summary';

/** AI generator output — returned by generateWritingPrompt(). */
export interface AIWritingPrompt {
  id: string;
  level: LearnerLevel;
  topic: WritingTopic;
  prompt: string;
  word_limit: number;
  example_outline: string[];
}

export interface WritingPrompt {
  id: string;
  level: LearnerLevel;
  topic: WritingTopic;
  title: string;
  prompt: string;
  word_count_min: number;
  word_count_max: number;
  example_outline?: string[];
}

export type WritingPromptPublic = Omit<WritingPrompt, 'example_outline'> & {
  word_count_min: number;
  word_count_max: number;
};

export interface GetWritingPromptResult {
  prompt: WritingPromptPublic;
  effectiveLevel: LearnerLevel;
  difficultyLevel: number;
  hasMore: boolean;
  jsonRemaining: number;
}

export interface WritingMicroLesson {
  focus: string;
  tip: string;
  practice_task: string;
  example_paragraph: string;
}

import { EnrichedFeedback } from '../../content/enriched-feedback.interface';

export interface SubmitWritingResult extends EnrichedFeedback {
  correctedText: string;
  grammarFeedback: string;
  vocabularyFeedback: string;
  coherenceFeedback: string;
  structureFeedback: string;
  microLesson: WritingMicroLesson | null;
  xpEarned?: number;
  streak?: number;
  difficultyLevel?: number;
  errorPattern?: {
    module: string;
    concept: string;
    error_type: string;
  } | null;
}
