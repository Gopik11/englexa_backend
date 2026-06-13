import { Test, TestingModule } from '@nestjs/testing';
import { AI_PRONUNCIATION_SERVICE } from '../../ai/interfaces/ai-pronunciation.interface';
import { MockAiPronunciationService } from '../../ai/mocks/mock-ai-pronunciation.service';
import { SpeakingPrompt } from '../interfaces/speaking-prompt.interface';
import {
  SpeakingEvaluator,
  clearSpeakingEvaluatorState,
} from './speaking-evaluator';

const samplePrompt: SpeakingPrompt = {
  id: 'beg_self_introduction_01',
  level: 'beginner',
  topic: 'self_introduction',
  title: 'Say hello',
  prompt: 'Introduce yourself.',
  example_answer: 'Hello, my name is Alex and I am from Canada.',
  reference_text: 'Hello, my name is Alex and I am from Canada.',
  key_vocabulary: ['hello', 'name', 'from'],
  time_limit_seconds: 30,
};

describe('SpeakingEvaluator', () => {
  let evaluator: SpeakingEvaluator;

  beforeEach(async () => {
    clearSpeakingEvaluatorState();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpeakingEvaluator,
        {
          provide: AI_PRONUNCIATION_SERVICE,
          useClass: MockAiPronunciationService,
        },
      ],
    }).compile();

    evaluator = module.get(SpeakingEvaluator);
  });

  it('returns transcript, scores, and feedback', async () => {
    const result = await evaluator.evaluateSpeaking({
      userId: 'user-a',
      prompt: samplePrompt,
      audio: { audioBlobRef: 'stable-blob-ref' },
      level: 'beginner',
    });

    expect(result.transcript).toBeTruthy();
    expect(result.pronunciationScore).toBeGreaterThanOrEqual(40);
    expect(result.fluencyScore).toBeGreaterThanOrEqual(40);
    expect(result.grammarFeedback).toBeTruthy();
    expect(result.vocabularyFeedback).toBeTruthy();
    expect(result.encouragement).toBeTruthy();
  });

  it('can return a micro-lesson after repeated low scores', async () => {
    const lowScoreModule = await Test.createTestingModule({
      providers: [
        SpeakingEvaluator,
        {
          provide: AI_PRONUNCIATION_SERVICE,
          useValue: {
            scorePronunciation: async () => ({
              overallScore: 55,
              wordScores: [{ word: 'hello', score: 50 }],
              feedback: 'Focus on clearer vowel sounds.',
            }),
          },
        },
      ],
    }).compile();

    const lowScoreEvaluator = lowScoreModule.get(SpeakingEvaluator);
    const audio = { audioBlobRef: 'low-score-blob' };

    await lowScoreEvaluator.evaluateSpeaking({
      userId: 'user-b',
      prompt: samplePrompt,
      audio,
      level: 'beginner',
    });

    const second = await lowScoreEvaluator.evaluateSpeaking({
      userId: 'user-b',
      prompt: samplePrompt,
      audio,
      level: 'beginner',
    });

    expect(second.microLesson).not.toBeNull();
    expect(second.microLesson?.practice_phrase).toBe(samplePrompt.reference_text);
  });
});
