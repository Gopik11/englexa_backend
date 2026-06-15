/**
 * Route registration fix:
 * - Controllers lived in a separate modules/ai AiModule while production only
 *   reliably served routes from src/ai/ai.module.ts (tutor/pronunciation).
 * - Vocabulary used GET (stub) instead of POST (pipeline).
 * - POST /api/v1/ai/vocabulary returned 404 "Cannot POST" on the running server.
 */
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { successResponse } from '../../../common/dto/api-response.dto';
import { GenerateVocabularyDto } from '../../content-pipeline/dto/generate-vocabulary.dto';
import { ContentPipelineService } from '../../content-pipeline/services/content-pipeline.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiVocabularyController {
  constructor(
    private readonly contentPipelineService: ContentPipelineService,
  ) {}

  @Post('vocabulary')
  async generateVocabulary(@Body() dto: GenerateVocabularyDto) {
    return successResponse(
      await this.contentPipelineService.generateVocabulary(dto),
    );
  }
}
