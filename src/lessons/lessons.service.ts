import { Injectable, NotFoundException } from '@nestjs/common';
import { Exercise, Level, Prisma, Progress } from '@prisma/client';
import { resolvePagination } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PlanService } from '../subscription/plan.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { LessonQueryDto } from './dto/lesson-query.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

export type LearnerExercise = Omit<Exercise, 'answerJson'>;

export type LessonListItem = {
  id: string;
  level: Level;
  title: string;
  description: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export interface LessonWithProgress extends LessonListItem {
  progress: Pick<Progress, 'status' | 'score' | 'lastAttemptAt'> | null;
}

export interface LessonDetailForLearner extends LessonListItem {
  contentJson: Prisma.JsonValue;
  exercises: LearnerExercise[];
  progress: Pick<Progress, 'status' | 'score' | 'lastAttemptAt'> | null;
}

const lessonListSelect = {
  id: true,
  level: true,
  title: true,
  description: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.LessonSelect;

@Injectable()
export class LessonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly planService: PlanService,
  ) {}

  async create(dto: CreateLessonDto) {
    return this.prisma.lesson.create({
      data: {
        level: dto.level,
        title: dto.title,
        description: dto.description,
        contentJson: dto.contentJson as Prisma.InputJsonValue,
        isPublished: dto.isPublished ?? false,
      },
    });
  }

  async findAll(query: LessonQueryDto = new LessonQueryDto()) {
    const pagination = resolvePagination(query);

    return this.prisma.lesson.findMany({
      where: {
        ...(query.level ? { level: query.level } : {}),
        ...(query.published !== undefined
          ? { isPublished: query.published }
          : {}),
      },
      select: lessonListSelect,
      orderBy: [{ level: 'asc' }, { createdAt: 'desc' }],
      ...pagination,
    });
  }

  async findPublished(query: LessonQueryDto): Promise<LessonListItem[]> {
    const pagination = resolvePagination(query);

    return this.prisma.lesson.findMany({
      where: {
        ...(query.level ? { level: query.level } : {}),
        ...(query.published !== undefined
          ? { isPublished: query.published }
          : { isPublished: true }),
      },
      select: lessonListSelect,
      orderBy: [{ level: 'asc' }, { createdAt: 'asc' }],
      ...pagination,
    });
  }

  async findPublishedForUser(
    userId: string,
    query: LessonQueryDto,
  ): Promise<LessonWithProgress[]> {
    const user = await this.planService.getUserPlan(userId);
    const accessibleLevels = this.accessibleLevelsForUser(user);
    const pagination = resolvePagination(query);

    const lessons = await this.prisma.lesson.findMany({
      where: {
        isPublished: true,
        level: query.level
          ? accessibleLevels.includes(query.level)
            ? query.level
            : { in: [] as Level[] }
          : { in: accessibleLevels },
      },
      select: lessonListSelect,
      orderBy: [{ level: 'asc' }, { createdAt: 'asc' }],
      ...pagination,
    });

    if (lessons.length === 0) {
      return [];
    }

    const progressRows = await this.prisma.progress.findMany({
      where: {
        userId,
        lessonId: { in: lessons.map((lesson) => lesson.id) },
      },
      select: {
        lessonId: true,
        status: true,
        score: true,
        lastAttemptAt: true,
      },
    });

    const progressMap = new Map(progressRows.map((row) => [row.lessonId, row]));

    return lessons.map((lesson) => {
      const progress = progressMap.get(lesson.id);
      return {
        ...lesson,
        progress: progress
          ? {
              status: progress.status,
              score: progress.score,
              lastAttemptAt: progress.lastAttemptAt,
            }
          : null,
      };
    });
  }

  async findPublishedById(id: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id, isPublished: true },
    });
    if (!lesson) {
      throw new NotFoundException('Published lesson not found');
    }
    return lesson;
  }

  async findPublishedDetailForUser(
    id: string,
    userId: string,
  ): Promise<LessonDetailForLearner> {
    const user = await this.planService.getUserPlan(userId);
    const lesson = await this.findPublishedById(id);
    this.planService.assertLevelAccess(user, lesson.level);

    const [exercises, progress] = await Promise.all([
      this.prisma.exercise.findMany({
        where: { lessonId: id },
        select: {
          id: true,
          lessonId: true,
          type: true,
          prompt: true,
          optionsJson: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.progress.findUnique({
        where: { userId_lessonId: { userId, lessonId: id } },
        select: {
          status: true,
          score: true,
          lastAttemptAt: true,
        },
      }),
    ]);

    return {
      id: lesson.id,
      level: lesson.level,
      title: lesson.title,
      description: lesson.description,
      isPublished: lesson.isPublished,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
      contentJson: lesson.contentJson,
      exercises,
      progress: progress ?? null,
    };
  }

  async findById(id: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    return lesson;
  }

  async update(id: string, dto: UpdateLessonDto) {
    await this.findById(id);
    return this.prisma.lesson.update({
      where: { id },
      data: {
        ...dto,
        contentJson: dto.contentJson
          ? (dto.contentJson as Prisma.InputJsonValue)
          : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.lesson.delete({ where: { id } });
  }

  async setPublished(id: string, isPublished: boolean) {
    await this.findById(id);
    return this.prisma.lesson.update({
      where: { id },
      data: { isPublished },
    });
  }

  private accessibleLevelsForUser(
    user: Parameters<PlanService['canAccessLevel']>[0],
  ): Level[] {
    const allLevels: Level[] = [Level.A1, Level.A2, Level.B1, Level.B2];
    return allLevels.filter((level) =>
      this.planService.canAccessLevel(user, level),
    );
  }
}
