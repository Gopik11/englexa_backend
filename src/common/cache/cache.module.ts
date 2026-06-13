import { Global, Module } from '@nestjs/common';
import { CachedDataService } from './cached-data.service';
import { RedisCacheService } from './redis-cache.service';
import { SimpleCacheService } from './simple-cache.service';

@Global()
@Module({
  providers: [SimpleCacheService, RedisCacheService, CachedDataService],
  exports: [SimpleCacheService, RedisCacheService, CachedDataService],
})
export class CacheModule {}
