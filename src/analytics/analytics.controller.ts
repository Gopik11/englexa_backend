import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { normalizeResponse } from '../common/utils/response-normalizer.util';
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
    return normalizeResponse(dashboard);
  }
}

