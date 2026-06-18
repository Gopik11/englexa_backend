import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { normalizeResponse } from '../../common/utils/response-normalizer.util';import { ConfidenceService } from './confidence.service';
import { RecordConfidenceDto } from './dto/record-confidence.dto';

@Controller('spoken-english/confidence')
@UseGuards(JwtAuthGuard)
export class ConfidenceController {
  constructor(private readonly confidenceService: ConfidenceService) {}

  @Post('record')
  async recordConfidence(
    @CurrentUser() user: AuthJwtPayload,
    @Body() dto: RecordConfidenceDto,
  ) {
    const result = await this.confidenceService.recordConfidence(user.sub, dto);
    return normalizeResponse({
      confidenceScore: result.confidenceScore ?? 0,
      feedback: result.feedback ?? '',
      encouragement: result.encouragement ?? '',
      sessionId: result.sessionId ?? '',
    });
  }

  @Get('history')
  async getHistory(@CurrentUser() user: AuthJwtPayload) {
    const history = await this.confidenceService.getHistory(user.sub);
    return normalizeResponse({
      history: history ?? [],
    });
  }
}

