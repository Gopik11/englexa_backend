import { Injectable } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';

@Injectable()
export class CachedDataService {
  constructor(private readonly cache: RedisCacheService) {}

  async getOrSet<T>(
    key: string,
    ttlMs: number,
    factory: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.cache.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    await this.cache.set(key, value, ttlMs);
    return value;
  }

  async invalidate(key: string): Promise<void> {
    await this.cache.delete(key);
  }
}
