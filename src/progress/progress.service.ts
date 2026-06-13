import { Injectable, NotFoundException } from '@nestjs/common';
import { GrammarConceptProgress, Level, Progress, ProgressStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ExerciseEvaluatorService } from '../exercises/exercise-evaluator.service';
import { GamificationService } from '../gamification/gamification.service';
import { ProfileService } from '../profile/profile.service';
import { LessonsService } from '../lessons/lessons.service';
import { PlanService } from '../subscription/plan.service';
import { ExerciseEvaluationResult } from '../common/types/exercise-content.types';
import { GRAMMAR_XP_PER_CORRECT } from './constants/grammar-progress.constants';
import { SubmitProgressDto } from './dto/submit-progress.dto';
import {
  GrammarConceptMastery,
  GrammarProgressUpdate,
} from './interfaces/grammar-concept-progress.interface';

export interface ProgressSummary {
  lessonsCompleted: number;
  lessonsInProgress: number;
  totalPublishedLessons: number;
  averageScore: number;
  xp: number;
  streak: number;
  level: number;
  xpToNextLevel: number;
  badges: Array<{ id: string; title: string; description: string }>;
  byLevel: Record<string, { completed: number; total: number }>;
}

export interface SubmitProgressResult {
  progress: Progress;
  results: ExerciseEvaluationResult[];
  overallScore: number;
}

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lessonsService: LessonsService,
    private readonly exerciseEvaluator: ExerciseEvaluatorService,
    private readonly gamificationService: GamificationService,
    private readonly profileService: ProfileService,
    private readonly planService: PlanService,
  ) {}

  async submit(
    userId: string,
    dto: SubmitProgressDto,
  ): Promise<SubmitProgressResult> {
    const user = await this.planService.getUserPlan(userId);
    const lesson = await this.lessonsService.findPublishedById(dto.lessonId);
    this.planService.assertLevelAccess(user, lesson.level);
    const exercises = await this.prisma.exercise.findMany({
      where: { lessonId: lesson.id },
      orderBy: { createdAt: 'asc' },
    });

    if (exercises.length === 0) {
      throw new NotFoundException('Lesson has no exercises');
    }

    const exerciseMap = new Map(exercises.map((item) => [item.id, item]));
    const results: ExerciseEvaluationResult[] = [];

    for (const answer of dto.answers) {
      const exercise = exerciseMap.get(answer.exerciseId);
      if (!exercise) {
        throw new NotFoundException(
          `Exercise ${answer.exerciseId} not found in lesson`,
        );
      }
      results.push(this.exerciseEvaluator.evaluate(exercise, answer.answer));
    }

    const overallScore =
      results.length > 0
        ? Math.round(
            results.reduce((sum, item) => sum + item.score, 0) /
              results.length,
          )
        : 0;

    const allExercisesAnswered = results.length === exercises.length;
    const status = this.resolveStatus(allExercisesAnswered, overallScore);

    await this.gamificationService.recordActivity(userId);
    if (status === ProgressStatus.COMPLETED) {
      await this.gamificationService.addXp(userId, overallScore);
      await this.profileService.awardXpForActivity(userId, 'lesson', {
        perfectAccuracy: overallScore >= 100,
      });
    } else {
      await this.gamificationService.addXp(
        userId,
        Math.round(overallScore * 0.25),
      );
    }

    const progress = await this.prisma.progress.upsert({
      where: {
        userId_lessonId: { userId, lessonId: lesson.id },
      },
      create: {
        userId,
        lessonId: lesson.id,
        status,
        score: overallScore,
        lastAttemptAt: new Date(),
      },
      update: {
        status,
        score: overallScore,
        lastAttemptAt: new Date(),
      },
    });

    return { progress, results, overallScore };
  }

  async getSummary(userId: string, level?: Level): Promise<ProgressSummary> {
    const lessonFilter: Prisma.LessonWhereInput = {
      isPublished: true,
      ...(level ? { level } : {}),
    };

    const [publishedLessons, progressRows] = await Promise.all([
      this.prisma.lesson.findMany({
        where: lessonFilter,
        select: { id: true, level: true },
      }),
      this.prisma.progress.findMany({
        where: {
          userId,
          lesson: lessonFilter,
        },
      }),
    ]);

    const completed = progressRows.filter(
      (row) => row.status === ProgressStatus.COMPLETED,
    );
    const inProgress = progressRows.filter(
      (row) => row.status === ProgressStatus.IN_PROGRESS,
    );

    const averageScore =
      progressRows.length > 0
        ? Math.round(
            progressRows.reduce((sum, row) => sum + row.score, 0) /
              progressRows.length,
          )
        : 0;

    const gamification = await this.gamificationService.getProfile(userId);

    const byLevel: ProgressSummary['byLevel'] = {};
    for (const lesson of publishedLessons) {
      if (!byLevel[lesson.level]) {
        byLevel[lesson.level] = { completed: 0, total: 0 };
      }
      byLevel[lesson.level].total += 1;
    }

    for (const row of completed) {
      const lesson = publishedLessons.find((item) => item.id === row.lessonId);
      if (lesson) {
        byLevel[lesson.level].completed += 1;
      }
    }

    return {
      lessonsCompleted: completed.length,
      lessonsInProgress: inProgress.length,
      totalPublishedLessons: publishedLessons.length,
      averageScore,
      xp: gamification.xp,
      streak: gamification.streak,
      level: gamification.level,
      xpToNextLevel: gamification.xpToNextLevel,
      badges: gamification.badges,
      byLevel,
    };
  }

  async getForUserAndLesson(
    userId: string,
    lessonId: string,
  ): Promise<Progress | null> {
    return this.prisma.progress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
  }

  async incrementGrammarXP(
    userId: string,
    concept: string,
  ): Promise<GrammarProgressUpdate> {
    const row = await this.prisma.grammarConceptProgress.upsert({
      where: { userId_concept: { userId, concept } },
      create: {
        userId,
        concept,
        correctCount: 1,
        mistakeCount: 0,
        masteryScore: 100,
        xpEarned: GRAMMAR_XP_PER_CORRECT,
      },
      update: {
        correctCount: { increment: 1 },
        xpEarned: { increment: GRAMMAR_XP_PER_CORRECT },
      },
    });

    const updated = await this.syncGrammarMasteryScore(row);

    return {
      xpAwarded: GRAMMAR_XP_PER_CORRECT,
      mastery: this.toGrammarConceptMastery(updated),
    };
  }

  async recordGrammarMistake(
    userId: string,
    concept: string,
  ): Promise<GrammarProgressUpdate> {
    const row = await this.prisma.grammarConceptProgress.upsert({
      where: { userId_concept: { userId, concept } },
      create: {
        userId,
        concept,
        correctCount: 0,
        mistakeCount: 1,
        masteryScore: 0,
        xpEarned: 0,
      },
      update: {
        mistakeCount: { increment: 1 },
      },
    });

    const updated = await this.syncGrammarMasteryScore(row);

    return {
      xpAwarded: 0,
      mastery: this.toGrammarConceptMastery(updated),
    };
  }

  async getGrammarConceptMastery(
    userId: string,
  ): Promise<GrammarConceptMastery[]> {
    const rows = await this.prisma.grammarConceptProgress.findMany({
      where: { userId },
      orderBy: [{ masteryScore: 'desc' }, { concept: 'asc' }],
    });

    return rows.map((row) => this.toGrammarConceptMastery(row));
  }

  private async syncGrammarMasteryScore(
    row: GrammarConceptProgress,
  ): Promise<GrammarConceptProgress> {
    const masteryScore = this.computeGrammarMasteryScore(
      row.correctCount,
      row.mistakeCount,
    );

    if (row.masteryScore === masteryScore) {
      return row;
    }

    return this.prisma.grammarConceptProgress.update({
      where: { id: row.id },
      data: { masteryScore },
    });
  }

  private computeGrammarMasteryScore(
    correctCount: number,
    mistakeCount: number,
  ): number {
    const total = correctCount + mistakeCount;
    if (total === 0) {
      return 0;
    }

    return Math.min(100, Math.round((correctCount / total) * 100));
  }

  private toGrammarConceptMastery(
    row: GrammarConceptProgress,
  ): GrammarConceptMastery {
    return {
      concept: row.concept,
      correctCount: row.correctCount,
      mistakeCount: row.mistakeCount,
      masteryScore: row.masteryScore,
      xpEarned: row.xpEarned,
    };
  }

  private resolveStatus(
    allExercisesAnswered: boolean,
    overallScore: number,
  ): ProgressStatus {
    if (allExercisesAnswered && overallScore >= 60) {
      return ProgressStatus.COMPLETED;
    }
    return ProgressStatus.IN_PROGRESS;
  }
}
