import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Level } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { normalizeResponse } from '../common/utils/response-normalizer.util';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { SubmitProgressDto } from './dto/submit-progress.dto';
import { ProgressService } from './progress.service';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post()
  async submit(
    @CurrentUser() user: AuthJwtPayload,
    @Body() dto: SubmitProgressDto,
  ) {
    const result = await this.progressService.submit(user.sub, dto);
    return normalizeResponse(result);
  }

  @Get('summary')
  async summary(
    @CurrentUser() user: AuthJwtPayload,
    @Query('level') level?: Level,
  ) {
    const summary = await this.progressService.getSummary(user.sub, level);
    return normalizeResponse(summary);
  }

  @Get('grammar')
  async grammarMastery(@CurrentUser() user: AuthJwtPayload) {
    const mastery = await this.progressService.getGrammarConceptMastery(
      user.sub,
    );
    return normalizeResponse({ concepts: mastery });
  }
}

