import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdaptiveModule,
  DifficultyState,
  RecordResultInput,
} from './entities/difficulty.entity';
import {
  adjustDifficultyLevel,
  applyAnswerToDifficulty,
} from './utils/difficulty-adjuster';
import { adaptiveDifficultyClient } from './utils/prisma-adaptive-difficulty';

@Injectable()
export class AdaptiveService {
  constructor(private readonly prisma: PrismaService) {}

  async recordResult(
    userId: string,
    module: AdaptiveModule,
    concept: string,
    isCorrect: boolean,
  ): Promise<DifficultyState> {
    const client = adaptiveDifficultyClient(this.prisma);
    const existing = await client.findUnique({
      where: {
        userId_module_concept: { userId, module, concept },
      },
    });

    const base = existing
      ? this.toState(existing)
      : this.defaultState(userId, module, concept);

    const updated = applyAnswerToDifficulty(base, isCorrect);

    const row = await client.upsert({
      where: {
        userId_module_concept: { userId, module, concept },
      },
      create: {
        userId,
        module,
        concept,
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

    return this.toState(row);
  }

  async getDifficulty(
    userId: string,
    module: AdaptiveModule,
    concept: string,
  ): Promise<DifficultyState> {
    const client = adaptiveDifficultyClient(this.prisma);
    const row = await client.findUnique({
      where: {
        userId_module_concept: { userId, module, concept },
      },
    });

    if (!row) {
      return this.defaultState(userId, module, concept);
    }

    return this.toState(row);
  }

  async adjustDifficulty(
    userId: string,
    module: AdaptiveModule,
    concept: string,
  ): Promise<DifficultyState> {
    const current = await this.getDifficulty(userId, module, concept);
    const nextLevel = adjustDifficultyLevel(
      current.difficulty_level,
      current.streak,
      current.incorrect,
    );

    if (nextLevel === current.difficulty_level) {
      return current;
    }

    const client = adaptiveDifficultyClient(this.prisma);
    const row = await client.upsert({
      where: {
        userId_module_concept: { userId, module, concept },
      },
      create: {
        userId,
        module,
        concept,
        attempts: current.attempts,
        correct: current.correct,
        incorrect: 0,
        streak: 0,
        difficultyLevel: nextLevel,
      },
      update: {
        difficultyLevel: nextLevel,
        incorrect: 0,
        streak: 0,
      },
    });

    return this.toState(row);
  }

  async recordFromInput(input: RecordResultInput): Promise<DifficultyState> {
    return this.recordResult(
      input.userId,
      input.module,
      input.concept,
      input.isCorrect,
    );
  }

  private defaultState(
    userId: string,
    module: AdaptiveModule,
    concept: string,
  ): DifficultyState {
    return {
      userId,
      module,
      concept,
      attempts: 0,
      correct: 0,
      incorrect: 0,
      streak: 0,
      difficulty_level: 1,
    };
  }

  private toState(row: {
    userId: string;
    module: string;
    concept: string;
    attempts: number;
    correct: number;
    incorrect: number;
    streak: number;
    difficultyLevel: number;
  }): DifficultyState {
    return {
      userId: row.userId,
      module: row.module as AdaptiveModule,
      concept: row.concept,
      attempts: row.attempts,
      correct: row.correct,
      incorrect: row.incorrect,
      streak: row.streak,
      difficulty_level: row.difficultyLevel,
    };
  }
}
