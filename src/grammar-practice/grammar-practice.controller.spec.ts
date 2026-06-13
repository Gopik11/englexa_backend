import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GrammarPracticeController } from './grammar-practice.controller';
import { GrammarPracticeService } from './grammar-practice.service';

describe('GrammarPracticeController', () => {
  let controller: GrammarPracticeController;
  let service: jest.Mocked<GrammarPracticeService>;

  beforeEach(async () => {
    service = {
      getExercises: jest.fn(),
      submitAnswer: jest.fn(),
      listTopics: jest.fn(),
      listTopicsForLevel: jest.fn(),
      generateAIExercise: jest.fn(),
    } as unknown as jest.Mocked<GrammarPracticeService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GrammarPracticeController],
      providers: [{ provide: GrammarPracticeService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(GrammarPracticeController);
  });

  it('GET /grammar/:level/:topic calls getExercises', async () => {
    service.getExercises.mockResolvedValue({
      exercises: [],
      effectiveLevel: 'beginner',
      difficultyLevel: 1,
      hasMore: false,
      jsonRemaining: 0,
    });

    const response = await controller.getExercises(
      { sub: 'user-1' } as never,
      { level: 'beginner', topic: 'articles' },
    );

    expect(service.getExercises).toHaveBeenCalledWith(
      'user-1',
      'beginner',
      'articles',
    );
    expect(response.success).toBe(true);
  });

  it('rejects topic not valid for level', () => {
    expect(() =>
      controller.getExercises(
        { sub: 'user-1' } as never,
        { level: 'beginner', topic: 'conditionals' },
      ),
    ).toThrow(BadRequestException);
  });

  it('POST /grammar/submit returns tutor-style feedback fields', async () => {
    service.submitAnswer.mockResolvedValue({
      isCorrect: false,
      correctAnswer: 'walked',
      normalizedUserAnswer: 'walk',
      normalizedCorrectAnswer: 'walked',
      explanation: 'Regular verbs form the past tense by adding -ed.',
      effectiveLevel: 'beginner',
      difficultyLevel: 2,
      topicMistakeCount: 1,
      grammarProgress: {
        xpAwarded: 0,
        mastery: {
          concept: 'Past Tense',
          correctCount: 0,
          mistakeCount: 1,
          masteryScore: 0,
          xpEarned: 0,
        },
      },
      xpEarned: 0,
      currentStreak: 0,
      feedback: {
        corrected_sentence: 'Yesterday, I walked to school.',
        grammar_feedback: 'Good attempt. Your verb tense needs a small fix.',
        vocabulary_feedback: 'Nice choice!',
        encouragement: 'You\'re learning quickly.',
        next_step: 'Try using this word in a question next.',
        micro_lesson: null,
        concept_explanation: 'Past tense rule explanation.',
        examples: [{ text: 'Yesterday, I walked to school.', isCorrect: true }],
        counter_examples: [],
        mini_tip: 'Spot time words first.',
      },
    });

    const response = await controller.submitAnswer(
      { sub: 'user-1' } as never,
      {
        exerciseId: 'beg_simple_past_01',
        userAnswer: 'walk',
        level: 'beginner',
        topic: 'simple_past',
      },
    );

    expect(service.submitAnswer).toHaveBeenCalled();
    expect(response.data).toMatchObject({
      isCorrect: false,
      normalizedUserAnswer: 'walk',
      normalizedCorrectAnswer: 'walked',
      xpEarned: 0,
      currentStreak: 0,
      conceptMastery: {
        concept: 'Past Tense',
        mistakeCount: 1,
      },
      corrected_sentence: 'Yesterday, I walked to school.',
      grammar_feedback: expect.any(String),
      vocabulary_feedback: expect.any(String),
      encouragement: expect.any(String),
      next_step: expect.any(String),
      micro_lesson: null,
    });
  });
});
