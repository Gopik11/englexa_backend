import { Injectable } from '@nestjs/common';
import { ProgressStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface AnalyticsOverview {
  totalUsers: number;
  dau: number;
  totalLessonsCompleted: number;
  premiumUsers: number;
}

export interface LessonAnalyticsRow {
  lessonId: string;
  title: string;
  level: string;
  completionCount: number;
  averageScore: number;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(): Promise<AnalyticsOverview> {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalUsers, dau, totalLessonsCompleted, premiumUsers] =
      await Promise.all([
        this.prisma.user.count({ where: { role: 'LEARNER' } }),
        this.prisma.user.count({
          where: {
            role: 'LEARNER',
            lastActiveAt: { gte: dayAgo },
          },
        }),
        this.prisma.progress.count({
          where: { status: ProgressStatus.COMPLETED },
        }),
        this.prisma.user.count({
          where: {
            role: 'LEARNER',
            planType: 'PREMIUM',
          },
        }),
      ]);

    return {
      totalUsers,
      dau,
      totalLessonsCompleted,
      premiumUsers,
    };
  }

  async getLessonAnalytics(): Promise<LessonAnalyticsRow[]> {
    const lessons = await this.prisma.lesson.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        level: true,
      },
      orderBy: [{ level: 'asc' }, { title: 'asc' }],
    });

    const aggregates = await this.prisma.progress.groupBy({
      by: ['lessonId'],
      where: { status: ProgressStatus.COMPLETED },
      _count: { _all: true },
      _avg: { score: true },
    });

    const aggregateByLesson = new Map(
      aggregates.map((row) => [row.lessonId, row]),
    );

    return lessons.map((lesson) => {
      const stats = aggregateByLesson.get(lesson.id);
      return {
        lessonId: lesson.id,
        title: lesson.title,
        level: lesson.level,
        completionCount: stats?._count._all ?? 0,
        averageScore: Math.round(stats?._avg.score ?? 0),
      };
    });
  }
}
