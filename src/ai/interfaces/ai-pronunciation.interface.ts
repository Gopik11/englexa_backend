export interface PronunciationInput {
  userId: string;
  text: string;
  sentenceId?: string;
  audioSimulated?: boolean;
}

export interface WordScore {
  word: string;
  score: number;
}

export interface PronunciationResult {
  overallScore: number;
  wordScores: WordScore[];
  feedback: string;
}

export interface AiPronunciationService {
  scorePronunciation(input: PronunciationInput): Promise<PronunciationResult>;
}

export const AI_PRONUNCIATION_SERVICE = Symbol('AI_PRONUNCIATION_SERVICE');
