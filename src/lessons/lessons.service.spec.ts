import { Level, PlanType } from '@prisma/client';
import { PlanService } from '../subscription/plan.service';
import { LessonQueryDto } from './dto/lesson-query.dto';
import { LessonsService } from './lessons.service';

describe('LessonsService plan filtering', () => {
  const allLessons = [
    {
      id: '1',
      level: Level.A1,
      title: 'A1',
      description: 'A1 lesson',
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      level: Level.A2,
      title: 'A2',
      description: 'A2 lesson',
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const prisma = {
    lesson: {
      findMany: jest.fn(({ where }) => {
        const levels = where?.level?.in as Level[] | undefined;
        const filtered = levels
          ? allLessons.filter((lesson) => levels.includes(lesson.level))
          : allLessons;
        return Promise.resolve(filtered);
      }),
    },
    progress: { findMany: jest.fn().mockResolvedValue([]) },
  };

  const planService = {
    getUserPlan: jest.fn().mockResolvedValue({
      planType: PlanType.FREE,
      planExpiresAt: null,
    }),
    canAccessLevel: jest.fn((user, level: Level) => level === Level.A1),
    assertLevelAccess: jest.fn(),
  };

  const service = new LessonsService(
    prisma as never,
    planService as unknown as PlanService,
  );

  it('filters A2 lessons for free users', async () => {
    const lessons = await service.findPublishedForUser(
      'user-1',
      new LessonQueryDto(),
    );

    expect(lessons).toHaveLength(1);
    expect(lessons[0].level).toBe(Level.A1);
  });
});
