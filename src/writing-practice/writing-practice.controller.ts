import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { mapEnrichedFeedbackToApi } from '../common/utils/enriched-feedback.mapper';
import { normalizeResponse } from '../common/utils/response-normalizer.util';
import {
  buildWritingFallback,
  normalizeWritingSubmitPayload,
  validateWritingText,
} from '../common/utils/writing-response.util';
import { GetWritingPromptDto } from './dto/get-writing-prompt.dto';
import { SubmitWritingDto } from './dto/submit-writing.dto';
import { WritingPracticeService } from './writing-practice.service';
import { validateWritingTopicForLevel } from './utils/validate-writing-params';

@Controller('writing')
@UseGuards(JwtAuthGuard)
export class WritingPracticeController {
  private readonly logger = new Logger(WritingPracticeController.name);

  constructor(private readonly writingPracticeService: WritingPracticeService) {}

  @Get(':level/:topic')
  async getWritingPrompt(
    @CurrentUser() user: AuthJwtPayload,
    @Param() params: GetWritingPromptDto,
  ) {
    validateWritingTopicForLevel(params.level, params.topic);

    const result = await this.writingPracticeService.getWritingPrompt(
      user.sub,
      params.level,
      params.topic,
    );

    return normalizeResponse(result);
  }

  @Post('submit')
  async submitWriting(
    @CurrentUser() user: AuthJwtPayload,
    @Body() dto: SubmitWritingDto,
  ) {
    validateWritingTopicForLevel(dto.level, dto.topic);
    validateWritingText(dto.text);

    try {
      const result = await this.writingPracticeService.submitWriting(
        user.sub,
        dto.level,
        dto.topic,
        dto.text,
      );

      return normalizeResponse({
        ...normalizeWritingSubmitPayload(result),
        ...mapEnrichedFeedbackToApi(result),
      });
    } catch (err) {
      this.logger.error(
        `writing/submit failed user=${user.sub} topic=${dto.topic}`,
        err instanceof Error ? err.message : err,
      );

      const fallback = buildWritingFallback(
        user.sub,
        dto.level,
        dto.topic,
        dto.text,
      );

      return normalizeResponse(
        normalizeWritingSubmitPayload({
          ...fallback,
          xpEarned: 0,
          streak: 0,
          difficultyLevel: 1,
          errorPattern: null,
        }),
        'AI temporarily unavailable — showing offline feedback',
      );
    }
  }
}
