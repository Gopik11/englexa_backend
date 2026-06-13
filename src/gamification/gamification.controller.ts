import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { successResponse } from '../common/dto/api-response.dto';
import { GamificationService } from './gamification.service';
import { XpActivity } from './entities/xp.entity';

class AddXpDto {
  activity!: XpActivity;
  amount?: number;
}

@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('status')
  async getStatus(@CurrentUser() user: AuthJwtPayload) {
    const status = await this.gamificationService.getStatus(user.sub);
    return successResponse(status);
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: AuthJwtPayload) {
    const profile = await this.gamificationService.getProfile(user.sub);
    return successResponse(profile);
  }

  @Post('add-xp')
  async addXp(@CurrentUser() user: AuthJwtPayload, @Body() body: AddXpDto) {
    if (body.activity) {
      const result = await this.gamificationService.awardActivityXp(
        user.sub,
        body.activity,
      );
      return successResponse(result);
    }

    const xp = await this.gamificationService.addXp(
      user.sub,
      body.amount ?? 0,
    );
    return successResponse({ xp });
  }

  @Post('reset-streak')
  async resetStreak(@CurrentUser() user: AuthJwtPayload) {
    const streak = await this.gamificationService.resetStreak(user.sub);
    return successResponse({ streak });
  }
}
