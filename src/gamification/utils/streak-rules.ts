export function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function utcDayDiff(from: Date, to: Date): number {
  const startFrom = startOfUtcDay(from).getTime();
  const startTo = startOfUtcDay(to).getTime();
  return Math.round((startTo - startFrom) / (1000 * 60 * 60 * 24));
}

/**
 * Returns the streak value shown to the user. Resets to 0 if a day was missed.
 */
export function effectiveStreak(
  streak: number,
  lastActiveAt: Date | null,
  now = new Date(),
): number {
  if (!lastActiveAt || streak <= 0) {
    return 0;
  }

  const gap = utcDayDiff(lastActiveAt, now);
  if (gap > 1) {
    return 0;
  }

  return streak;
}

/**
 * Computes the next streak after login or practice activity.
 */
export function computeNextStreak(
  currentStreak: number,
  lastActiveAt: Date | null,
  now = new Date(),
): number {
  if (!lastActiveAt) {
    return 1;
  }

  const gap = utcDayDiff(lastActiveAt, now);

  if (gap === 0) {
    return currentStreak || 1;
  }

  if (gap === 1) {
    return (currentStreak || 0) + 1;
  }

  return 1;
}
