import { LRUCache } from "lru-cache";
import { Gauge } from "prom-client";
import { createClient, RedisClientType } from "redis";

import { register } from "@/components/metrics";
import { config } from "@/core/config";
import { onTeardown } from "@/utils/teardown";

const LRU_CACHE_MAX_ITEMS_COUNT = 1000;

type CacheMetricGauges = {
  redisHits: Gauge<string>;
  lruHits: Gauge<string>;
  misses: Gauge<string>;
};

class MultiCache {
  constructor(
    private redis: RedisClientType,
    private lruCache: LRUCache<string, string>,
    private guages: CacheMetricGauges
  ) {}

  async multiGet(keys: string[], ttlInS: number = 0): Promise<(string | null)[]> {
    const items: Record<string, string | null> = {};
    const missingLruKeys: string[] = [];

    for (const key of keys) {
      const value = this.lruCache.get(key);

      if (value) {
        items[key] = value;
        this.guages.lruHits.inc();
      } else {
        missingLruKeys.push(key);
      }
    }

    if (missingLruKeys.length > 0) {
      const redisItems = await this.redis.mGet(missingLruKeys);

      for (const [i, maybeIdl] of redisItems.entries()) {
        const key = missingLruKeys[i]!;
        items[key] = maybeIdl;
        if (maybeIdl) {
          this.guages.redisHits.inc();
          this.lruCache.set(key, maybeIdl, {
            ttl: ttlInS * 1000,
          });
        } else {
          this.guages.misses.inc();
        }
      }
    }

    return keys.map((key) => items[key] ?? null);
  }

  async set(key: string, value: string, ttlInS: number = 0): Promise<void> {
    this.lruCache.set(key, value, {
      ttl: ttlInS * 1000,
    });

    await this.redis.set(key, value, {
      EX: ttlInS,
    });
  }

  async teardown() {
    await this.redis.disconnect();
  }
}

export async function createCache(): Promise<MultiCache> {
  const redisClient = createClient({
    url: config.REDIS_URL,
  });
  await redisClient.connect();

  const lruCache = new LRUCache<string, string>({
    max: LRU_CACHE_MAX_ITEMS_COUNT,
    updateAgeOnGet: true,
  });

  const multiCache = new MultiCache(redisClient as RedisClientType, lruCache, {
    redisHits: new Gauge({
      name: "redis_cache_hits_total",
      help: "Total number of redis cache hits",
      registers: [register],
    }),
    lruHits: new Gauge({
      name: "lru_cache_hits_total",
      help: "Total number of lru-cache hits",
      registers: [register],
    }),
    misses: new Gauge({
      name: "cache_misses_total",
      help: "Total number of cache misses",
      registers: [register],
    }),
  });

  onTeardown(async () => {
    await multiCache.teardown();
  });

  return multiCache;
}
