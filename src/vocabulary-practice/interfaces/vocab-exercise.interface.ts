import { LearnerLevel } from '../../content/englexa-content-spec.constants';

export type VocabExerciseType = 'mcq' | 'fill_in' | 'match';

export type VocabTopic =
  | 'common_nouns'
  | 'common_verbs'
  | 'adjectives'
  | 'everyday_phrases'
  | 'phrasal_verbs'
  | 'collocations'
  | 'synonyms_antonyms'
  | 'topic_travel'
  | 'idioms'
  | 'academic_words'
  | 'topic_business'
  | 'topic_technology';

export interface VocabExercise {
  id: string;
  level: LearnerLevel;
  topic: VocabTopic;
  type: VocabExerciseType;
  question: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  example_sentence: string;
  alternatives?: string[];
}

export type VocabExercisePublic = Omit<
  VocabExercise,
  'correct_answer' | 'explanation' | 'example_sentence' | 'alternatives'
>;

export interface GetVocabExercisesResult {
  exercises: VocabExercisePublic[];
  effectiveLevel: LearnerLevel;
  difficultyLevel: number;
  hasMore: boolean;
  jsonRemaining: number;
}

export interface VocabMicroLesson {
  word: string;
  meaning: string;
  collocations: string[];
  example_sentence: string;
}

import { EnrichedFeedback } from '../../content/enriched-feedback.interface';

export interface SubmitVocabAnswerResult extends EnrichedFeedback {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  exampleSentence: string;
  microLesson: VocabMicroLesson | null;
  xpEarned?: number;
  streak?: number;
  difficultyLevel?: number;
  errorPattern?: {
    module: string;
    concept: string;
    error_type: string;
  } | null;
}

export interface VocabExerciseBlueprint {
  type: VocabExerciseType;
  question: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  example_sentence: string;
  collocations: string[];
}
