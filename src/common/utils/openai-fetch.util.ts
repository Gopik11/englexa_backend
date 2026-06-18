const DEFAULT_TIMEOUT_MS = 60_000;
const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);
const DEFAULT_RETRIES = 3;

export async function openAiFetch(
  url: string,
  init: RequestInit,
  options: { timeoutMs?: number; retries?: number } = {},
): Promise<Response> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? DEFAULT_RETRIES;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      if (!response.ok && RETRYABLE_STATUS.has(response.status) && attempt < retries) {
        await sleep(400 * (attempt + 1));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(400 * (attempt + 1));
        continue;
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new Error('OpenAI request failed');
}

export function resolveOpenAiApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY ?? process.env.SPEECH_API_KEY;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
