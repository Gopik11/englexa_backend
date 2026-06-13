import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ErrorPatternsService } from '../error-patterns/error-patterns.service';
import { pickDailyIndex } from '../home/utils/daily-seed';
import { MasteryService } from '../mastery/mastery.service';
import { ProfileService } from '../profile/profile.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CompleteLessonDto,
  GenerateLessonDto,
  MiniLesson,
  MiniLessonModule,
} from './entities/mini-lesson.entity';
import {
  generateLesson,
  getConceptsForModule,
  normalizeConcept,
  resolveModuleForConcept,
} from './utils/lesson-generator';
import { miniLessonCompletionClient } from './utils/prisma-mini-lessons';

@Injectable()
export class MiniLessonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly masteryService: MasteryService,
    private readonly errorPatternsService: ErrorPatternsService,
    private readonly profileService: ProfileService,
  ) {}

  getLessonByConcept(concept: string, difficultyLevel = 2): MiniLesson {
    return generateLesson(concept, difficultyLevel);
  }

  generateLessonFromDto(dto: GenerateLessonDto): MiniLesson {
    return generateLesson(
      dto.concept,
      dto.difficulty_level ?? 2,
      dto.module,
    );
  }

  async getLessonsForWeakAreas(userId: string): Promise<MiniLesson[]> {
    const [overview, topPatterns, completedIds] = await Promise.all([
      this.masteryService.getOverview(userId),
      this.errorPatternsService.getTopErrorPatterns(userId, 5),
      this.loadCompletedLessonIds(userId),
    ]);

    const conceptScores = new Map<string, number>();

    for (const item of overview.weakest) {
      const key = normalizeConcept(item.concept);
      const priority = 100 - item.masteryScore + item.mistakeCount;
      conceptScores.set(key, Math.max(conceptScores.get(key) ?? 0, priority));
    }

    for (const pattern of topPatterns) {
      const key = normalizeConcept(pattern.concept);
      const priority = pattern.count * 10;
      conceptScores.set(key, Math.max(conceptScores.get(key) ?? 0, priority));
    }

    const ranked = [...conceptScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (ranked.length === 0) {
      return [
        this.withCompletion(
          generateLesson('articles', 2),
          completedIds,
        ),
        this.withCompletion(
          generateLesson('collocations', 2),
          completedIds,
        ),
      ];
    }

    return ranked.map(([concept, score]) => {
      const mastery = overview.weakest.find(
        (item) => normalizeConcept(item.concept) === concept,
      );
      const difficulty = mastery
        ? Math.min(5, Math.max(1, Math.ceil((100 - mastery.masteryScore) / 25)))
        : Math.min(5, Math.max(1, Math.ceil(score / 30)));

      return this.withCompletion(
        generateLesson(concept, difficulty),
        completedIds,
      );
    });
  }

  async getRandomLesson(
    module: MiniLessonModule,
    userId?: string,
  ): Promise<MiniLesson> {
    const concepts = getConceptsForModule(module);
    if (concepts.length === 0) {
      throw new NotFoundException(`No lessons for module ${module}`);
    }

    const index = userId
      ? pickDailyIndex(userId, `mini-lesson:${module}`, concepts.length)
      : Math.floor(Math.random() * concepts.length);

    const concept = concepts[index];
    const completedIds = userId
      ? await this.loadCompletedLessonIds(userId)
      : new Set<string>();

    return this.withCompletion(generateLesson(concept, 2), completedIds);
  }

  async getFeaturedLesson(userId: string): Promise<MiniLesson> {
    const lessons = await this.getLessonsForWeakAreas(userId);
    return lessons[0] ?? generateLesson('articles', 2);
  }

  async markLessonCompleted(
    userId: string,
    dto: CompleteLessonDto,
  ): Promise<{ lesson_id: string; completed: true }> {
    await miniLessonCompletionClient(this.prisma).upsert({
      where: {
        userId_lessonId: { userId, lessonId: dto.lesson_id },
      },
      create: {
        userId,
        lessonId: dto.lesson_id,
        concept: dto.concept,
        module: dto.module,
      },
      update: { completedAt: new Date() },
    });

    await this.profileService.awardXpForActivity(userId, 'mini_lesson');

    return { lesson_id: dto.lesson_id, completed: true };
  }

  async assertUserAccess(requestedUserId: string, currentUserId: string): Promise<void> {
    if (requestedUserId !== currentUserId) {
      throw new ForbiddenException('Cannot access another user\'s lessons');
    }
  }

  private async loadCompletedLessonIds(userId: string): Promise<Set<string>> {
    const rows = await miniLessonCompletionClient(this.prisma).findMany({
      where: { userId },
      select: { lessonId: true },
    });
    return new Set(rows.map((row) => row.lessonId));
  }

  private withCompletion(
    lesson: MiniLesson,
    completedIds: Set<string>,
  ): MiniLesson {
    return {
      ...lesson,
      completed: completedIds.has(lesson.id),
    };
  }

  resolveModule(concept: string): MiniLessonModule {
    return resolveModuleForConcept(concept);
  }
}
