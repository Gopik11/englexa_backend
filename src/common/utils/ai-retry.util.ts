const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY_MS = 400;
const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);

export interface AiRetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  timeoutMs?: number;
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isRetryableHttpStatus(status: number): boolean {
  return RETRYABLE_STATUS.has(status);
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  options: AiRetryOptions = {},
): Promise<Response> {
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const baseDelayMs = options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
  const timeoutMs = options.timeoutMs ?? 60_000;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      if (
        !response.ok &&
        isRetryableHttpStatus(response.status) &&
        attempt < maxRetries
      ) {
        await sleep(baseDelayMs * 2 ** attempt);
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await sleep(baseDelayMs * 2 ** attempt);
        continue;
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new Error('Request failed after retries');
}

export async function runWithRetry<T>(
  operation: () => Promise<T>,
  options: AiRetryOptions = {},
): Promise<T> {
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const baseDelayMs = options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await sleep(baseDelayMs * 2 ** attempt);
        continue;
      }
      throw error;
    }
  }

  throw lastError ?? new Error('Operation failed after retries');
}
