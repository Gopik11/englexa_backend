export interface EvaluationInput {
  userId: string;
  prompt: string;
  userAnswer: string;
  expectedAnswer?: string;
}

export interface EvaluationResult {
  score: number;
  isCorrect: boolean;
  feedback: string;
  hints: string[];
}

export interface AiEvaluationService {
  evaluateAnswer(input: EvaluationInput): Promise<EvaluationResult>;
}

export const AI_EVALUATION_SERVICE = Symbol('AI_EVALUATION_SERVICE');
