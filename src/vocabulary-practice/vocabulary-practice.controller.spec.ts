import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VocabularyPracticeController } from './vocabulary-practice.controller';
import { VocabularyPracticeService } from './vocabulary-practice.service';

describe('VocabularyPracticeController', () => {
  let controller: VocabularyPracticeController;
  let service: jest.Mocked<VocabularyPracticeService>;

  beforeEach(async () => {
    service = {
      getExercises: jest.fn(),
      submitAnswer: jest.fn(),
      listTopics: jest.fn(),
      listTopicsForLevel: jest.fn(),
      generateAIVocabExercise: jest.fn(),
    } as unknown as jest.Mocked<VocabularyPracticeService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VocabularyPracticeController],
      providers: [{ provide: VocabularyPracticeService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(VocabularyPracticeController);
  });

  it('GET /vocabulary/:level/:topic calls getExercises', async () => {
    service.getExercises.mockResolvedValue({
      exercises: [],
      effectiveLevel: 'beginner',
      difficultyLevel: 1,
      hasMore: false,
      jsonRemaining: 0,
    });

    const response = await controller.getExercises(
      { sub: 'user-1' } as never,
      { level: 'beginner', topic: 'common_nouns' },
    );

    expect(service.getExercises).toHaveBeenCalledWith(
      'user-1',
      'beginner',
      'common_nouns',
    );
    expect(response.success).toBe(true);
  });

  it('rejects topic not valid for level', () => {
    expect(() =>
      controller.getExercises(
        { sub: 'user-1' } as never,
        { level: 'beginner', topic: 'idioms' },
      ),
    ).toThrow(BadRequestException);
  });

  it('POST /vocabulary/submit returns snake_case feedback fields', async () => {
    service.submitAnswer.mockResolvedValue({
      isCorrect: false,
      correctAnswer: 'bedroom',
      explanation: 'A bedroom is for sleeping.',
      exampleSentence: 'I read in my bedroom.',
      microLesson: null,
      concept_explanation: 'A bedroom is for sleeping.',
      examples: [],
      counter_examples: [],
      mini_tip: 'Link words to pictures.',
      encouragement: 'Nice try! Review the meaning and example, then practise again.',
      next_step: 'Try the next word.',
    });

    const response = await controller.submitAnswer(
      { sub: 'user-1' } as never,
      {
        exerciseId: 'beg_common_nouns_01',
        userAnswer: 'kitchen',
        level: 'beginner',
        topic: 'common_nouns',
      },
    );

    expect(response.data).toMatchObject({
      is_correct: false,
      correct_answer: 'bedroom',
      explanation: expect.any(String),
      example_sentence: expect.any(String),
      encouragement: expect.any(String),
      micro_lesson: null,
    });
  });
});
