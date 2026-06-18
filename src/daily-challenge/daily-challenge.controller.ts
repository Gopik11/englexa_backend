import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationQueryDto, paginateArray } from '../common/dto/pagination.dto';
import { normalizeResponse } from '../common/utils/response-normalizer.util';
import { DailyChallengeService } from './daily-challenge.service';
import { SubmitChallengeDto } from './entities/daily-challenge.entity';

@Controller('daily-challenge')
@UseGuards(JwtAuthGuard)
export class DailyChallengeController {
  constructor(private readonly dailyChallengeService: DailyChallengeService) {}

  @Get('today/:userId')
  async getToday(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthJwtPayload,
  ) {
    await this.dailyChallengeService.assertUserAccess(userId, user.sub);
    const challenge = await this.dailyChallengeService.getTodayChallenge(userId);
    return normalizeResponse(challenge);
  }

  @Post('submit')
  async submit(
    @CurrentUser() user: AuthJwtPayload,
    @Body() body: SubmitChallengeDto,
  ) {
    const result = await this.dailyChallengeService.submitChallenge(
      user.sub,
      body.answer ?? '',
    );
    return normalizeResponse(result);
  }

  @Get('history/:userId')
  async getHistory(
    @Param('userId') userId: string,
    @Query() query: PaginationQueryDto,
    @CurrentUser() user: AuthJwtPayload,
  ) {
    await this.dailyChallengeService.assertUserAccess(userId, user.sub);
    const history = await this.dailyChallengeService.getChallengeHistory(userId);
    return normalizeResponse(paginateArray(history, query.page, query.limit));
  }
}

