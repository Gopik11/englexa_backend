import { Inject, Injectable } from '@nestjs/common';
import { AiUsageType } from '@prisma/client';
import { GamificationService } from '../gamification/gamification.service';
import { AiCacheService } from './ai-cache.service';
import { AiUsageService } from './ai-usage.service';
import { TutorRequestDto } from './dto/tutor.dto';
import { PronunciationRequestDto } from './dto/pronunciation.dto';
import {
  AI_PRONUNCIATION_SERVICE,
  AiPronunciationService,
} from './interfaces/ai-pronunciation.interface';
import {
  AI_TUTOR_SERVICE,
  AiTutorService,
  TutorResponse,
} from './interfaces/ai-tutor.interface';

@Injectable()
export class AiService {
  constructor(
    @Inject(AI_TUTOR_SERVICE)
    private readonly tutorService: AiTutorService,
    @Inject(AI_PRONUNCIATION_SERVICE)
    private readonly pronunciationService: AiPronunciationService,
    private readonly aiUsageService: AiUsageService,
    private readonly gamificationService: GamificationService,
    private readonly aiCache: AiCacheService,
  ) {}

  async tutor(
    userId: string,
    dto: TutorRequestDto,
  ): Promise<TutorResponse & { usage: { used: number; limit: number } }> {
    const usage = await this.aiUsageService.checkAndIncrement(
      userId,
      AiUsageType.TUTOR,
    );

    await this.gamificationService.recordActivity(userId);

    const cacheKey = this.aiCache.buildKey({
      type: 'tutor',
      message: dto.message,
      context: dto.context ?? '',
    });

    const response = await this.aiCache.getOrSet(cacheKey, () =>
      this.tutorService.generateTutorResponse({
        userId,
        message: dto.message,
        context: dto.context,
      }),
    );

    return { ...response, usage };
  }

  async pronunciation(userId: string, dto: PronunciationRequestDto) {
    const usage = await this.aiUsageService.checkAndIncrement(
      userId,
      AiUsageType.PRONUNCIATION,
    );

    await this.gamificationService.recordActivity(userId);

    const cacheKey = this.aiCache.buildKey({
      type: 'pronunciation',
      text: dto.text,
      sentenceId: dto.sentenceId ?? '',
    });

    const result = await this.aiCache.getOrSet(cacheKey, () =>
      this.pronunciationService.scorePronunciation({
        userId,
        text: dto.text,
        sentenceId: dto.sentenceId,
        audioSimulated: dto.audioSimulated ?? true,
      }),
    );

    return { ...result, usage };
  }
}
