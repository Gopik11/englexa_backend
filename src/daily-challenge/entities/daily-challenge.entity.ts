export type ChallengeModule =
  | 'grammar'
  | 'vocabulary'
  | 'reading'
  | 'speaking'
  | 'writing';

export type ChallengeSource = 'srs_review' | 'weak_area' | 'daily_random';

export interface ChallengePayload {
  type: ChallengeModule;
  concept: string;
  difficulty: number;
  question: string;
  options?: string[];
  answer?: string;
  prompt?: string;
  source?: ChallengeSource;
}

export interface DailyChallenge {
  id?: string;
  userId: string;
  date: Date;
  challenge: ChallengePayload;
  completed: boolean;
  score?: number;
}

export interface SubmitChallengeDto {
  answer: string;
}

export interface SubmitChallengeResult {
  challenge: DailyChallenge;
  correct: boolean;
  score: number;
  feedback: string;
}
