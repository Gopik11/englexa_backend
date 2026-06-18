import { Controller, ForbiddenException, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppRole } from '../common/constants/roles';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { normalizeResponse } from '../common/utils/response-normalizer.util';
import { DailyJobsService } from './daily-jobs.service';
import { JobsStatusService } from './jobs-status.service';
import { MonthlyJobsService } from './monthly-jobs.service';
import { WeeklyJobsService } from './weekly-jobs.service';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(
    private readonly status: JobsStatusService,
    private readonly dailyJobs: DailyJobsService,
    private readonly weeklyJobs: WeeklyJobsService,
    private readonly monthlyJobs: MonthlyJobsService,
  ) {}

  @Get('status')
  getStatus() {
    return normalizeResponse({
      jobs: this.status.getStatus(),
      last_daily_run: this.status.getLastDailyRun()?.toISOString() ?? null,
    });
  }

  @Post('run/daily')
  async runDaily(@CurrentUser() user: AuthJwtPayload) {
    this.assertAdmin(user);
    await this.dailyJobs.runDailyJobs();
    return normalizeResponse({ started: true, period: 'daily' });
  }

  @Post('run/weekly')
  async runWeekly(@CurrentUser() user: AuthJwtPayload) {
    this.assertAdmin(user);
    await this.weeklyJobs.runWeeklyJobs();
    return normalizeResponse({ started: true, period: 'weekly' });
  }

  @Post('run/monthly')
  async runMonthly(@CurrentUser() user: AuthJwtPayload) {
    this.assertAdmin(user);
    await this.monthlyJobs.runMonthlyJobs();
    return normalizeResponse({ started: true, period: 'monthly' });
  }

  private assertAdmin(user: AuthJwtPayload): void {
    if (user.role !== AppRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
  }
}

