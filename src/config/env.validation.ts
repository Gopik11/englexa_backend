export function validateConfig(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const nodeEnv = (config.NODE_ENV as string | undefined) ?? 'development';
  const errors: string[] = [];

  if (!config.DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  }

  if (!config.OPENAI_API_KEY) {
    errors.push('OPENAI_API_KEY is required');
  }

  const accessSecret = config.JWT_ACCESS_SECRET;
  if (!accessSecret || String(accessSecret).length < 32) {
    errors.push('JWT_ACCESS_SECRET must be at least 32 characters');
  }

  const refreshSecret = config.JWT_REFRESH_SECRET;
  if (!refreshSecret || String(refreshSecret).length < 32) {
    errors.push('JWT_REFRESH_SECRET must be at least 32 characters');
  }

  const port = parseInt(String(config.PORT ?? '3000'), 10);
  if (Number.isNaN(port) || port <= 0) {
    errors.push('PORT must be a positive number');
  }

  if (errors.length > 0 && nodeEnv === 'production') {
    throw new Error(`Environment validation failed:\n- ${errors.join('\n- ')}`);
  }

  return config;
}
