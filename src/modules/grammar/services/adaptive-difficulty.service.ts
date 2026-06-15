import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { applyAnswerToDifficulty } from '../../../adaptive/utils/difficulty-adjuster';

const GRAMMAR_MODULE = 'grammar';
const PASSING_SCORE = 70;

export interface GrammarPerformance {
  score?: number;
  isCorrect?: boolean;
}

@Injectable()
export class AdaptiveDifficultyService {
  constructor(private readonly prisma: PrismaService) {}

  async getDifficultyForUser(userId: string, topicId: string): Promise<number> {
    const row = await this.prisma.adaptiveDifficulty.findUnique({
      where: {
        userId_module_concept: {
          userId,
          module: GRAMMAR_MODULE,
          concept: topicId,
        },
      },
    });
    return row?.difficultyLevel ?? 1;
  }

  async updateDifficulty(
    userId: string,
    topicId: string,
    performance: GrammarPerformance,
  ): Promise<number> {
    const isCorrect =
      performance.isCorrect ??
      (typeof performance.score === 'number'
        ? performance.score >= PASSING_SCORE
        : false);

    const existing = await this.prisma.adaptiveDifficulty.findUnique({
      where: {
        userId_module_concept: {
          userId,
          module: GRAMMAR_MODULE,
          concept: topicId,
        },
      },
    });

    const base = existing
      ? {
          attempts: existing.attempts,
          correct: existing.correct,
          incorrect: existing.incorrect,
          streak: existing.streak,
          difficulty_level: existing.difficultyLevel,
        }
      : {
          attempts: 0,
          correct: 0,
          incorrect: 0,
          streak: 0,
          difficulty_level: 1,
        };

    const updated = applyAnswerToDifficulty(base, isCorrect);

    const row = await this.prisma.adaptiveDifficulty.upsert({
      where: {
        userId_module_concept: {
          userId,
          module: GRAMMAR_MODULE,
          concept: topicId,
        },
      },
      create: {
        userId,
        module: GRAMMAR_MODULE,
        concept: topicId,
        attempts: updated.attempts,
        correct: updated.correct,
        incorrect: updated.incorrect,
        streak: updated.streak,
        difficultyLevel: updated.difficulty_level,
      },
      update: {
        attempts: updated.attempts,
        correct: updated.correct,
        incorrect: updated.incorrect,
        streak: updated.streak,
        difficultyLevel: updated.difficulty_level,
      },
    });

    return row.difficultyLevel;
  }
}
