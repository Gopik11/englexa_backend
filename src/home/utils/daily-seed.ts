/** UTC date key YYYY-MM-DD for daily content rotation. */
export function todayUtcKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Deterministic daily seed from user + feature + date. */
export function dailySeed(userId: string, feature: string, dateKey = todayUtcKey()): number {
  const raw = `${userId}:${feature}:${dateKey}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function pickDailyIndex(userId: string, feature: string, poolSize: number): number {
  if (poolSize <= 0) {
    return 0;
  }
  return dailySeed(userId, feature) % poolSize;
}

/** Milliseconds until next UTC midnight (cache TTL). */
export function msUntilUtcMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
  return Math.max(tomorrow.getTime() - now.getTime(), 60_000);
}
