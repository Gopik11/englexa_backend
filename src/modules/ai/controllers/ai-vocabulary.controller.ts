/**
 * Route registration fix:
 * - Controllers lived in a separate modules/ai AiModule while production only
 *   reliably served routes from src/ai/ai.module.ts (tutor/pronunciation).
 * - Vocabulary used GET (stub) instead of POST (pipeline).
 * - POST /api/v1/ai/vocabulary returned 404 "Cannot POST" on the running server.
 */
import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { normalizeResponse } from '../../../common/utils/response-normalizer.util';
import { GenerateVocabularyDto } from '../../content-pipeline/dto/generate-vocabulary.dto';
import { ContentPipelineService } from '../../content-pipeline/services/content-pipeline.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiVocabularyController {
  private readonly logger = new Logger(AiVocabularyController.name);

  constructor(
    private readonly contentPipelineService: ContentPipelineService,
  ) {}

  @Post('vocabulary')
  async generateVocabulary(@Body() dto: GenerateVocabularyDto) {
    try {
      return normalizeResponse(
        await this.contentPipelineService.generateVocabulary(dto),
      );
    } catch (err) {
      this.logger.error(
        'ai/vocabulary failed',
        err instanceof Error ? err.message : err,
      );
      return normalizeResponse(
        {
          mode: 'vocabulary-practice',
          exercises: [],
          effectiveLevel: dto.level,
          difficultyLevel: 1,
          hasMore: false,
          jsonRemaining: 0,
          aiDegraded: true,
        },
        'AI temporarily unavailable — try again later',
      );
    }
  }
}
