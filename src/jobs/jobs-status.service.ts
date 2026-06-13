import { Injectable } from '@nestjs/common';

export type JobPeriod = 'daily' | 'weekly' | 'monthly';

export interface JobRunStatus {
  period: JobPeriod;
  last_run: string | null;
  users_processed: number;
  success: boolean;
  message?: string;
}

@Injectable()
export class JobsStatusService {
  private readonly runs = new Map<JobPeriod, JobRunStatus>();

  record(
    period: JobPeriod,
    usersProcessed: number,
    success = true,
    message?: string,
  ): void {
    this.runs.set(period, {
      period,
      last_run: new Date().toISOString(),
      users_processed: usersProcessed,
      success,
      message,
    });
  }

  getStatus(): JobRunStatus[] {
    const periods: JobPeriod[] = ['daily', 'weekly', 'monthly'];
    return periods.map(
      (period) =>
        this.runs.get(period) ?? {
          period,
          last_run: null,
          users_processed: 0,
          success: true,
        },
    );
  }

  getLastDailyRun(): Date | null {
    const daily = this.runs.get('daily');
    if (!daily?.last_run) return null;
    return new Date(daily.last_run);
  }
}
