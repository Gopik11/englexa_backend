import { LearnerLevel } from '../../content/englexa-content-spec.constants';

export type SpeakingTopic =
  | 'self_introduction'
  | 'daily_routines'
  | 'travel_stories'
  | 'opinions'
  | 'presentations'
  | 'debates';

/** AI generator output — returned by generateSpeakingPrompt(). */
export interface AISpeakingPrompt {
  id: string;
  level: LearnerLevel;
  topic: SpeakingTopic;
  prompt: string;
  example_answer: string;
}

export interface SpeakingPrompt {
  id: string;
  level: LearnerLevel;
  topic: SpeakingTopic;
  title: string;
  /** Short instruction shown to the learner. */
  prompt: string;
  example_answer: string;
  /** Reference text for Azure pronunciation assessment. */
  reference_text: string;
  key_vocabulary: string[];
  time_limit_seconds: number;
}

/** Client-safe prompt (example answer withheld until after submit). */
export type SpeakingPromptPublic = Omit<
  SpeakingPrompt,
  'reference_text' | 'example_answer' | 'key_vocabulary'
>;

export interface GetSpeakingPromptResult {
  prompt: SpeakingPromptPublic;
  effectiveLevel: LearnerLevel;
  difficultyLevel: number;
  hasMore: boolean;
  jsonRemaining: number;
}

export interface SpeakingMicroLesson {
  focus: string;
  tip: string;
  practice_phrase: string;
  example_sentence: string;
}

import { EnrichedFeedback } from '../../content/enriched-feedback.interface';

export interface SubmitSpeakingAudioResult extends EnrichedFeedback {
  transcript: string;
  pronunciationScore: number;
  fluencyScore: number;
  grammarFeedback: string;
  vocabularyFeedback: string;
  microLesson: SpeakingMicroLesson | null;
  xpEarned?: number;
  streak?: number;
  difficultyLevel?: number;
  errorPattern?: {
    module: string;
    concept: string;
    error_type: string;
  } | null;
}
