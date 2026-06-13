import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

interface Bucket {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly buckets = new Map<string, Bucket>();

  use(req: Request, res: Response, next: NextFunction): void {
    const key = this.resolveKey(req);
    const now = Date.now();
    const bucket = this.buckets.get(key) ?? { count: 0, resetAt: now + WINDOW_MS };

    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + WINDOW_MS;
    }

    bucket.count += 1;
    this.buckets.set(key, bucket);

    res.setHeader('X-RateLimit-Limit', String(MAX_REQUESTS));
    res.setHeader(
      'X-RateLimit-Remaining',
      String(Math.max(0, MAX_REQUESTS - bucket.count)),
    );
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > MAX_REQUESTS) {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Try again in a minute.',
      });
      return;
    }

    next();
  }

  private resolveKey(req: Request): string {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      const token = auth.slice(7);
      const payloadPart = token.split('.')[1];
      if (payloadPart) {
        try {
          const payload = JSON.parse(
            Buffer.from(payloadPart, 'base64url').toString('utf8'),
          ) as { sub?: string };
          if (payload.sub) {
            return `user:${payload.sub}`;
          }
        } catch {
          // fall through to IP
        }
      }
    }

    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0]?.trim()
        : req.ip ?? 'unknown';

    return `ip:${ip}`;
  }
}
