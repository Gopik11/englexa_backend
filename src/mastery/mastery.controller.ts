import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { successResponse } from '../common/dto/api-response.dto';
import { MasteryService } from './mastery.service';

@Controller('mastery')
@UseGuards(JwtAuthGuard)
export class MasteryController {
  constructor(private readonly masteryService: MasteryService) {}

  @Get('overview')
  async getOverview(@CurrentUser() user: AuthJwtPayload) {
    const overview = await this.masteryService.getOverview(user.sub);
    return successResponse(overview);
  }

  @Get('recommendation')
  async getRecommendation(@CurrentUser() user: AuthJwtPayload) {
    const recommendation = await this.masteryService.getRecommendation(
      user.sub,
    );
    return successResponse(recommendation);
  }
}
