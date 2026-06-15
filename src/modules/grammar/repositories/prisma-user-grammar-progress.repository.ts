import { Injectable } from '@nestjs/common';
import { ProgressStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  UserGrammarProgressRecord,
  UserGrammarProgressRepository,
} from '../../core/grammar-repository.interface';

@Injectable()
export class PrismaUserGrammarProgressRepository implements UserGrammarProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProgress(userId: string): Promise<UserGrammarProgressRecord[]> {
    const rows = await this.prisma.userGrammarProgress.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map((row) => this.toRecord(row));
  }

  async upsertProgress(
    userId: string,
    topicId: string,
    score: number,
  ): Promise<UserGrammarProgressRecord> {
    const row = await this.prisma.userGrammarProgress.upsert({
      where: { userId_topicId: { userId, topicId } },
      create: {
        userId,
        topicId,
        lastScore: score,
        attempts: 1,
        lastAttemptAt: new Date(),
        status: ProgressStatus.IN_PROGRESS,
      },
      update: {
        lastScore: score,
        attempts: { increment: 1 },
        lastAttemptAt: new Date(),
        status: ProgressStatus.IN_PROGRESS,
      },
    });
    return this.toRecord(row);
  }

  private toRecord(row: {
    id: string;
    userId: string;
    topicId: string;
    status: string;
    lastScore: number | null;
    attempts: number;
    lastAttemptAt: Date | null;
  }): UserGrammarProgressRecord {
    return {
      id: row.id,
      userId: row.userId,
      topicId: row.topicId,
      status: row.status,
      lastScore: row.lastScore,
      attempts: row.attempts,
      lastAttemptAt: row.lastAttemptAt,
    };
  }
}
