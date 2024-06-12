// Define custom metrics for NodeCache statistics
import { Gauge, Registry } from "prom-client";

import { parsersCache } from "./parsers-cache";

const register = new Registry();

const hitsGauge = new Gauge({
  name: "nodecache_hits_total",
  help: "Total number of cache hits",
  registers: [register],
});
const missesGauge = new Gauge({
  name: "nodecache_misses_total",
  help: "Total number of cache misses",
  registers: [register],
});
const keysGauge = new Gauge({
  name: "nodecache_keys_total",
  help: "Total number of keys in the cache",
  registers: [register],
});
const ksizeGauge = new Gauge({
  name: "nodecache_ksize_bytes",
  help: "Total key size in bytes",
  registers: [register],
});
const vsizeGauge = new Gauge({
  name: "nodecache_vsize_bytes",
  help: "Total value size in bytes",
  registers: [register],
});

// Update cache statistics in the metrics
setInterval(() => {
  const stats = parsersCache.getStats();
  hitsGauge.set(stats.hits);
  missesGauge.set(stats.misses);
  keysGauge.set(stats.keys);
  ksizeGauge.set(stats.ksize);
  vsizeGauge.set(stats.vsize);
}, 2000); // Update every 30sec

export { register };
