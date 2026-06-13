import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { successResponse } from '../common/dto/api-response.dto';
import { UpdateXpDto } from './entities/profile.entity';
import { ProfileService } from './profile.service';
import { ProfileXpSource } from './utils/xp-calculator';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('badges/:userId')
  async getBadges(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthJwtPayload,
  ) {
    await this.profileService.assertUserAccess(userId, user.sub);
    const badges = await this.profileService.getBadges(userId);
    return successResponse({ badges });
  }

  @Get('achievements/:userId')
  async getAchievements(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthJwtPayload,
  ) {
    await this.profileService.assertUserAccess(userId, user.sub);
    const achievements = await this.profileService.getAchievements(userId);
    return successResponse({ achievements });
  }

  @Get(':userId')
  async getProfile(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthJwtPayload,
  ) {
    await this.profileService.assertUserAccess(userId, user.sub);
    const profile = await this.profileService.getProfile(userId);
    return successResponse(profile);
  }

  @Post('update-xp')
  async updateXp(
    @CurrentUser() user: AuthJwtPayload,
    @Body() body: UpdateXpDto,
  ) {
    const source = body.source as ProfileXpSource | undefined;
    const result = source
      ? await this.profileService.awardXpForActivity(user.sub, source, {
          perfectAccuracy: body.perfect_accuracy,
          customAmount: body.amount,
        })
      : await this.profileService.updateXP(user.sub, body.amount ?? 0, {
          perfectAccuracy: body.perfect_accuracy,
        });

    return successResponse(result);
  }

  @Post('update-streak')
  async updateStreak(@CurrentUser() user: AuthJwtPayload) {
    const streak = await this.profileService.updateStreak(user.sub);
    return successResponse({ streak });
  }
}
