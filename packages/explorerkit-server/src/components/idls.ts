import { SolanaFMParser } from "@solanafm/explorer-kit";
import { getMultipleProgramIdls, getProgramIdl, IdlItem } from "@solanafm/explorer-kit-idls";
import { Gauge, Histogram } from "prom-client";

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
 * Note: If a program IDL is missing in cache the function will try to fetch it in the main request.
 *
 * @param {string[]} programIds
 * @returns {Promise<IdlsMap>} A map of program ids to idls
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

  await Promise.allSettled(
    programIds.map(async (programId) => {
      const cachedIdl = cachedIdlByProgramId.get(programId);

      if (!cachedIdl) {
        const idl = await getProgramIdl(programId);
        const serializedIdl = serializeIdl(idl, new Date(Date.now() + IDL_STALE_TIME * 1000));
        void cache.set(programId, serializedIdl, IDL_CACHE_TTL);
        idls.set(programId, idl && new SolanaFMParser(idl, programId));
        return;
      }

      if (cachedIdl.type === "IDL") {
        idls.set(programId, cachedIdl && new SolanaFMParser(cachedIdl.idl, programId));
      }

      if (cachedIdl.expiresAt.getTime() < Date.now()) {
        addIdlToRefreshQueue(programId);
      }
    })
  );

  return idls;
}

type MaybeIdl = { type: "MISSING"; expiresAt: Date } | { type: "IDL"; idl: IdlItem; expiresAt: Date };

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
  const idlRefreshTime = new Histogram({
    name: "idls_refresh_time",
    help: "Time taken to refresh idls",
    buckets: [0.1, 5, 15, 50, 100, 300, 500, 1000],
    registers: [register],
  });

  let isRefreshing = false;

  setInterval(async () => {
    if (isRefreshing) {
      return;
    }

    queueSizeMetric.set(idlRefreshQueue.size);
    isRefreshing = true;
    const startTime = process.hrtime();

    try {
      await refreshIdlsInQueue();
    } catch (error) {
      console.error("Error refreshing idls", error);
    } finally {
      const endTime = process.hrtime(startTime);
      const durationMs = endTime[0] * 1e3 + endTime[1] * 1e-6;
      idlRefreshTime.observe(durationMs);
      isRefreshing = false;
    }
  }, idlRefreshIntervalMs);
}

const deserializeIdl = (idl: string): MaybeIdl | null => {
  try {
    const item = JSON.parse(idl) as MaybeIdl;
    item.expiresAt = new Date(item.expiresAt || 0);

    return item;
  } catch (e) {
    return null;
  }
};

const serializeIdl = (idl: IdlItem | null, expiresAt: Date): string => {
  const maybeIdl: MaybeIdl = idl === null ? { type: "MISSING", expiresAt } : { type: "IDL", idl, expiresAt };
  return JSON.stringify(maybeIdl);
};
