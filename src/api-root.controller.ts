import { Controller, Get } from '@nestjs/common';
import { successResponse } from './common/dto/api-response.dto';

@Controller()
export class ApiRootController {
  @Get()
  root() {
    return successResponse({
      service: 'englexa-api',
      version: 'v1',
      status: 'running',
      endpoints: {
        health: '/api/v1/health',
        auth: '/api/v1/auth',
        lessons: '/api/v1/lessons',
        progress: '/api/v1/progress',
        ai: '/api/v1/ai',
        missions: '/api/v1/missions',
        home: '/api/v1/home',
        gamification: '/api/v1/gamification',
        mastery: '/api/v1/mastery',
        weeklyPlan: '/api/v1/weekly-plan',
        miniLessons: '/api/v1/mini-lessons',
        conversation: '/api/v1/conversation',
        srs: '/api/v1/srs',
        prediction: '/api/v1/prediction',
        dailyChallenge: '/api/v1/daily-challenge',
        profile: '/api/v1/profile',
        jobs: '/api/v1/jobs',
        analytics: '/api/v1/analytics',
        lessonSummary: '/api/v1/lesson-summary',
        admin: '/api/v1/admin',
      },
    });
  }
}
