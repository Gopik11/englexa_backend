import { LearnerLevel } from '../../content/englexa-content-spec.constants';

export type GrammarExerciseType =
  | 'fill_blank'
  | 'correction'
  | 'mcq'
  | 'rewrite'
  | 'short_answer';

export type GrammarTopic =
  | 'articles'
  | 'simple_present'
  | 'simple_past'
  | 'prepositions'
  | 'subject_verb'
  | 'basic_structure'
  | 'present_vs_continuous'
  | 'past_vs_continuous'
  | 'countable_uncountable'
  | 'comparatives'
  | 'modals'
  | 'adverbs'
  | 'conditionals'
  | 'relative_clauses'
  | 'passive_voice'
  | 'reported_speech'
  | 'perfect_tenses'
  | 'connectors';

export interface GrammarExercise {
  id: string;
  level: LearnerLevel;
  topic: GrammarTopic;
  type: GrammarExerciseType;
  question: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  /** Optional acceptable answers beyond [correct_answer]. */
  alternatives?: string[];
}

/** Client-safe exercise (answers withheld until submit). */
export type GrammarExercisePublic = Omit<
  GrammarExercise,
  'correct_answer' | 'explanation' | 'alternatives'
>;

export interface GetExercisesResult {
  exercises: GrammarExercisePublic[];
  effectiveLevel: LearnerLevel;
  difficultyLevel: number;
  hasMore: boolean;
  jsonRemaining: number;
}

import { TutorFeedbackJson } from '../../ai/interfaces/tutor-feedback.interface';
import { GrammarProgressUpdate } from '../../progress/interfaces/grammar-concept-progress.interface';

export interface SubmitAnswerResult {
  isCorrect: boolean;
  correctAnswer: string;
  normalizedUserAnswer: string;
  normalizedCorrectAnswer: string;
  explanation: string;
  feedback: TutorFeedbackJson;
  effectiveLevel: LearnerLevel;
  difficultyLevel: number;
  errorPattern?: {
    module: string;
    concept: string;
    error_type: string;
  } | null;
  topicMistakeCount: number;
  grammarProgress: GrammarProgressUpdate | null;
  xpEarned: number;
  currentStreak: number;
}

import { GrammarRuleKey } from '../../content/englexa-content-spec.constants';

export interface GrammarExerciseBlueprint {
  type: GrammarExerciseType;
  question: string;
  options: string[] | null;
  correct_answer: string;
  ruleKey: GrammarRuleKey;
  exampleSentence: string;
  /** Sentence passed to tutor engine when the learner is wrong. */
  sampleWrongSentence: string;
}
