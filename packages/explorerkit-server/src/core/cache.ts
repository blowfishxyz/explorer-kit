import { LRUCache } from "lru-cache";
import { Gauge } from "prom-client";
import { createClient, RedisClientType } from "redis";

import { register } from "@/components/metrics";
import { config } from "@/core/config";
import { onTeardown } from "@/utils/teardown";

const LRU_CACHE_MAX_ITEMS_COUNT = 200;

type CacheMetricGauges = {
  hits: Gauge<string>;
  misses: Gauge<string>;
};

class MultiCache<T extends {}> {
  constructor(
    private redis: RedisClientType,
    private lruCache: LRUCache<string, T>,
    private guages: CacheMetricGauges
  ) {}

  async multiGet(keys: string[], ttlInS: number = 0): Promise<(T | null)[]> {
    const items: Record<string, T | null> = {};
    const missingLruKeys: string[] = [];

    for (const key of keys) {
      const value = this.lruCache.get(key);

      if (value) {
        items[key] = value;
        this.guages.hits.inc({
          cache: "lru",
        });
      } else {
        missingLruKeys.push(key);
      }
    }

    if (missingLruKeys.length > 0) {
      const redisItems = await this.redis.mGet(missingLruKeys);

      for (const [i, cachedStringVal] of redisItems.entries()) {
        const key = missingLruKeys[i]!;
        const parsedValue = safeParse<T>(cachedStringVal);
        items[key] = parsedValue;
        if (parsedValue) {
          this.guages.hits.inc({
            cache: "redis",
          });
          this.lruCache.set(key, parsedValue, {
            ttl: ttlInS * 1000,
          });
        } else {
          this.guages.misses.inc();
        }
      }
    }

    return keys.map((key) => items[key] ?? null);
  }

  async set(key: string, value: T, ttlInS: number = 0): Promise<void> {
    this.lruCache.set(key, value, {
      ttl: ttlInS * 1000,
    });

    await this.redis.set(key, JSON.stringify(value), {
      EX: ttlInS,
    });
  }

  async teardown() {
    await this.redis.disconnect();
  }
}

function safeParse<T>(value: string | null): T | null {
  if (value === null) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch (e) {
    return null;
  }
}

export async function createCache<T extends {}>(): Promise<MultiCache<T>> {
  const redisClient = createClient({
    url: config.REDIS_URL,
  });
  await redisClient.connect();

  const lruCache = new LRUCache<string, T>({
    max: LRU_CACHE_MAX_ITEMS_COUNT,
    updateAgeOnGet: true,
  });

  const multiCache = new MultiCache(redisClient as RedisClientType, lruCache, {
    hits: new Gauge({
      name: "cache_hits_total",
      help: "Total number of lru-cache hits",
      registers: [register],
      labelNames: ["cache"],
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
