// Cache that evicts anything unused in the last 30mins
import { InstructionParserInterface, SolanaFMParser } from "@solanafm/explorer-kit";
import { getProgramIdl } from "@solanafm/explorer-kit-idls";
import NodeCache from "node-cache";
import { Gauge, register } from "prom-client";

let thirty_mins_in_seconds = 1800;
const parsersCache = new NodeCache({ stdTTL: thirty_mins_in_seconds, checkperiod: 120 });

// Define custom metrics for NodeCache statistics
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
}, 30000); // Update every 30sec

// NOTE(fabio): If we cannot find a parser for a programId, we insert null into the cache
// We want to periodically evict these null entries so that we retry fetching them periodically
// in case they are now available
function evictNullEntries(cache: NodeCache) {
  const keys = cache.keys();
  for (const key of keys) {
    const value = cache.get(key);
    if (value === null) {
      cache.del(key);
    }
  }
}

const seventy_mins_in_miliseconds = 4200000;
setInterval(evictNullEntries.bind(null, parsersCache), seventy_mins_in_miliseconds);

async function loadAllIdls(programIds: string[]) {
  let getProgramIdlFutures = [];
  let programsWithMissingIdls = [];
  for (var programId of programIds) {
    let instructionParser = parsersCache.get(programId) as InstructionParserInterface;
    // If we already seen the programId before, skip
    if (instructionParser !== undefined) {
      continue;
    }

    // We haven't seen the programId before, add call to fetch it's IDL
    getProgramIdlFutures.push(getProgramIdl(programId));
    programsWithMissingIdls.push(programId);
  }

  let SFMIdlItems = await Promise.all(getProgramIdlFutures);
  for (var i = 0; i < SFMIdlItems.length; i++) {
    let SFMIdlItem = SFMIdlItems[i];
    let programId = programsWithMissingIdls[i] as string;
    if (SFMIdlItem != undefined) {
      const parser = new SolanaFMParser(SFMIdlItem, programId);
      parsersCache.set(programId, parser);
    } else {
      parsersCache.set(programId, null); // Insert into cache to avoid trying to fetch IDL again
    }
  }
}

export { loadAllIdls, parsersCache };
