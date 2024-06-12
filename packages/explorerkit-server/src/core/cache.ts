import { createClient, RedisClientType } from "redis";

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

  return client as RedisClientType;
}
