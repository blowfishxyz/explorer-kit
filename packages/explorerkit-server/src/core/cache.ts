import { LRUCache } from "lru-cache";
import { Gauge } from "prom-client";
import { createClient, RedisClientType } from "redis";

import { register } from "@/components/metrics";
import { config } from "@/core/config";
import { onTeardown } from "@/utils/teardown";

const LRU_CACHE_MAX_ITEMS_COUNT = 100;

type CacheMetricGauges = {
  hits: Gauge<string>;
  misses: Gauge<string>;
};

class MultiCache {
  constructor(
    private redis: RedisClientType,
    private lruCache: LRUCache<string, string>,
    private guages: CacheMetricGauges
  ) {}

  async get(key: string): Promise<string | null> {
    const item = this.lruCache.get(key) ?? (await this.redis.get(key));

    if (item) {
      this.guages.hits.inc();
    } else {
      this.guages.misses.inc();
    }

    return item;
  }

  async multiGet(keys: string[]): Promise<(string | null)[]> {
    const items: Record<string, string | null> = {};
    const missingLruKeys: string[] = [];

    for (const key of keys) {
      const value = this.lruCache.get(key);

      if (value) {
        items[key] = value;
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
          this.lruCache.set(key, maybeIdl);
        }
      }
    }

    return keys.map((key) => {
      const item = items[key];

      if (item) {
        this.guages.hits.inc();
      } else {
        this.guages.misses.inc();
      }

      return item ?? null;
    });
  }

  async set(key: string, value: string, options: { EX: number }): Promise<void> {
    this.lruCache.set(key, value);
    await this.redis.set(key, value, options);
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
  });

  const multiCache = new MultiCache(redisClient as RedisClientType, lruCache, {
    hits: new Gauge({
      name: "cache_hits_total",
      help: "Total number of cache hits",
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
