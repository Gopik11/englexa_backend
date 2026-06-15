import { Injectable } from '@nestjs/common';
import { PracticeLevel } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  GrammarTopicRecord,
  GrammarTopicRepository,
} from '../../core/grammar-repository.interface';

@Injectable()
export class PrismaGrammarTopicRepository implements GrammarTopicRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPublished(): Promise<GrammarTopicRecord[]> {
    const rows = await this.prisma.grammarTopic.findMany({
      where: { isPublished: true },
      orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
    });
    return rows.map((row) => this.toRecord(row));
  }

  async findById(id: string): Promise<GrammarTopicRecord | null> {
    const row = await this.prisma.grammarTopic.findUnique({ where: { id } });
    return row ? this.toRecord(row) : null;
  }

  async findBySlug(slug: string): Promise<GrammarTopicRecord | null> {
    const row = await this.prisma.grammarTopic.findUnique({ where: { slug } });
    return row ? this.toRecord(row) : null;
  }

  async findByLevel(level: string): Promise<GrammarTopicRecord[]> {
    const practiceLevel = this.toPracticeLevel(level);
    if (!practiceLevel) {
      return [];
    }
    const rows = await this.prisma.grammarTopic.findMany({
      where: { level: practiceLevel, isPublished: true },
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((row) => this.toRecord(row));
  }

  private toRecord(row: {
    id: string;
    slug: string;
    name: string;
    level: PracticeLevel;
    tags: string[];
    description: string | null;
    sortOrder: number;
    isPublished: boolean;
    version: number;
  }): GrammarTopicRecord {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      level: row.level,
      tags: row.tags,
      description: row.description,
      sortOrder: row.sortOrder,
      isPublished: row.isPublished,
      version: row.version,
    };
  }

  private toPracticeLevel(level: string): PracticeLevel | null {
    const normalized = level.trim().toUpperCase();
    if (normalized === 'BEGINNER' || normalized === 'INTERMEDIATE' || normalized === 'ADVANCED') {
      return normalized as PracticeLevel;
    }
    const slug = level.trim().toLowerCase();
    if (slug === 'beginner') return PracticeLevel.BEGINNER;
    if (slug === 'intermediate') return PracticeLevel.INTERMEDIATE;
    if (slug === 'advanced') return PracticeLevel.ADVANCED;
    return null;
  }
}
