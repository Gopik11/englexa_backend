import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { normalizeResponse } from '../common/utils/response-normalizer.util';
import { AiService } from './ai.service';
import { PronunciationRequestDto } from './dto/pronunciation.dto';
import { TutorRequestDto } from './dto/tutor.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  @Post('tutor')
  async tutor(
    @CurrentUser() user: AuthJwtPayload,
    @Body() dto: TutorRequestDto,
  ) {
    try {
      const result = await this.aiService.tutor(user.sub, dto);
      return normalizeResponse(result);
    } catch (err) {
      this.logger.error(
        `ai/tutor failed user=${user.sub}`,
        err instanceof Error ? err.message : err,
      );
      return normalizeResponse(
        {
          reply:
            'I am temporarily unavailable. Keep practicing — short daily sessions help the most.',
          usage: { used: 0, limit: 999 },
          aiDegraded: true,
        },
        'AI tutor temporarily unavailable',
      );
    }
  }

  @Post('pronunciation')
  async pronunciation(
    @CurrentUser() user: AuthJwtPayload,
    @Body() dto: PronunciationRequestDto,
  ) {
    try {
      const result = await this.aiService.pronunciation(user.sub, dto);
      return normalizeResponse(result);
    } catch (err) {
      this.logger.error(
        `ai/pronunciation failed user=${user.sub}`,
        err instanceof Error ? err.message : err,
      );
      return normalizeResponse(
        {
          overallScore: 70,
          wordScores: [],
          usage: { used: 0, limit: 999 },
          aiDegraded: true,
        },
        'Pronunciation scoring temporarily unavailable',
      );
    }
  }
}
