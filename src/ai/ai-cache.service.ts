import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import { CacheKeys, CacheTtl } from '../common/cache/cache-keys';
import { CachedDataService } from '../common/cache/cached-data.service';

@Injectable()
export class AiCacheService {
  constructor(private readonly cachedData: CachedDataService) {}

  buildKey(parts: Record<string, unknown>): string {
    const raw = JSON.stringify(parts);
    const hash = createHash('sha256').update(raw).digest('hex').slice(0, 32);
    return CacheKeys.aiResponse(hash);
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlMs = CacheTtl.oneHour,
  ): Promise<T> {
    return this.cachedData.getOrSet(key, ttlMs, factory);
  }

  async invalidate(key: string): Promise<void> {
    await this.cachedData.invalidate(key);
  }
}
