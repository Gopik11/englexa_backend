import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from '../types/express-http';

const SLOW_REQUEST_MS = 500;
const MAX_BODY_LOG_CHARS = 512;

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    const { method, originalUrl } = req;
    const safePath = sanitizePath(originalUrl);

    if (method !== 'GET' && req.body && typeof req.body === 'object') {
      this.logger.log(
        `[${method}] ${safePath} body=${summarizeBody(req.body)}`,
      );
    } else {
      this.logger.log(`[${method}] ${safePath}`);
    }

    res.on('finish', () => {
      const durationMs = Date.now() - start;
      const { statusCode } = res;
      const message = `${method} ${safePath} ${statusCode} ${durationMs}ms`;

      if (durationMs >= SLOW_REQUEST_MS || statusCode >= 500) {
        this.logger.warn(message);
      } else {
        this.logger.debug(message);
      }
    });

    next();
  }
}

function sanitizePath(url: string): string {
  return url.replace(/(password|token|secret)=[^&]+/gi, '$1=[REDACTED]');
}

function summarizeBody(body: Record<string, unknown>): string {
  const redacted = { ...body };
  for (const key of ['audioBase64', 'password', 'token', 'refreshToken']) {
    if (key in redacted) {
      const value = redacted[key];
      redacted[key] =
        typeof value === 'string'
          ? `[redacted len=${value.length}]`
          : '[redacted]';
    }
  }

  const serialized = JSON.stringify(redacted);
  if (serialized.length <= MAX_BODY_LOG_CHARS) {
    return serialized;
  }
  return `${serialized.slice(0, MAX_BODY_LOG_CHARS)}…`;
}
