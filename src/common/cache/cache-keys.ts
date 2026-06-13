import { todayUtcKey } from '../../home/utils/daily-seed';

export const CacheKeys = {
  dailyChallenge: (userId: string) =>
    `daily-challenge:${userId}:${todayUtcKey()}`,
  miniLessonFeatured: (userId: string) => `mini-lesson:featured:${userId}`,
  miniLessonsWeak: (userId: string) => `mini-lessons:weak:${userId}`,
  srsDue: (userId: string) => `srs:due:${userId}`,
  predictions: (userId: string) => `predictions:${userId}`,
  profile: (userId: string) => `profile:${userId}`,
  analyticsDashboard: (userId: string) =>
    `analytics:dashboard:${userId}:${todayUtcKey()}`,
  homeData: (userId: string) => `home:data:${userId}:${todayUtcKey()}`,
  aiResponse: (hash: string) => `ai:response:${hash}`,
};

export const CacheTtl = {
  fiveMinutes: 5 * 60 * 1000,
  fifteenMinutes: 15 * 60 * 1000,
  oneHour: 60 * 60 * 1000,
  untilMidnight: () => {
    const now = new Date();
    const tomorrow = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
    );
    return Math.max(tomorrow.getTime() - now.getTime(), 60_000);
  },
};
