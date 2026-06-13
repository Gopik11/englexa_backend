export interface DailyMetric {
  date: string;
  value: number;
}

/**
 * Returns percent change between recent window and prior window.
 * Positive = improvement, negative = decline.
 */
export function calculateTrend(
  recent: DailyMetric[],
  prior: DailyMetric[],
): number {
  const recentAvg = average(recent.map((item) => item.value));
  const priorAvg = average(prior.map((item) => item.value));

  if (priorAvg === 0) {
    return recentAvg > 0 ? 100 : 0;
  }

  return Math.round(((recentAvg - priorAvg) / priorAvg) * 100);
}

export function sumValues(metrics: DailyMetric[]): number {
  return metrics.reduce((sum, item) => sum + item.value, 0);
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
