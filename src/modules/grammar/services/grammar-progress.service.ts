import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/** Phase 1 stub — topic progress persistence wired in Phase 2. */
@Injectable()
export class GrammarProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProgress(_userId: string) {
    return [];
  }

  async recordProgress(_userId: string, _topicId: string, _payload: { score?: number }) {
    return { recorded: false, message: 'Topic progress tracking available in Phase 2' };
  }
}
