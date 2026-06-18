import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { normalizeResponse } from '../../../common/utils/response-normalizer.util';
import { GenerateSpeakingDto } from '../../content-pipeline/dto/generate-speaking.dto';
import { ContentPipelineService } from '../../content-pipeline/services/content-pipeline.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiSpeakingController {
  private readonly logger = new Logger(AiSpeakingController.name);

  constructor(
    private readonly contentPipelineService: ContentPipelineService,
  ) {}

  @Post('speaking')
  async generateSpeaking(@Body() dto: GenerateSpeakingDto) {
    try {
      return normalizeResponse(
        await this.contentPipelineService.generateSpeaking(dto),
      );
    } catch (err) {
      this.logger.error(
        'ai/speaking failed',
        err instanceof Error ? err.message : err,
      );
      return normalizeResponse(
        {
          reply: 'Here is your speaking practice prompt.',
          sessionId: `offline_${Date.now()}`,
          confidence: 0.85,
          aiDegraded: true,
          prompt: {
            id: `offline_${dto.topic}_${Date.now()}`,
            level: dto.level,
            topic: dto.topic,
            prompt: `Speak about ${dto.topic.replace(/_/g, ' ')}.`,
            example_answer: 'A clear, natural sample answer for the learner.',
          },
        },
        'AI temporarily unavailable — showing offline prompt',
      );
    }
  }
}
