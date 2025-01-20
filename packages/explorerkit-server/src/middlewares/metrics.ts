import { FastifyReply, FastifyRequest } from "fastify";
import { Histogram } from "prom-client";

import { register } from "@/components/metrics";

const httpRequestDurationMicroseconds = new Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 5, 15, 50, 100, 300, 500, 1000],
  registers: [register],
});

export const responseDurationMiddleware = async (req: FastifyRequest, res: FastifyReply) => {
  const start = process.hrtime();

  res.raw.on("finish", () => {
    const diff = process.hrtime(start);
    const responseTimeInMs = diff[0] * 1e3 + diff[1] * 1e-6; // Convert to milliseconds

    httpRequestDurationMicroseconds.labels(req.method, req.url, res.statusCode.toString()).observe(responseTimeInMs);
  });
};
