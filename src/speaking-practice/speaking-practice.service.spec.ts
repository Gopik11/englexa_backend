import { Test, TestingModule } from '@nestjs/testing';
import { AdaptiveService } from '../adaptive/adaptive.service';
import { createMockAdaptiveService } from '../adaptive/testing/mock-adaptive.service';
import { ErrorPatternsService } from '../error-patterns/error-patterns.service';
import { createMockErrorPatternsService } from '../error-patterns/testing/mock-error-patterns.service';
import { AI_PRONUNCIATION_SERVICE } from '../ai/interfaces/ai-pronunciation.interface';
import { GamificationService } from '../gamification/gamification.service';
import { MasteryService } from '../mastery/mastery.service';
import { ProfileService } from '../profile/profile.service';
import { MockAiPronunciationService } from '../ai/mocks/mock-ai-pronunciation.service';
import { AiContentProviderService } from '../modules/content-pipeline/providers/ai-content-provider.service';
import { SpeakingPracticeService } from './speaking-practice.service';
import {
  AiSpeakingPromptGenerator,
  clearGeneratedSpeakingCache,
} from './utils/ai-speaking-prompt-generator';
import { clearSpeakingAdaptiveProgress } from './utils/speaking-adaptive-logic';
import { clearSpeakingPromptCache } from './utils/content-loader';
import {
  SpeakingEvaluator,
  clearSpeakingEvaluatorState,
} from './utils/speaking-evaluator';

const sampleAudio = {
  audioBase64: Buffer.from('fake-recording').toString('base64'),
  mimeType: 'audio/mp4',
};

describe('SpeakingPracticeService', () => {
  let service: SpeakingPracticeService;

  beforeEach(async () => {
    clearSpeakingPromptCache();
    clearGeneratedSpeakingCache();
    clearSpeakingAdaptiveProgress();
    clearSpeakingEvaluatorState();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpeakingPracticeService,
        AiSpeakingPromptGenerator,
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
        {
          provide: GamificationService,
          useValue: {
            awardActivityXp: jest.fn().mockResolvedValue({
              xpEarned: 10,
              streak: 1,
            }),
          },
        },
        {
          provide: MasteryService,
          useValue: {
            recordConceptActivity: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: ProfileService,
          useValue: {
            awardXpForActivity: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: AdaptiveService,
          useValue: createMockAdaptiveService(),
        },
        {
          provide: ErrorPatternsService,
          useValue: createMockErrorPatternsService(),
        },
      ],
    }).compile();

    service = module.get(SpeakingPracticeService);
  });

  it('returns one JSON speaking prompt without reference text', async () => {
    const result = await service.getSpeakingPrompt(
      'user-1',
      'beginner',
      'self_introduction',
    );

    expect(result.prompt.id).toMatch(/^beg_self_introduction_/);
    expect(result.prompt.prompt.length).toBeGreaterThan(10);
    expect(result.prompt).not.toHaveProperty('reference_text');
    expect(result.prompt).not.toHaveProperty('example_answer');
    expect(result.jsonRemaining).toBe(2);
  });

  it('evaluates submitted audio and returns assessment fields', async () => {
    const batch = await service.getSpeakingPrompt(
      'user-2',
      'beginner',
      'daily_routines',
    );

    const result = await service.submitSpeakingAudio(
      'user-2',
      batch.prompt.id,
      sampleAudio,
      'beginner',
      'daily_routines',
    );

    expect(result.transcript.length).toBeGreaterThan(0);
    expect(result.pronunciationScore).toBeGreaterThanOrEqual(40);
    expect(result.pronunciationScore).toBeLessThanOrEqual(100);
    expect(result.fluencyScore).toBeGreaterThanOrEqual(40);
    expect(result.grammarFeedback.length).toBeGreaterThan(0);
    expect(result.vocabularyFeedback.length).toBeGreaterThan(0);
    expect(result.encouragement!.length).toBeGreaterThan(0);
  });

  it('returns an AI prompt when the JSON pool is exhausted', async () => {
    const userId = 'user-exhaust';
    const level = 'beginner' as const;
    const topic = 'self_introduction' as const;

    for (let i = 0; i < 3; i += 1) {
      const batch = await service.getSpeakingPrompt(userId, level, topic);
      await service.submitSpeakingAudio(
        userId,
        batch.prompt.id,
        sampleAudio,
        level,
        topic,
      );
    }

    const aiBatch = await service.getSpeakingPrompt(userId, level, topic);
    expect(aiBatch.prompt.id).toMatch(/^ai_.+_self_introduction_/);
    expect(aiBatch.jsonRemaining).toBe(0);
  });
});
