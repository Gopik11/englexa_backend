import { Test, TestingModule } from '@nestjs/testing';
import { AdaptiveService } from '../adaptive/adaptive.service';
import { createMockAdaptiveService } from '../adaptive/testing/mock-adaptive.service';
import { ErrorPatternsService } from '../error-patterns/error-patterns.service';
import { createMockErrorPatternsService } from '../error-patterns/testing/mock-error-patterns.service';
import { TutorFeedbackService } from '../ai/tutor-feedback.service';
import { GamificationService } from '../gamification/gamification.service';
import { GRAMMAR_ANSWER_XP } from '../gamification/constants/grammar-gamification.constants';
import { ProgressService } from '../progress/progress.service';
import { GrammarPracticeService } from './grammar-practice.service';
import { AiExerciseGenerator, clearGeneratedExerciseCache } from './utils/ai-exercise-generator';
import { clearAdaptiveProgress } from './utils/adaptive-logic';
import { clearGrammarExerciseCache } from './utils/content-loader';

const mockProgressService = {
  incrementGrammarXP: jest.fn().mockResolvedValue({
    xpAwarded: GRAMMAR_ANSWER_XP,
    mastery: {
      concept: 'Articles',
      correctCount: 1,
      mistakeCount: 0,
      masteryScore: 100,
      xpEarned: GRAMMAR_ANSWER_XP,
    },
  }),
  recordGrammarMistake: jest.fn().mockResolvedValue({
    xpAwarded: 0,
    mastery: {
      concept: 'Articles',
      correctCount: 0,
      mistakeCount: 1,
      masteryScore: 0,
      xpEarned: 0,
    },
  }),
};

const mockGamificationService = {
  addXp: jest.fn().mockResolvedValue(100),
  updateStreak: jest.fn().mockResolvedValue(3),
  resetStreak: jest.fn().mockResolvedValue(0),
};

describe('GrammarPracticeService', () => {
  let service: GrammarPracticeService;

  beforeEach(async () => {
    clearGrammarExerciseCache();
    clearGeneratedExerciseCache();
    clearAdaptiveProgress();
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GrammarPracticeService,
        AiExerciseGenerator,
        TutorFeedbackService,
        { provide: ProgressService, useValue: mockProgressService },
        { provide: GamificationService, useValue: mockGamificationService },
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

    service = module.get(GrammarPracticeService);
  });

  it('returns up to 10 JSON exercises without answers', async () => {
    const result = await service.getExercises('user-1', 'beginner', 'articles');

    expect(result.exercises.length).toBe(10);
    expect(result.exercises[0]).not.toHaveProperty('correct_answer');
    expect(result.exercises[0]).not.toHaveProperty('explanation');
  });

  it('evaluates correct answers and returns explanation', async () => {
    const batch = await service.getExercises('user-2', 'beginner', 'articles');
    const exercise = batch.exercises[0]!;

    const jsonPool = service['resolveExercise'](
      exercise.id,
      'beginner',
      'articles',
    )!;

    const result = await service.submitAnswer(
      'user-2',
      exercise.id,
      jsonPool.correct_answer,
      'beginner',
      'articles',
    );

    expect(result.isCorrect).toBe(true);
    expect(result.normalizedUserAnswer).toBe(jsonPool.correct_answer.toLowerCase());
    expect(result.normalizedCorrectAnswer).toBe(jsonPool.correct_answer.toLowerCase());
    expect(result.explanation).toBe(jsonPool.explanation);
    expect(result.feedback).toBeNull();
    expect(mockProgressService.incrementGrammarXP).toHaveBeenCalled();
    expect(mockGamificationService.addXp).toHaveBeenCalledWith(
      'user-2',
      GRAMMAR_ANSWER_XP,
    );
    expect(mockGamificationService.updateStreak).toHaveBeenCalledWith('user-2');
    expect(result.xpEarned).toBe(GRAMMAR_ANSWER_XP);
    expect(result.currentStreak).toBe(3);
  });

  it('returns tutor feedback for incorrect answers via TutorFeedbackService', async () => {
    const batch = await service.getExercises('user-3', 'beginner', 'simple_past');
    const exercise = batch.exercises[0]!;

    const result = await service.submitAnswer(
      'user-3',
      exercise.id,
      'wrong answer',
      'beginner',
      'simple_past',
    );

    expect(result.isCorrect).toBe(false);
    expect(mockProgressService.recordGrammarMistake).toHaveBeenCalled();
    expect(mockGamificationService.resetStreak).toHaveBeenCalledWith('user-3');
    expect(result.xpEarned).toBe(0);
    expect(result.currentStreak).toBe(0);
    expect(result.feedback).toMatchObject({
      corrected_sentence: expect.any(String),
      grammar_feedback: expect.stringMatching(
        /You wrote:|Rule \(Past Tense\):|Why:|Example:/,
      ),
      vocabulary_feedback: expect.any(String),
      encouragement: expect.any(String),
      next_step: expect.any(String),
      micro_lesson: null,
    });
  });

  it('attaches a micro-lesson after repeated concept mistakes', async () => {
    const userId = 'user-micro';
    const topic = 'articles' as const;
    const level = 'beginner' as const;
    const batch = await service.getExercises(userId, level, topic);
    const exercise = batch.exercises[0]!;

    const first = await service.submitAnswer(userId, exercise.id, 'wrong', level, topic);
    expect(first.feedback?.micro_lesson).toBeNull();

    const second = await service.submitAnswer(
      userId,
      exercise.id,
      'still wrong',
      level,
      topic,
    );

    expect(second.feedback?.micro_lesson).toEqual(expect.any(String));
    expect(second.feedback?.micro_lesson).toContain('Examples:');
    expect(second.feedback?.grammar_feedback).toContain('You wrote:');
  });

  it('accepts alternative answers and normalized matches', async () => {
    const batch = await service.getExercises('user-alt', 'beginner', 'articles');
    const exercise = batch.exercises[0]!;

    const altResult = await service.submitAnswer(
      'user-alt',
      exercise.id,
      'A',
      'beginner',
      'articles',
    );

    expect(altResult.isCorrect).toBe(true);
  });

  it('includes AI exercises after 2+ mistakes on the same topic', async () => {
    const userId = 'user-4';
    const topic = 'prepositions' as const;
    const level = 'beginner' as const;

    const batch = await service.getExercises(userId, level, topic);
    const exercise = batch.exercises[0]!;

    await service.submitAnswer(userId, exercise.id, 'wrong', level, topic);
    await service.submitAnswer(userId, exercise.id, 'wrong', level, topic);

    const adaptive = await service.getExercises(userId, level, topic);
    const hasAi = adaptive.exercises.some((item) => item.id.startsWith('ai_'));

    expect(hasAi).toBe(true);
  });

  it('generateAIExercise returns a single public exercise', () => {
    const first = service.generateAIExercise('user-5', 'intermediate', 'articles');
    const second = service.generateAIExercise('user-5', 'intermediate', 'articles');

    expect(first.id).toMatch(/^ai_intermediate_articles_/);
    expect(second.id).not.toBe(first.id);
    expect(first).not.toHaveProperty('correct_answer');
  });

  it('serves AI-only batch after all JSON exercises are completed', async () => {
    const userId = 'user-json-exhaust';
    const level = 'beginner' as const;
    const topic = 'articles' as const;

    const first = await service.getExercises(userId, level, topic);
    expect(first.exercises.length).toBeGreaterThan(0);
    expect(first.exercises.every((item) => !item.id.startsWith('ai_'))).toBe(
      true,
    );

    let batch = first;
    while (batch.exercises.some((item) => !item.id.startsWith('ai_'))) {
      for (const exercise of batch.exercises) {
        if (exercise.id.startsWith('ai_')) {
          continue;
        }

        const full = service['resolveExercise'](exercise.id, level, topic)!;
        await service.submitAnswer(
          userId,
          exercise.id,
          full.correct_answer,
          level,
          topic,
        );
      }

      batch = await service.getExercises(userId, level, topic);
    }

    const afterJson = await service.getExercises(userId, level, topic);
    expect(afterJson.exercises.length).toBeGreaterThan(0);
    expect(afterJson.exercises.every((item) => item.id.startsWith('ai_'))).toBe(
      true,
    );
    expect(afterJson.jsonRemaining).toBe(0);
    expect(afterJson.hasMore).toBe(true);
  });

  it('raises effective level after consecutive correct answers', async () => {
    const userId = 'user-level-up';
    const level = 'beginner' as const;
    const topic = 'articles' as const;

    const batch = await service.getExercises(userId, level, topic);

    for (let i = 0; i < 3; i += 1) {
      const exercise = batch.exercises[i]!;
      const full = service['resolveExercise'](exercise.id, level, topic)!;
      const result = await service.submitAnswer(
        userId,
        exercise.id,
        full.correct_answer,
        level,
        topic,
      );

      if (i < 2) {
        expect(result.effectiveLevel).toBe('beginner');
      } else {
        expect(result.effectiveLevel).toBe('intermediate');
      }
    }
  });
});
