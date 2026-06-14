import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  GrammarExampleRecord,
  GrammarTopicRecord,
  GrammarTopicRepository,
} from '../../core/interfaces/content-repository.interface';
import { PracticeLevel } from '../../core/types/practice-level.type';

/** Phase 2 stub — DB reads not enabled in Phase 1. */
@Injectable()
export class PrismaGrammarTopicRepository implements GrammarTopicRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listByLevel(_level?: PracticeLevel): Promise<GrammarTopicRecord[]> {
    return [];
  }

  async findBySlug(_slug: string): Promise<GrammarTopicRecord | null> {
    return null;
  }
}

@Injectable()
export class PrismaGrammarExampleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTopic(_topicSlug: string): Promise<GrammarExampleRecord[]> {
    return [];
  }
}
