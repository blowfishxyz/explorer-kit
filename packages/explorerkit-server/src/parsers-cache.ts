// Cache that evicts anything unused in the last 30mins
import { InstructionParserInterface, SolanaFMParser } from "@solanafm/explorer-kit";
import { getProgramIdl } from "@solanafm/explorer-kit-idls";
import NodeCache from "node-cache";

let thirty_mins_in_seconds = 1800;
const parsersCache = new NodeCache({ stdTTL: thirty_mins_in_seconds, checkperiod: 120 });

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
