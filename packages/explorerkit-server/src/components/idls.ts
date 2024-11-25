import { SolanaFMParser } from "@solanafm/explorer-kit";
import { getMultipleProgramIdls, IdlItem } from "@solanafm/explorer-kit-idls";
import { Gauge } from "prom-client";

import { register } from "@/components/metrics";
import { getSharedDep } from "@/core/shared-dependencies";
import { chunkArray } from "@/utils/array";

export type IdlsMap = Map<string, SolanaFMParser | null>;

const IDL_STALE_TIME = 3600; // one hour
const IDL_CACHE_TTL = 86400; // one day

/**
 * Loads all the idls for the given program ids
 *
 * Idls are cached for 1 day and are stored with a stale time of 1 hour.
 * If the idl is stale, it will still be returned but will be refreshed in the background.
 *
 * Note: If a program IDL is available, but it not in the cache, this function will NOT return it
 * The IDL is going to be fetched in background during the next refresh cycle (10 seconds).
 *
 * @param programIds The program ids to load the idls for
 * @returns A map of program ids to idls
 * @param {string[]} programIds
 */
export async function loadAllIdls(programIds: string[]): Promise<IdlsMap> {
  const idls: IdlsMap = new Map();

  if (programIds.length === 0) {
    return idls;
  }

  const cache = getSharedDep("cache");
  const cachedIdls = await cache.multiGet(programIds, IDL_STALE_TIME);
  const cachedIdlByProgramId = cachedIdls.reduce((acc, idl, i) => {
    const programId = programIds[i]!;
    if (idl) {
      acc.set(programId, deserializeIdl(idl));
    }
    return acc;
  }, new Map<string, MaybeIdl | null>());

  for (const programId of programIds) {
    const inMemoryIdl = getInMemoryProgramIdl(programId);

    if (inMemoryIdl) {
      idls.set(programId, inMemoryIdl && new SolanaFMParser(inMemoryIdl, programId));
      continue;
    }

    const cachedIdl = cachedIdlByProgramId.get(programId);

    if (!cachedIdl) {
      addIdlToRefreshQueue(programId);
      continue;
    }

    if (cachedIdl.type === "IDL") {
      idls.set(programId, cachedIdl && new SolanaFMParser(cachedIdl.idl, programId));
    }

    if (cachedIdl.staleAt.getTime() < Date.now()) {
      addIdlToRefreshQueue(programId);
    }
  }

  return idls;
}

type MaybeIdl = { type: "MISSING"; staleAt: Date } | { type: "IDL"; idl: IdlItem; staleAt: Date };

const IN_MEMORY_PROGRAM_IDLS: Map<String, IdlItem> = new Map([
  [
    "6m2CDdhRgxpH4WjvdzxAYbGxwdGUz5MziiL5jek2kBma",
    {
      idl: require("./idls/okx_aggregator.json"),
      programId: "6m2CDdhRgxpH4WjvdzxAYbGxwdGUz5MziiL5jek2kBma",
      idlType: "anchor",
    },
  ],
]);

const getInMemoryProgramIdl = (programId: string): IdlItem | null => {
  return IN_MEMORY_PROGRAM_IDLS.get(programId) || null;
};

const idlRefreshQueue = new Set<string>();

export function addIdlToRefreshQueue(programId: string) {
  idlRefreshQueue.add(programId);
}

const BATCH_SIZE = 10;

export async function refreshIdlsInQueue() {
  const programIds = Array.from(idlRefreshQueue.values());
  const programIdsChunks = chunkArray(programIds, BATCH_SIZE);

  const cache = getSharedDep("cache");

  for (const programIds of programIdsChunks) {
    const idls = await getMultipleProgramIdls(programIds).catch((error) => {
      console.error("Error fetching idls", error);
      return [] as IdlItem[];
    });

    const idlsByProgramId = idls.reduce((acc, idl) => {
      if (idl) {
        acc.set(idl.programId, idl);
      }
      return acc;
    }, new Map<string, IdlItem>());

    for (const programId of programIds) {
      const idl = idlsByProgramId.get(programId) ?? null;
      const serializedIdl = serializeIdl(idl, new Date(Date.now() + IDL_STALE_TIME * 1000));

      await cache.set(programId, serializedIdl, IDL_CACHE_TTL).catch((error) => {
        console.error("Error caching idl", error);
      });

      idlRefreshQueue.delete(programId);
    }
  }
}

export function initIdlsRefreshBackgroundJob(idlRefreshIntervalMs: number) {
  const queueSizeMetric = new Gauge({
    name: "idls_refresh_queue_size",
    help: "Number of idls to refresh",
    registers: [register],
  });

  let isRefreshing = false;

  setInterval(async () => {
    if (isRefreshing) {
      return;
    }

    queueSizeMetric.set(idlRefreshQueue.size);

    try {
      isRefreshing = true;
      await refreshIdlsInQueue();
    } catch (error) {
      console.error("Error refreshing idls", error);
    } finally {
      isRefreshing = false;
    }
  }, idlRefreshIntervalMs);
}

const deserializeIdl = (idl: string): MaybeIdl | null => {
  try {
    const item = JSON.parse(idl) as MaybeIdl;
    item.staleAt = new Date(item.staleAt || 0);

    return item;
  } catch (e) {
    return null;
  }
};

const serializeIdl = (idl: IdlItem | null, staleAt: Date): string => {
  const maybeIdl: MaybeIdl = idl === null ? { type: "MISSING", staleAt } : { type: "IDL", idl, staleAt };
  return JSON.stringify(maybeIdl);
};
