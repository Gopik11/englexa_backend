import { fetchWithRetry } from './ai-retry.util';

export async function openAiFetch(
  url: string,
  init: RequestInit,
  options: { timeoutMs?: number; retries?: number } = {},
): Promise<Response> {
  return fetchWithRetry(url, init, {
    timeoutMs: options.timeoutMs ?? 60_000,
    maxRetries: options.retries ?? 3,
  });
}

export function resolveOpenAiApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY ?? process.env.SPEECH_API_KEY;
}
