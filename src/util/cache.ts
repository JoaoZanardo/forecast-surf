import NodeCache from 'node-cache';

class CacheUtil {
  constructor(private readonly cacheService = new NodeCache()) {}

  get<T>(key: string): T | undefined {
    return this.cacheService.get(key);
  }

  set<T>(key: string, value: T, ttl = 3600): boolean {
    return this.cacheService.set(key, value, ttl);
  }

  clearAllCache(): void {
    return this.cacheService.flushAll();
  }
}

export default new CacheUtil();
