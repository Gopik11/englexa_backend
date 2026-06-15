export const configuration = () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresInSeconds: parseInt(
      process.env.JWT_ACCESS_EXPIRES_IN_SECONDS ?? '900',
      10,
    ),
    refreshExpiresInSeconds: parseInt(
      process.env.JWT_REFRESH_EXPIRES_IN_SECONDS ?? '604800',
      10,
    ),
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://127.0.0.1:6379',
    enabled: process.env.REDIS_ENABLED === 'true',
  },
  jobs: {
    enabled: process.env.JOBS_ENABLED !== 'false',
  },
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    freeTutorDailyLimit: parseInt(process.env.AI_FREE_TUTOR_DAILY_LIMIT ?? '5', 10),
    premiumTutorDailyLimit: parseInt(
      process.env.AI_PREMIUM_TUTOR_DAILY_LIMIT ?? '20',
      10,
    ),
    freePronunciationDailyLimit: parseInt(
      process.env.AI_FREE_PRONUNCIATION_DAILY_LIMIT ?? '3',
      10,
    ),
    premiumPronunciationDailyLimit: parseInt(
      process.env.AI_PREMIUM_PRONUNCIATION_DAILY_LIMIT ?? '10',
      10,
    ),
  },
});
