import { DailyMetric } from './trend-calculator';

export interface DailyActivityRow {
  activityDate: Date;
  activityCount: number;
  minutesSpent: number;
  modulesUsed?: string[];
}

export function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

/** Build a 7-day time series ending today (inclusive). */
export function buildLast7DaySeries(
  rows: DailyActivityRow[],
  valueSelector: (row: DailyActivityRow) => number = (row) => row.activityCount,
): DailyMetric[] {
  const byDate = new Map(
    rows.map((row) => [utcDateKey(row.activityDate), row]),
  );
  const series: DailyMetric[] = [];
  const today = startOfUtcDay(new Date());

  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - offset);
    const key = utcDateKey(day);
    const row = byDate.get(key);
    series.push({
      date: key,
      value: row ? valueSelector(row) : 0,
    });
  }

  return series;
}

/** Prior 7 days immediately before the last 7 days. */
export function buildPrior7DaySeries(
  rows: DailyActivityRow[],
  valueSelector: (row: DailyActivityRow) => number = (row) => row.activityCount,
): DailyMetric[] {
  const byDate = new Map(
    rows.map((row) => [utcDateKey(row.activityDate), row]),
  );
  const series: DailyMetric[] = [];
  const today = startOfUtcDay(new Date());

  for (let offset = 13; offset >= 7; offset -= 1) {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - offset);
    const key = utcDateKey(day);
    const row = byDate.get(key);
    series.push({
      date: key,
      value: row ? valueSelector(row) : 0,
    });
  }

  return series;
}
