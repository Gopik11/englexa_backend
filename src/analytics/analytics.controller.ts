import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { successResponse } from '../common/dto/api-response.dto';
import { LearnerDashboardService } from './learner-dashboard.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    private readonly learnerDashboardService: LearnerDashboardService,
  ) {}

  @Get('dashboard')
  async getDashboard(@CurrentUser() user: AuthJwtPayload) {
    const dashboard = await this.learnerDashboardService.getDashboard(
      user.sub,
    );
    return successResponse(dashboard);
  }
}
