export type AdaptiveModule =
  | 'grammar'
  | 'vocabulary'
  | 'reading'
  | 'speaking'
  | 'writing';

export interface DifficultyState {
  userId: string;
  module: AdaptiveModule;
  concept: string;
  attempts: number;
  correct: number;
  incorrect: number;
  streak: number;
  difficulty_level: number;
}

export interface RecordResultInput {
  userId: string;
  module: AdaptiveModule;
  concept: string;
  isCorrect: boolean;
}

export interface GetDifficultyQuery {
  module: AdaptiveModule;
  concept: string;
}
