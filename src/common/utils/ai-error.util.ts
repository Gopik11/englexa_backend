import { Logger } from '@nestjs/common';
import { resolveOpenAiApiKey } from './openai-fetch.util';

export type AiOperation =
  | 'chat'
  | 'stt'
  | 'tts'
  | 'detect-language'
  | 'translate'
  | 'evaluate-speaking'
  | 'evaluate-writing';

export interface AiCallContext {
  operation: AiOperation;
  route?: string;
  userId?: string;
  model?: string;
}

export function isAiDevMode(): boolean {
  return process.env.AI_DEV_MODE === 'true';
}

export function isAiConfigured(): boolean {
  const key = resolveOpenAiApiKey();
  return Boolean(key && key.trim().length > 0);
}

export function logAiCallStart(logger: Logger, context: AiCallContext): number {
  logger.log(
    JSON.stringify({
      event: 'ai_call_start',
      operation: context.operation,
      route: context.route,
      userId: context.userId,
      model: context.model,
    }),
  );
  return Date.now();
}

export function logAiCallSuccess(
  logger: Logger,
  context: AiCallContext,
  startedAt: number,
): void {
  logger.log(
    JSON.stringify({
      event: 'ai_call_success',
      operation: context.operation,
      route: context.route,
      userId: context.userId,
      durationMs: Date.now() - startedAt,
    }),
  );
}

export function logAiCallFailure(
  logger: Logger,
  context: AiCallContext,
  error: unknown,
  startedAt?: number,
): void {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(
    JSON.stringify({
      event: 'ai_call_failed',
      operation: context.operation,
      route: context.route,
      userId: context.userId,
      durationMs: startedAt ? Date.now() - startedAt : undefined,
      cause: message,
    }),
  );
}

export function aiUnavailableMessage(operation: AiOperation): string {
  if (!isAiConfigured()) {
    return 'AI service is not configured. Set OPENAI_API_KEY on the server.';
  }
  return `AI ${operation} is temporarily unavailable. Please try again.`;
}
