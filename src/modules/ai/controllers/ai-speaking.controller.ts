import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { successResponse } from '../../../common/dto/api-response.dto';
import { GenerateSpeakingDto } from '../../content-pipeline/dto/generate-speaking.dto';
import { ContentPipelineService } from '../../content-pipeline/services/content-pipeline.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiSpeakingController {
  constructor(
    private readonly contentPipelineService: ContentPipelineService,
  ) {}

  @Post('speaking')
  async generateSpeaking(@Body() dto: GenerateSpeakingDto) {
    return successResponse(
      await this.contentPipelineService.generateSpeaking(dto),
    );
  }
}
