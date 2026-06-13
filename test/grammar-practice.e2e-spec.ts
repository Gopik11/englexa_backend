import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TutorFeedbackService } from '../src/ai/tutor-feedback.service';
import { GrammarPracticeController } from '../src/grammar-practice/grammar-practice.controller';
import { GrammarPracticeService } from '../src/grammar-practice/grammar-practice.service';
import { ProgressService } from '../src/progress/progress.service';
import { GamificationService } from '../src/gamification/gamification.service';
import { GRAMMAR_ANSWER_XP } from '../src/gamification/constants/grammar-gamification.constants';
import { clearAdaptiveProgress } from '../src/grammar-practice/utils/adaptive-logic';
import { AiExerciseGenerator, clearGeneratedExerciseCache } from '../src/grammar-practice/utils/ai-exercise-generator';
import { clearGrammarExerciseCache, loadGrammarExercises } from '../src/grammar-practice/utils/content-loader';
import * as path from 'path';

class MockJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = {
      sub: 'grammar-e2e-user',
      email: 'grammar-e2e@test.com',
      role: 'LEARNER',
    };
    return true;
  }
}

describe('GrammarPracticeController (e2e — full flow)', () => {
  let app: INestApplication;
  let articlesContent: Array<{ id: string; correct_answer: string }>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [GrammarPracticeController],
      providers: [
        GrammarPracticeService,
        AiExerciseGenerator,
        TutorFeedbackService,
        {
          provide: ProgressService,
          useValue: {
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
          },
        },
        {
          provide: GamificationService,
          useValue: {
            addXp: jest.fn().mockResolvedValue(100),
            updateStreak: jest.fn().mockResolvedValue(3),
            resetStreak: jest.fn().mockResolvedValue(0),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    articlesContent = loadGrammarExercises(
      'beginner',
      'articles',
      path.join(__dirname, '../src/grammar-practice'),
    );
  });

  beforeEach(() => {
    clearGrammarExerciseCache();
    clearGeneratedExerciseCache();
    clearAdaptiveProgress();
  });

  afterAll(async () => {
    await app.close();
  });

  it('runs the full grammar practice flow over HTTP', async () => {
    const server = app.getHttpServer();

    // 1. Select level + topic → load JSON exercises
    const loadResponse = await request(server)
      .get('/api/v1/grammar/beginner/articles')
      .expect(200);

    expect(loadResponse.body.success).toBe(true);
    const batch = loadResponse.body.data;
    expect(batch.exercises).toHaveLength(10);
    expect(batch.effectiveLevel).toBe('beginner');
    expect(batch.jsonRemaining).toBeGreaterThan(0);
    expect(batch.hasMore).toBe(true);
    expect(batch.exercises[0]).not.toHaveProperty('correct_answer');
    expect(batch.exercises.every((item: { id: string }) => !item.id.startsWith('ai_'))).toBe(
      true,
    );

    const firstExercise = batch.exercises[0] as { id: string };

    // 2. Submit wrong answer → tutor feedback
    const wrongResponse = await request(server)
      .post('/api/v1/grammar/submit')
      .send({
        exerciseId: firstExercise.id,
        userAnswer: 'wrong answer',
        level: 'beginner',
        topic: 'articles',
      })
      .expect(201);

    const wrongData = wrongResponse.body.data;
    expect(wrongData.isCorrect).toBe(false);
    expect(wrongData.xpEarned).toBe(0);
    expect(wrongData.currentStreak).toBe(0);
    expect(wrongData.conceptMastery).toMatchObject({
      mistakeCount: 1,
      masteryScore: 0,
    });
    expect(wrongData.correctAnswer).toBeTruthy();
    expect(wrongData.explanation).toBeTruthy();
    expect(wrongData.grammar_feedback).toEqual(expect.any(String));
    expect(wrongData.corrected_sentence).toEqual(expect.any(String));
    expect(wrongData.encouragement).toEqual(expect.any(String));

    // 3. Second mistake on same topic → triggers AI in next batch
    await request(server)
      .post('/api/v1/grammar/submit')
      .send({
        exerciseId: firstExercise.id,
        userAnswer: 'still wrong',
        level: 'beginner',
        topic: 'articles',
      })
      .expect(201);

    const adaptiveResponse = await request(server)
      .get('/api/v1/grammar/beginner/articles')
      .expect(200);

    const adaptiveBatch = adaptiveResponse.body.data;
    expect(
      adaptiveBatch.exercises.some((item: { id: string }) =>
        item.id.startsWith('ai_'),
      ),
    ).toBe(true);

    // 4. Complete all JSON exercises → AI-only batch
    const jsonById = new Map(
      articlesContent.map((item) => [item.id, item.correct_answer]),
    );

    let currentBatch = batch.exercises as Array<{ id: string }>;
    while (currentBatch.some((item) => !item.id.startsWith('ai_'))) {
      for (const exercise of currentBatch) {
        if (exercise.id.startsWith('ai_')) {
          continue;
        }

        const correctAnswer = jsonById.get(exercise.id);
        expect(correctAnswer).toBeDefined();

        const submitResponse = await request(server)
          .post('/api/v1/grammar/submit')
          .send({
            exerciseId: exercise.id,
            userAnswer: correctAnswer,
            level: 'beginner',
            topic: 'articles',
          })
          .expect(201);

        if (submitResponse.body.data.isCorrect) {
          expect(submitResponse.body.data.grammar_feedback).toBe('');
          expect(submitResponse.body.data.xpEarned).toBe(GRAMMAR_ANSWER_XP);
          expect(submitResponse.body.data.currentStreak).toBe(3);
        }
      }

      const nextBatchResponse = await request(server)
        .get('/api/v1/grammar/beginner/articles')
        .expect(200);

      currentBatch = nextBatchResponse.body.data.exercises;
    }

    const aiOnlyResponse = await request(server)
      .get('/api/v1/grammar/beginner/articles')
      .expect(200);

    const aiOnlyBatch = aiOnlyResponse.body.data;
    expect(aiOnlyBatch.jsonRemaining).toBe(0);
    expect(
      aiOnlyBatch.exercises.every((item: { id: string }) =>
        item.id.startsWith('ai_'),
      ),
    ).toBe(true);

    // 5. Adaptive difficulty — 3 consecutive correct answers level up
    clearAdaptiveProgress();

    const levelUpLoad = await request(server)
      .get('/api/v1/grammar/beginner/articles')
      .expect(200);

    const levelUpExercises = levelUpLoad.body.data.exercises as Array<{
      id: string;
    }>;

    for (let i = 0; i < 3; i += 1) {
      const exerciseId = levelUpExercises[i]!.id;
      const correctAnswer = jsonById.get(exerciseId);
      expect(correctAnswer).toBeDefined();

      const result = await request(server)
        .post('/api/v1/grammar/submit')
        .send({
          exerciseId,
          userAnswer: correctAnswer,
          level: 'beginner',
          topic: 'articles',
        })
        .expect(201);

      const effectiveLevel = result.body.data.effectiveLevel as string;
      if (i < 2) {
        expect(effectiveLevel).toBe('beginner');
      } else {
        expect(effectiveLevel).toBe('intermediate');
      }
    }

    const afterLevelUp = await request(server)
      .get('/api/v1/grammar/beginner/articles')
      .expect(200);

    expect(afterLevelUp.body.data.effectiveLevel).toBe('intermediate');
  });

  it('rejects invalid level/topic combinations', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/grammar/beginner/conditionals')
      .expect(400);
  });
});
