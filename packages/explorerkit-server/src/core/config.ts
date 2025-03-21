import "dotenv/config";

import { z } from "zod";

const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  REDIS_URL: z.string({ message: "REDIS_URL env variable not set" }).url(),
  IDL_REFRESH_INTERVAL_MS: z.coerce.number().default(10000), // every 10 seconds
  RPC_CONFIGS_SOLANA_MAINNET: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch (e: any) {
          throw new Error(`Failed to parse RPC_CONFIGS_SOLANA_MAINNET: ${e.message}`);
        }
      }
      return val;
    },
    z.array(
      z.object({
        url: z.string().url(),
      })
    )
  ),
});

export const config = configSchema.parse(process.env);
