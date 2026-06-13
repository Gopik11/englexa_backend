import { LearnerLevel } from '../../content/englexa-content-spec.constants';

export type ReadingTopic =
  | 'short_dialogues'
  | 'simple_stories'
  | 'news_snippets'
  | 'opinion_paragraphs'
  | 'essays'
  | 'argumentative_texts';

export type ReadingQuestionType = 'mcq' | 'short_answer';

export interface ReadingQuestion {
  id: string;
  type: ReadingQuestionType;
  question: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  /** Optional acceptable answers beyond [correct_answer]. */
  alternatives?: string[];
}

export interface ReadingPassage {
  id: string;
  level: LearnerLevel;
  topic: ReadingTopic;
  title: string;
  passage: string;
  questions: ReadingQuestion[];
}

/** Client-safe question (answers withheld until submit). */
export type ReadingQuestionPublic = Omit<
  ReadingQuestion,
  'correct_answer' | 'explanation' | 'alternatives'
>;

/** Client-safe passage returned from GET /reading/:level/:topic */
export interface ReadingPassagePublic {
  id: string;
  level: LearnerLevel;
  topic: ReadingTopic;
  title: string;
  passage: string;
  questions: ReadingQuestionPublic[];
}

export interface GetReadingPassageResult {
  passage: ReadingPassagePublic;
  effectiveLevel: LearnerLevel;
  difficultyLevel: number;
  hasMore: boolean;
  jsonRemaining: number;
}

import { EnrichedFeedback } from '../../content/enriched-feedback.interface';

export interface ReadingQuestionFeedback extends EnrichedFeedback {
  questionId: string;
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  errorPattern?: {
    module: string;
    concept: string;
    error_type: string;
  } | null;
}

export interface SubmitReadingAnswerResult {
  results: ReadingQuestionFeedback[];
  passageComplete: boolean;
  xpEarned?: number;
  streak?: number;
  difficultyLevel?: number;
  error_patterns?: Array<{
    module: string;
    concept: string;
    error_type: string;
  }>;
}
