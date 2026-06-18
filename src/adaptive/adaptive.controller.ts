import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { normalizeResponse } from '../common/utils/response-normalizer.util';
import { AdaptiveService } from './adaptive.service';
import { AdaptiveModule } from './entities/difficulty.entity';

class RecordResultDto {
  module!: AdaptiveModule;
  concept!: string;
  isCorrect!: boolean;
}

class GetDifficultyDto {
  module!: AdaptiveModule;
  concept!: string;
}

@Controller('adaptive')
@UseGuards(JwtAuthGuard)
export class AdaptiveController {
  constructor(private readonly adaptiveService: AdaptiveService) {}

  @Post('record')
  async recordResult(
    @CurrentUser() user: AuthJwtPayload,
    @Body() body: RecordResultDto,
  ) {
    const state = await this.adaptiveService.recordResult(
      user.sub,
      body.module,
      body.concept,
      body.isCorrect,
    );

    return normalizeResponse(state);
  }

  @Get('difficulty')
  async getDifficulty(
    @CurrentUser() user: AuthJwtPayload,
    @Query() query: GetDifficultyDto,
  ) {
    const state = await this.adaptiveService.getDifficulty(
      user.sub,
      query.module,
      query.concept,
    );

    return normalizeResponse(state);
  }
}

