import { Gauge } from "prom-client";
import { createClient, RedisClientType } from "redis";

import { register } from "@/components/metrics";
import { config } from "@/core/config";
import { onTeardown } from "@/utils/teardown";

export async function createCache(): Promise<RedisClientType> {
  const client = createClient({
    url: config.REDIS_URL,
  });

  await client.connect();

  onTeardown(async () => {
    await client.disconnect();
  });

  return instrumentClient(client as RedisClientType);
}

const instrumentClient = (client: RedisClientType): RedisClientType => {
  const hitsGauge = new Gauge({
    name: "cache_hits_total",
    help: "Total number of cache hits",
    registers: [register],
  });

  const missesGauge = new Gauge({
    name: "cache_misses_total",
    help: "Total number of cache misses",
    registers: [register],
  });

  return new Proxy(client, {
    get(target, prop, receiver) {
      if (prop === "get") {
        return async (key: string) => {
          const value = await target.get(key);

          if (value) {
            hitsGauge.inc();
          } else {
            missesGauge.inc();
          }

          return value;
        };
      }

      const value = Reflect.get(target, prop, receiver);

      if (typeof value === "function") {
        return value.bind(target);
      }
    },
  });
};
