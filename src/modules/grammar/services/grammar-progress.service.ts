import { Injectable } from '@nestjs/common';
import { PrismaGrammarTopicRepository } from '../repositories/prisma-grammar-topic.repository';
import { PrismaUserGrammarProgressRepository } from '../repositories/prisma-user-grammar-progress.repository';
import { AdaptiveDifficultyService } from './adaptive-difficulty.service';

@Injectable()
export class GrammarProgressService {
  constructor(
    private readonly progressRepository: PrismaUserGrammarProgressRepository,
    private readonly topicRepository: PrismaGrammarTopicRepository,
    private readonly adaptiveDifficultyService: AdaptiveDifficultyService,
  ) {}

  async getProgress(userId: string) {
    const progress = await this.progressRepository.getUserProgress(userId);
    return { userId, progress };
  }

  async updateProgress(userId: string, payload: unknown) {
    const body = payload as { topicId?: string; score?: number };
    const topicIdOrSlug = typeof body.topicId === 'string' ? body.topicId : undefined;
    const score = typeof body.score === 'number' ? body.score : undefined;

    if (topicIdOrSlug && score !== undefined) {
      const resolvedTopicId = await this.resolveTopicId(topicIdOrSlug);
      if (resolvedTopicId) {
        await this.progressRepository.upsertProgress(userId, resolvedTopicId, score);
        await this.adaptiveDifficultyService.updateDifficulty(userId, resolvedTopicId, {
          score,
        });
      }
    }

    return { success: true };
  }

  private async resolveTopicId(topicIdOrSlug: string): Promise<string | null> {
    const byId = await this.topicRepository.findById(topicIdOrSlug);
    if (byId) {
      return byId.id;
    }
    const bySlug = await this.topicRepository.findBySlug(topicIdOrSlug);
    return bySlug?.id ?? null;
  }
}
