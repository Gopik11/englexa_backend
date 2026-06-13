import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  DetectedErrorPattern,
  DetectErrorInput,
  ErrorPatternModule,
  ErrorPatternRecord,
  ErrorProfile,
  RecordErrorPatternInput,
} from './entities/error-pattern.entity';
import { classifyError } from './utils/error-classifier';
import { errorPatternClient } from './utils/prisma-error-patterns';

const MAX_EXAMPLES = 5;
const MODULES: ErrorPatternModule[] = [
  'grammar',
  'vocabulary',
  'reading',
  'speaking',
  'writing',
];

@Injectable()
export class ErrorPatternsService {
  constructor(private readonly prisma: PrismaService) {}

  detectErrorPattern(input: DetectErrorInput): DetectedErrorPattern {
    return classifyError(input);
  }

  async recordErrorPattern(
    userId: string,
    pattern: RecordErrorPatternInput,
    example: string,
  ): Promise<ErrorPatternRecord> {
    const client = errorPatternClient(this.prisma);
    const now = new Date();
    const trimmedExample = example.trim().slice(0, 240);

    const existing = await client.findUnique({
      where: {
        userId_module_concept_errorType: {
          userId,
          module: pattern.module,
          concept: pattern.concept,
          errorType: pattern.error_type,
        },
      },
    });

    const examples = this.appendExample(existing?.examples ?? [], trimmedExample);

    const row = await client.upsert({
      where: {
        userId_module_concept_errorType: {
          userId,
          module: pattern.module,
          concept: pattern.concept,
          errorType: pattern.error_type,
        },
      },
      create: {
        userId,
        module: pattern.module,
        concept: pattern.concept,
        errorType: pattern.error_type,
        count: 1,
        lastSeenAt: now,
        examples,
      },
      update: {
        count: (existing?.count ?? 0) + 1,
        lastSeenAt: now,
        examples,
      },
    });

    return this.toRecord(row);
  }

  async detectAndRecord(
    userId: string,
    input: DetectErrorInput,
  ): Promise<ErrorPatternRecord | null> {
    if (!input.userAnswer.trim() || !input.correctAnswer.trim()) {
      return null;
    }

    const detected = this.detectErrorPattern(input);
    return this.recordErrorPattern(userId, detected, input.userAnswer);
  }

  async getTopErrorPatterns(
    userId: string,
    limit = 10,
  ): Promise<ErrorPatternRecord[]> {
    const client = errorPatternClient(this.prisma);
    const rows = await client.findMany({
      where: { userId },
      orderBy: { count: 'desc' },
      take: limit,
    });

    return rows.map((row) => this.toRecord(row));
  }

  async getErrorProfile(userId: string): Promise<ErrorProfile> {
    const client = errorPatternClient(this.prisma);
    const rows = await client.findMany({
      where: { userId },
      orderBy: { count: 'desc' },
    });

    const records = rows.map((row) => this.toRecord(row));
    const by_module = {} as ErrorProfile['by_module'];

    for (const module of MODULES) {
      const patterns = records.filter((item) => item.module === module);
      by_module[module] = {
        patterns,
        total_count: patterns.reduce((sum, item) => sum + item.count, 0),
      };
    }

    return {
      userId,
      total_patterns: records.length,
      total_errors: records.reduce((sum, item) => sum + item.count, 0),
      by_module,
      top_patterns: records.slice(0, 10),
    };
  }

  private appendExample(existing: string[], example: string): string[] {
    if (!example) return existing;
    const next = [example, ...existing.filter((item) => item !== example)];
    return next.slice(0, MAX_EXAMPLES);
  }

  private toRecord(row: {
    userId: string;
    module: string;
    concept: string;
    errorType: string;
    count: number;
    lastSeenAt: Date;
    examples: string[];
  }): ErrorPatternRecord {
    return {
      userId: row.userId,
      module: row.module as ErrorPatternModule,
      concept: row.concept,
      error_type: row.errorType,
      count: row.count,
      last_seen: row.lastSeenAt,
      examples: row.examples ?? [],
    };
  }
}
