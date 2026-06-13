import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { SimpleCacheService } from './simple-cache.service';

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private client: Redis | null = null;
  private enabled = false;

  constructor(
    private readonly config: ConfigService,
    private readonly memory: SimpleCacheService,
  ) {}

  onModuleInit(): void {
    this.enabled = this.config.get<boolean>('redis.enabled') === true;
    if (!this.enabled) {
      return;
    }

    try {
      const url = this.config.get<string>('redis.url');
      this.client = new Redis(url ?? 'redis://127.0.0.1:6379', {
        maxRetriesPerRequest: 2,
        lazyConnect: true,
      });
      this.client.connect().catch((error: unknown) => {
        this.logger.warn(`Redis unavailable, using memory cache: ${error}`);
        this.client = null;
        this.enabled = false;
      });
    } catch (error) {
      this.logger.warn(`Redis init failed: ${error}`);
      this.client = null;
      this.enabled = false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.quit();
  }

  async get<T>(key: string): Promise<T | undefined> {
    if (this.client) {
      try {
        const raw = await this.client.get(key);
        if (raw) {
          return JSON.parse(raw) as T;
        }
      } catch {
        return this.memory.get<T>(key);
      }
    }

    return this.memory.get<T>(key);
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    if (this.client) {
      try {
        await this.client.set(key, JSON.stringify(value), 'PX', ttlMs);
        return;
      } catch {
        this.memory.set(key, value, ttlMs);
        return;
      }
    }

    this.memory.set(key, value, ttlMs);
  }

  async delete(key: string): Promise<void> {
    if (this.client) {
      try {
        await this.client.del(key);
      } catch {
        this.memory.delete(key);
      }
    } else {
      this.memory.delete(key);
    }
  }

  get isRedisActive(): boolean {
    return this.enabled && this.client !== null;
  }
}
