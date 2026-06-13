import { Test, TestingModule } from '@nestjs/testing';
import { AdaptiveService } from '../adaptive/adaptive.service';
import { createMockAdaptiveService } from '../adaptive/testing/mock-adaptive.service';
import { ErrorPatternsService } from '../error-patterns/error-patterns.service';
import { createMockErrorPatternsService } from '../error-patterns/testing/mock-error-patterns.service';
import { TutorFeedbackService } from '../ai/tutor-feedback.service';
import { GamificationService } from '../gamification/gamification.service';
import { MasteryService } from '../mastery/mastery.service';
import { WritingPracticeService } from './writing-practice.service';
import {
  AiWritingPromptGenerator,
  clearGeneratedWritingCache,
} from './utils/ai-writing-prompt-generator';
import { clearWritingAdaptiveProgress } from './utils/writing-adaptive-logic';
import { clearWritingPromptCache } from './utils/content-loader';
import {
  WritingEvaluator,
  clearWritingEvaluatorState,
} from './utils/writing-evaluator';

describe('WritingPracticeService', () => {
  let service: WritingPracticeService;

  beforeEach(async () => {
    clearWritingPromptCache();
    clearGeneratedWritingCache();
    clearWritingAdaptiveProgress();
    clearWritingEvaluatorState();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WritingPracticeService,
        AiWritingPromptGenerator,
        WritingEvaluator,
        TutorFeedbackService,
        {
          provide: GamificationService,
          useValue: {
            awardActivityXp: jest.fn().mockResolvedValue({
              xpEarned: 15,
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
          provide: AdaptiveService,
          useValue: createMockAdaptiveService(),
        },
        {
          provide: ErrorPatternsService,
          useValue: createMockErrorPatternsService(),
        },
      ],
    }).compile();

    service = module.get(WritingPracticeService);
  });

  it('returns one JSON writing prompt with task details', async () => {
    const result = await service.getWritingPrompt(
      'user-1',
      'beginner',
      'personal_paragraph',
    );

    expect(result.prompt.id).toMatch(/^beg_personal_paragraph_/);
    expect(result.prompt.prompt.length).toBeGreaterThan(20);
    expect(result.prompt.word_count_min).toBeGreaterThan(0);
    expect(result.jsonRemaining).toBe(2);
  });

  it('evaluates submitted writing and returns feedback fields', async () => {
    await service.getWritingPrompt('user-2', 'beginner', 'personal_paragraph');

    const result = await service.submitWriting(
      'user-2',
      'beginner',
      'personal_paragraph',
      'My name is Maria. I live in Lisbon and I like reading books every evening.',
    );

    expect(result.correctedText.length).toBeGreaterThan(0);
    expect(result.grammarFeedback.length).toBeGreaterThan(0);
    expect(result.vocabularyFeedback.length).toBeGreaterThan(0);
    expect(result.coherenceFeedback.length).toBeGreaterThan(0);
    expect(result.structureFeedback.length).toBeGreaterThan(0);
    expect(result.encouragement!.length).toBeGreaterThan(0);
  });

  it('returns an AI prompt when the JSON pool is exhausted', async () => {
    const userId = 'user-exhaust';
    const level = 'beginner' as const;
    const topic = 'personal_paragraph' as const;

    for (let i = 0; i < 3; i += 1) {
      const batch = await service.getWritingPrompt(userId, level, topic);
      await service.submitWriting(
        userId,
        level,
        topic,
        `My name is Alex. I live in Canada. I enjoy hobby number ${i} every week.`,
      );
      expect(batch.prompt.id).toBeTruthy();
    }

    const aiBatch = await service.getWritingPrompt(userId, level, topic);
    expect(aiBatch.prompt.id).toMatch(/^ai_.+_personal_paragraph_/);
    expect(aiBatch.jsonRemaining).toBe(0);
  });
});
