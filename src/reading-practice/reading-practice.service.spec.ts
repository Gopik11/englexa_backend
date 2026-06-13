import { Test, TestingModule } from '@nestjs/testing';
import { AdaptiveService } from '../adaptive/adaptive.service';
import { createMockAdaptiveService } from '../adaptive/testing/mock-adaptive.service';
import { ErrorPatternsService } from '../error-patterns/error-patterns.service';
import { createMockErrorPatternsService } from '../error-patterns/testing/mock-error-patterns.service';
import { GamificationService } from '../gamification/gamification.service';
import { MasteryService } from '../mastery/mastery.service';
import { ReadingPracticeService } from './reading-practice.service';
import { AiReadingGenerator, clearGeneratedReadingCache } from './utils/ai-reading-generator';
import { clearReadingAdaptiveProgress } from './utils/reading-adaptive-logic';
import { clearReadingPassageCache } from './utils/content-loader';

describe('ReadingPracticeService', () => {
  let service: ReadingPracticeService;

  beforeEach(async () => {
    clearReadingPassageCache();
    clearGeneratedReadingCache();
    clearReadingAdaptiveProgress();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadingPracticeService,
        AiReadingGenerator,
        {
          provide: GamificationService,
          useValue: {
            awardActivityXp: jest.fn().mockResolvedValue({
              xpEarned: 10,
              streak: 1,
            }),
            recordActivity: jest.fn().mockResolvedValue(1),
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

    service = module.get(ReadingPracticeService);
  });

  it('returns one JSON passage with public questions', async () => {
    const result = await service.getPassage('user-1', 'beginner', 'short_dialogues');

    expect(result.passage.id).toMatch(/^beg_short_dialogues_/);
    expect(result.passage.questions.length).toBeGreaterThanOrEqual(3);
    expect(result.passage.questions[0]).not.toHaveProperty('correct_answer');
    expect(result.jsonRemaining).toBe(4);
  });

  it('evaluates all submitted answers and returns feedback array', async () => {
    const batch = await service.getPassage('user-2', 'beginner', 'simple_stories');
    const full = service['resolvePassage'](
      batch.passage.id,
      'beginner',
      'simple_stories',
    )!;

    const answers = full.questions.map((question) => ({
      questionId: question.id,
      userAnswer: question.correct_answer,
    }));

    const result = await service.submitAnswer(
      'user-2',
      batch.passage.id,
      answers,
      'beginner',
      'simple_stories',
    );

    expect(result.results).toHaveLength(full.questions.length);
    expect(result.results.every((item) => item.isCorrect)).toBe(true);
    expect(result.results[0]).toMatchObject({
      questionId: expect.any(String),
      correctAnswer: expect.any(String),
      explanation: expect.any(String),
      encouragement: expect.any(String),
    });
    expect(result.passageComplete).toBe(true);
  });

  it('returns an AI passage when the JSON pool is exhausted', async () => {
    const userId = 'user-exhaust';
    const level = 'beginner' as const;
    const topic = 'short_dialogues' as const;

    for (let i = 0; i < 5; i += 1) {
      const batch = await service.getPassage(userId, level, topic);
      const full = service['resolvePassage'](batch.passage.id, level, topic)!;
      const answers = full.questions.map((question) => ({
        questionId: question.id,
        userAnswer: question.correct_answer,
      }));
      await service.submitAnswer(userId, batch.passage.id, answers, level, topic);
    }

    const aiBatch = await service.getPassage(userId, level, topic);
    expect(aiBatch.passage.id).toMatch(/^ai_.+_short_dialogues_/);
    expect(aiBatch.jsonRemaining).toBe(0);
  });
});
