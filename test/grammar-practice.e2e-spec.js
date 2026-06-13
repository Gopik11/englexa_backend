"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const jwt_auth_guard_1 = require("../src/auth/guards/jwt-auth.guard");
const http_exception_filter_1 = require("../src/common/filters/http-exception.filter");
const tutor_feedback_service_1 = require("../src/ai/tutor-feedback.service");
const grammar_practice_controller_1 = require("../src/grammar-practice/grammar-practice.controller");
const grammar_practice_service_1 = require("../src/grammar-practice/grammar-practice.service");
const progress_service_1 = require("../src/progress/progress.service");
const gamification_service_1 = require("../src/gamification/gamification.service");
const grammar_gamification_constants_1 = require("../src/gamification/constants/grammar-gamification.constants");
const adaptive_logic_1 = require("../src/grammar-practice/utils/adaptive-logic");
const ai_exercise_generator_1 = require("../src/grammar-practice/utils/ai-exercise-generator");
const content_loader_1 = require("../src/grammar-practice/utils/content-loader");
const path = require("path");
class MockJwtAuthGuard {
    canActivate(context) {
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
    let app;
    let articlesContent;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            controllers: [grammar_practice_controller_1.GrammarPracticeController],
            providers: [
                grammar_practice_service_1.GrammarPracticeService,
                ai_exercise_generator_1.AiExerciseGenerator,
                tutor_feedback_service_1.TutorFeedbackService,
                {
                    provide: progress_service_1.ProgressService,
                    useValue: {
                        incrementGrammarXP: jest.fn().mockResolvedValue({
                            xpAwarded: grammar_gamification_constants_1.GRAMMAR_ANSWER_XP,
                            mastery: {
                                concept: 'Articles',
                                correctCount: 1,
                                mistakeCount: 0,
                                masteryScore: 100,
                                xpEarned: grammar_gamification_constants_1.GRAMMAR_ANSWER_XP,
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
                    provide: gamification_service_1.GamificationService,
                    useValue: {
                        addXp: jest.fn().mockResolvedValue(100),
                        updateStreak: jest.fn().mockResolvedValue(3),
                        resetStreak: jest.fn().mockResolvedValue(0),
                    },
                },
            ],
        })
            .overrideGuard(jwt_auth_guard_1.JwtAuthGuard)
            .useClass(MockJwtAuthGuard)
            .compile();
        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api/v1');
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
        await app.init();
        articlesContent = (0, content_loader_1.loadGrammarExercises)('beginner', 'articles', path.join(__dirname, '../src/grammar-practice'));
    });
    beforeEach(() => {
        (0, content_loader_1.clearGrammarExerciseCache)();
        (0, ai_exercise_generator_1.clearGeneratedExerciseCache)();
        (0, adaptive_logic_1.clearAdaptiveProgress)();
    });
    afterAll(async () => {
        await app.close();
    });
    it('runs the full grammar practice flow over HTTP', async () => {
        const server = app.getHttpServer();
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
        expect(batch.exercises.every((item) => !item.id.startsWith('ai_'))).toBe(true);
        const firstExercise = batch.exercises[0];
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
        expect(adaptiveBatch.exercises.some((item) => item.id.startsWith('ai_'))).toBe(true);
        const jsonById = new Map(articlesContent.map((item) => [item.id, item.correct_answer]));
        let currentBatch = batch.exercises;
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
                    expect(submitResponse.body.data.xpEarned).toBe(grammar_gamification_constants_1.GRAMMAR_ANSWER_XP);
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
        expect(aiOnlyBatch.exercises.every((item) => item.id.startsWith('ai_'))).toBe(true);
        (0, adaptive_logic_1.clearAdaptiveProgress)();
        const levelUpLoad = await request(server)
            .get('/api/v1/grammar/beginner/articles')
            .expect(200);
        const levelUpExercises = levelUpLoad.body.data.exercises;
        for (let i = 0; i < 3; i += 1) {
            const exerciseId = levelUpExercises[i].id;
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
            const effectiveLevel = result.body.data.effectiveLevel;
            if (i < 2) {
                expect(effectiveLevel).toBe('beginner');
            }
            else {
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
//# sourceMappingURL=grammar-practice.e2e-spec.js.map