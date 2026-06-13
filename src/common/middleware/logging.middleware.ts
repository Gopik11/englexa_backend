import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

const SLOW_REQUEST_MS = 500;

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  private readonly isDebug =
    process.env.NODE_ENV !== 'production';

  use(req: Request, res: Response, next: NextFunction): void {
    if (!this.isDebug) {
      next();
      return;
    }

    const start = Date.now();
    const { method, originalUrl } = req;

    res.on('finish', () => {
      const durationMs = Date.now() - start;
      const { statusCode } = res;
      const safePath = _sanitizePath(originalUrl);
      const message = `${method} ${safePath} ${statusCode} ${durationMs}ms`;

      if (durationMs >= SLOW_REQUEST_MS) {
        this.logger.warn(`SLOW ${message}`);
      } else {
        this.logger.debug(message);
      }
    });

    next();
  }
}

function _sanitizePath(url: string): string {
  return url.replace(/(password|token|secret)=[^&]+/gi, '$1=[REDACTED]');
}
