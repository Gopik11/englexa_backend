import { Injectable } from '@nestjs/common';
import {
  AiPronunciationService,
  PronunciationInput,
  PronunciationResult,
  WordScore,
} from '../interfaces/ai-pronunciation.interface';

@Injectable()
export class MockAiPronunciationService implements AiPronunciationService {
  async scorePronunciation(input: PronunciationInput): Promise<PronunciationResult> {
    const words = input.text
      .replace(/[^\w\s']/g, '')
      .split(/\s+/)
      .filter(Boolean);

    const wordScores: WordScore[] = words.map((word, index) => ({
      word,
      score: this.deterministicScore(word, index),
    }));

    const overallScore =
      wordScores.length > 0
        ? Math.round(
            wordScores.reduce((sum, item) => sum + item.score, 0) /
              wordScores.length,
          )
        : 0;

    return {
      overallScore,
      wordScores,
      feedback:
        overallScore >= 80
          ? 'Great pronunciation! Keep practicing natural rhythm.'
          : 'Focus on stressing the highlighted lower-scoring words.',
    };
  }

  private deterministicScore(word: string, index: number): number {
    const base = 55 + (word.length % 5) * 8 + (index % 3) * 5;
    return Math.min(100, Math.max(40, base));
  }
}
