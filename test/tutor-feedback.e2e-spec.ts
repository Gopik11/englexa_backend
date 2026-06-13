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
import { TutorController } from '../src/ai/tutor.controller';
import { TutorFeedbackService } from '../src/ai/tutor-feedback.service';

class MockJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { sub: 'e2e-user-id', email: 'e2e@test.com', role: 'LEARNER' };
    return true;
  }
}

describe('TutorController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TutorController],
      providers: [TutorFeedbackService],
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
    expect(data).toEqual(
      expect.objectContaining({
        corrected_sentence: 'I want to greet now.',
        grammar_feedback: expect.stringContaining('gret'),
        vocabulary_feedback: expect.any(String),
        encouragement:
          'You\'re improving your structure. Let\'s refine it a bit more.',
        next_step: expect.any(String),
        micro_lesson: null,
      }),
    );
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
