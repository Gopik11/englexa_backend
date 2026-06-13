import { Test, TestingModule } from '@nestjs/testing';
import { AdaptiveService } from '../adaptive/adaptive.service';
import { createMockAdaptiveService } from '../adaptive/testing/mock-adaptive.service';
import { ErrorPatternsService } from '../error-patterns/error-patterns.service';
import { createMockErrorPatternsService } from '../error-patterns/testing/mock-error-patterns.service';
import { GamificationService } from '../gamification/gamification.service';
import { MasteryService } from '../mastery/mastery.service';
import { VocabularyPracticeService } from './vocabulary-practice.service';
import { AiVocabGenerator, clearGeneratedVocabCache } from './utils/ai-vocab-generator';
import { clearVocabAdaptiveProgress } from './utils/vocab-adaptive-logic';
import { clearVocabExerciseCache } from './utils/content-loader';

describe('VocabularyPracticeService', () => {
  let service: VocabularyPracticeService;

  beforeEach(async () => {
    clearVocabExerciseCache();
    clearGeneratedVocabCache();
    clearVocabAdaptiveProgress();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VocabularyPracticeService,
        AiVocabGenerator,
        {
          provide: GamificationService,
          useValue: {
            awardActivityXp: jest.fn().mockResolvedValue({
              xpEarned: 3,
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

    service = module.get(VocabularyPracticeService);
  });

  it('returns up to 10 JSON exercises without answers', async () => {
    const result = await service.getExercises('user-1', 'beginner', 'common_nouns');

    expect(result.exercises.length).toBe(10);
    expect(result.exercises[0]).not.toHaveProperty('correct_answer');
    expect(result.exercises[0]).not.toHaveProperty('explanation');
    expect(result.exercises[0]).not.toHaveProperty('example_sentence');
  });

  it('evaluates correct answers with normalization', async () => {
    const batch = await service.getExercises('user-2', 'beginner', 'common_nouns');
    const exercise = batch.exercises[0]!;
    const full = service['resolveExercise'](
      exercise.id,
      'beginner',
      'common_nouns',
    )!;

    const result = await service.submitAnswer(
      'user-2',
      exercise.id,
      full.correct_answer.toUpperCase(),
      'beginner',
      'common_nouns',
    );

    expect(result.isCorrect).toBe(true);
    expect(result.explanation).toBe(full.explanation);
    expect(result.exampleSentence).toBe(full.example_sentence);
    expect(result.microLesson).toBeNull();
  });

  it('returns encouragement and explanation for incorrect answers', async () => {
    const batch = await service.getExercises('user-3', 'beginner', 'adjectives');
    const exercise = batch.exercises[0]!;

    const result = await service.submitAnswer(
      'user-3',
      exercise.id,
      'wrong answer',
      'beginner',
      'adjectives',
    );

    expect(result.isCorrect).toBe(false);
    expect(result.correctAnswer).toBeTruthy();
    expect(result.explanation).toBeTruthy();
    expect(result.exampleSentence).toBeTruthy();
    expect(result.encouragement).toBeTruthy();
    expect(result.microLesson).toBeNull();
  });

  it('attaches a micro-lesson after repeated word mistakes', async () => {
    const userId = 'user-micro';
    const topic = 'common_verbs' as const;
    const level = 'beginner' as const;
    const batch = await service.getExercises(userId, level, topic);
    const exercise = batch.exercises[0]!;

    await service.submitAnswer(userId, exercise.id, 'wrong', level, topic);
    const second = await service.submitAnswer(
      userId,
      exercise.id,
      'still wrong',
      level,
      topic,
    );

    expect(second.microLesson).toMatchObject({
      word: expect.any(String),
      meaning: expect.any(String),
      collocations: expect.any(Array),
      example_sentence: expect.any(String),
    });
  });

  it('includes AI exercises after 2+ topic mistakes', async () => {
    const userId = 'user-ai';
    const topic = 'phrasal_verbs' as const;
    const level = 'intermediate' as const;
    const batch = await service.getExercises(userId, level, topic);
    const exercise = batch.exercises[0]!;

    await service.submitAnswer(userId, exercise.id, 'wrong', level, topic);
    await service.submitAnswer(userId, exercise.id, 'wrong', level, topic);

    const adaptive = await service.getExercises(userId, level, topic);
    const hasAi = adaptive.exercises.some((item) => item.id.startsWith('ai_'));

    expect(hasAi).toBe(true);
  });

  it('serves AI-only batch after JSON pool is exhausted', async () => {
    const userId = 'user-exhaust';
    const level = 'beginner' as const;
    const topic = 'common_nouns' as const;

    let batch = await service.getExercises(userId, level, topic);

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
    expect(afterJson.exercises.every((item) => item.id.startsWith('ai_'))).toBe(
      true,
    );
    expect(afterJson.jsonRemaining).toBe(0);
  });

  it('generateAIVocabExercise returns a single public exercise', () => {
    const first = service.generateAIVocabExercise(
      'user-ai-single',
      'intermediate',
      'collocations',
    );
    const second = service.generateAIVocabExercise(
      'user-ai-single',
      'intermediate',
      'collocations',
    );

    expect(first.id).toMatch(/^ai_intermediate_collocations_/);
    expect(second.id).not.toBe(first.id);
    expect(first).not.toHaveProperty('correct_answer');
  });
});
