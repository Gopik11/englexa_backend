/**
 * Applies gentle mastery decay for concepts inactive beyond the threshold.
 */
export function decayMasteryScore(
  score: number,
  daysSinceActivity: number,
  thresholdDays = 14,
): number {
  if (daysSinceActivity < thresholdDays) {
    return score;
  }

  const overdueDays = daysSinceActivity - thresholdDays;
  const decay = Math.min(25, Math.floor(overdueDays / 7) * 3);
  return Math.max(0, score - decay);
}

export function daysSince(date: Date | null | undefined, now = new Date()): number {
  if (!date) {
    return 999;
  }

  const ms = now.getTime() - date.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}
