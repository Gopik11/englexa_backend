import { DailyActivityRow, startOfUtcDay, utcDateKey } from './time-series-generator';

/** 5 weeks × 7 days activity intensity grid (0–4). */
export function generateHeatmap(rows: DailyActivityRow[]): number[][] {
  const byDate = new Map(
    rows.map((row) => [utcDateKey(row.activityDate), row]),
  );

  const grid: number[][] = [];
  const today = startOfUtcDay(new Date());

  for (let week = 4; week >= 0; week -= 1) {
    const weekRow: number[] = [];
    for (let day = 6; day >= 0; day -= 1) {
      const offset = week * 7 + day;
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() - offset);
      const key = utcDateKey(date);
      const row = byDate.get(key);
      weekRow.push(intensityFromRow(row));
    }
    grid.push(weekRow);
  }

  return grid;
}

function intensityFromRow(row?: DailyActivityRow): number {
  if (!row || row.activityCount <= 0) {
    return 0;
  }
  if (row.activityCount >= 15) {
    return 4;
  }
  if (row.activityCount >= 10) {
    return 3;
  }
  if (row.activityCount >= 5) {
    return 2;
  }
  return 1;
}
