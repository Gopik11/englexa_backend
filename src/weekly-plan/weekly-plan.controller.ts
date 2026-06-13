import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { successResponse } from '../common/dto/api-response.dto';
import { WeeklyPlanService } from './weekly-plan.service';

@Controller('weekly-plan')
@UseGuards(JwtAuthGuard)
export class WeeklyPlanController {
  constructor(private readonly weeklyPlanService: WeeklyPlanService) {}

  @Get()
  async getWeeklyPlan(@CurrentUser() user: AuthJwtPayload) {
    const plan = await this.weeklyPlanService.getWeeklyPlan(user.sub);
    return successResponse(plan);
  }
}
