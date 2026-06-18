import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { normalizeResponse } from '../common/utils/response-normalizer.util';
import { SubmitMissionDto } from './dto/submit-mission.dto';
import { MissionsService } from './missions.service';

@Controller('missions')
@UseGuards(JwtAuthGuard)
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Get('today')
  async getToday(@CurrentUser() user: AuthJwtPayload) {
    const mission = await this.missionsService.getTodayMission(user.sub);
    return normalizeResponse(mission);
  }

  @Post('submit')
  async submit(
    @CurrentUser() user: AuthJwtPayload,
    @Body() dto: SubmitMissionDto,
  ) {
    const result = await this.missionsService.submitMission(
      user.sub,
      dto.answer,
    );
    return normalizeResponse(result);
  }
}

