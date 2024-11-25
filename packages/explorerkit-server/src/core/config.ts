import "dotenv/config";

import { z } from "zod";

const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  REDIS_URL: z.string({ message: "REDIS_URL env variable not set" }).url(),
  IDL_REFRESH_INTERVAL_MS: z.coerce.number().default(10000), // every 10 seconds
});

export const config = configSchema.parse(process.env);
