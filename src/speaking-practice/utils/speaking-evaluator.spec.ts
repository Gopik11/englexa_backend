import { Test, TestingModule } from '@nestjs/testing';
import { AI_PRONUNCIATION_SERVICE } from '../../ai/interfaces/ai-pronunciation.interface';
import { MockAiPronunciationService } from '../../ai/mocks/mock-ai-pronunciation.service';
import { AiContentProviderService } from '../../modules/content-pipeline/providers/ai-content-provider.service';
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
        {
          provide: AiContentProviderService,
          useValue: {
            speechToText: jest.fn().mockResolvedValue({ text: '', language: 'en' }),
          },
        },
      ],
    }).compile();

    evaluator = module.get(SpeakingEvaluator);
  });

  it('returns transcript, scores, and feedback', async () => {
    const result = await evaluator.evaluateSpeaking({
      userId: 'user-a',
      prompt: samplePrompt,
      audio: { audioBase64: Buffer.from('fake-audio').toString('base64') },
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
            scorePronunciation: jest.fn().mockResolvedValue({
              overallScore: 55,
              wordScores: [{ word: 'hello', score: 60 }],
            }),
          },
        },
        {
          provide: AiContentProviderService,
          useValue: {
            speechToText: jest.fn().mockResolvedValue({ text: '', language: 'en' }),
          },
        },
      ],
    }).compile();

    const lowEvaluator = lowScoreModule.get(SpeakingEvaluator);

    await lowEvaluator.evaluateSpeaking({
      userId: 'user-b',
      prompt: samplePrompt,
      audio: { audioBase64: 'abc' },
      level: 'beginner',
    });
    const second = await lowEvaluator.evaluateSpeaking({
      userId: 'user-b',
      prompt: samplePrompt,
      audio: { audioBase64: 'abc' },
      level: 'beginner',
    });

    expect(second.microLesson).not.toBeNull();
  });
});
