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
 * Display streak: 0 if more than one day has passed since last activity.
 */
export function effectiveStreak(
  streak: number,
  lastActive: Date | null,
  now = new Date(),
): number {
  if (!lastActive || streak <= 0) {
    return 0;
  }

  const gap = utcDayDiff(lastActive, now);
  if (gap > 1) {
    return 0;
  }

  return streak;
}

/**
 * If last_active was yesterday → streak++.
 * If more than one day gap → streak = 0, then becomes 1 on new activity.
 * Same day → keep streak.
 */
export function computeStreakUpdate(
  currentStreak: number,
  lastActive: Date | null,
  now = new Date(),
): number {
  if (!lastActive) {
    return 1;
  }

  const gap = utcDayDiff(lastActive, now);

  if (gap === 0) {
    return currentStreak || 1;
  }

  if (gap === 1) {
    return (currentStreak || 0) + 1;
  }

  return 0;
}

/**
 * After streak reset to 0 on a gap > 1 day, first activity starts a new streak at 1.
 */
export function streakAfterActivity(
  currentStreak: number,
  lastActive: Date | null,
  now = new Date(),
): number {
  const updated = computeStreakUpdate(currentStreak, lastActive, now);
  return updated === 0 ? 1 : updated;
}
