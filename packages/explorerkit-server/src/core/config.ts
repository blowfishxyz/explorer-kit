import "dotenv/config";

import { z } from "zod";

const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  REDIS_URL: z.string({ message: "REDIS_URL env variable not set" }).url(),
});

export const config = configSchema.parse(process.env);
