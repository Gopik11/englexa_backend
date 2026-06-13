import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppRole } from '../common/constants/roles';
import { Roles } from '../common/decorators/roles.decorator';
import { successResponse } from '../common/dto/api-response.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { AnalyticsService } from './analytics.service';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AppRole.ADMIN)
export class AdminAnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async overview() {
    const data = await this.analyticsService.getOverview();
    return successResponse(data);
  }

  @Get('lessons')
  async lessons() {
    const data = await this.analyticsService.getLessonAnalytics();
    return successResponse(data);
  }
}
