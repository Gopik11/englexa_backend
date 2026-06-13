"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const jwt_auth_guard_1 = require("../src/auth/guards/jwt-auth.guard");
const http_exception_filter_1 = require("../src/common/filters/http-exception.filter");
const tutor_controller_1 = require("../src/ai/tutor.controller");
const tutor_feedback_service_1 = require("../src/ai/tutor-feedback.service");
class MockJwtAuthGuard {
    canActivate(context) {
        const req = context.switchToHttp().getRequest();
        req.user = { sub: 'e2e-user-id', email: 'e2e@test.com', role: 'LEARNER' };
        return true;
    }
}
describe('TutorController (e2e)', () => {
    let app;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            controllers: [tutor_controller_1.TutorController],
            providers: [tutor_feedback_service_1.TutorFeedbackService],
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
    });
    afterAll(async () => {
        await app.close();
    });
    it('POST /api/v1/tutor/feedback returns spec feedback JSON', async () => {
        const response = await request(app.getHttpServer())
            .post('/api/v1/tutor/feedback')
            .send({
            sentence: 'I want to gret now.',
            level: 'intermediate',
        })
            .expect(201);
        expect(response.body.success).toBe(true);
        expect(response.body.error).toBeNull();
        const data = response.body.data;
        expect(data).toEqual(expect.objectContaining({
            corrected_sentence: 'I want to greet now.',
            grammar_feedback: expect.stringContaining('gret'),
            vocabulary_feedback: expect.any(String),
            encouragement: 'You\'re improving your structure. Let\'s refine it a bit more.',
            next_step: expect.any(String),
            micro_lesson: null,
        }));
    });
    it('POST /api/v1/tutor/feedback rejects invalid level', async () => {
        await request(app.getHttpServer())
            .post('/api/v1/tutor/feedback')
            .send({
            sentence: 'Hello world.',
            level: 'expert',
        })
            .expect(400);
    });
});
//# sourceMappingURL=tutor-feedback.e2e-spec.js.map