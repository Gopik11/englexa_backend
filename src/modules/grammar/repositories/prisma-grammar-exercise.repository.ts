import { Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  GrammarExerciseRecord,
  GrammarExerciseRepository,
} from '../../core/grammar-repository.interface';

@Injectable()
export class PrismaGrammarExerciseRepository implements GrammarExerciseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTopicId(topicId: string): Promise<GrammarExerciseRecord[]> {
    const rows = await this.prisma.grammarExercise.findMany({
      where: { topicId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => this.toRecord(row));
  }

  async findPublishedByTopicId(topicId: string): Promise<GrammarExerciseRecord[]> {
    const rows = await this.prisma.grammarExercise.findMany({
      where: { topicId, status: ContentStatus.APPROVED },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => this.toRecord(row));
  }

  private toRecord(row: {
    id: string;
    topicId: string;
    legacyId: string | null;
    type: string;
    question: string;
    optionsJson: unknown;
    answerJson: unknown;
    explanation: string | null;
    difficulty: number;
    status: string;
  }): GrammarExerciseRecord {
    return {
      id: row.id,
      topicId: row.topicId,
      legacyId: row.legacyId,
      type: row.type,
      question: row.question,
      optionsJson: row.optionsJson,
      answerJson: row.answerJson,
      explanation: row.explanation,
      difficulty: row.difficulty,
      status: row.status,
    };
  }
}
