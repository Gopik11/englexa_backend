import { Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  GrammarExampleRecord,
  GrammarExampleRepository,
} from '../../core/grammar-repository.interface';

@Injectable()
export class PrismaGrammarExampleRepository implements GrammarExampleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTopicId(topicId: string): Promise<GrammarExampleRecord[]> {
    const rows = await this.prisma.grammarExample.findMany({
      where: { topicId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => this.toRecord(row));
  }

  async findPublishedByTopicId(topicId: string): Promise<GrammarExampleRecord[]> {
    const rows = await this.prisma.grammarExample.findMany({
      where: { topicId, status: ContentStatus.APPROVED },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => this.toRecord(row));
  }

  private toRecord(row: {
    id: string;
    topicId: string;
    sentence: string;
    highlight: string | null;
    note: string | null;
    status: string;
  }): GrammarExampleRecord {
    return {
      id: row.id,
      topicId: row.topicId,
      sentence: row.sentence,
      highlight: row.highlight,
      note: row.note,
      status: row.status,
    };
  }
}
