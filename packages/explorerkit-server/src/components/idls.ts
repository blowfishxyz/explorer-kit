import { SolanaFMParser } from "@solanafm/explorer-kit";
import { getProgramIdl, IdlItem } from "@solanafm/explorer-kit-idls";

import { getSharedDep } from "@/core/shared-dependencies";

export type IdlsMap = Map<string, SolanaFMParser | null>;

const IDL_CACHE_TTL = 3600; // one hour

export async function loadAllIdls(programIds: string[]): Promise<IdlsMap> {
  const idls: IdlsMap = new Map();

  if (programIds.length === 0) {
    return idls;
  }

  const cache = getSharedDep("cache");
  const cachedIdls = await cache.multiGet(programIds, IDL_CACHE_TTL);

  await Promise.allSettled(
    cachedIdls.map(async (res, i) => {
      const programId = programIds[i]!;

      if (res) {
        const idl = deserializeIdl(res);
        idls.set(programId, idl && new SolanaFMParser(idl, programId));
        return;
      }

      const idl = (await getProgramIdl(programId)) || getInMemoryProgramIdl(programId);
      void cache.set(programId, serializeIdl(idl), IDL_CACHE_TTL);
      idls.set(programId, idl && new SolanaFMParser(idl, programId));
    })
  );

  return idls;
}

type MaybeIdl = { type: "MISSING" } | { type: "IDL"; idl: IdlItem };

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

const deserializeIdl = (idl: string): IdlItem | null => {
  try {
    const item = JSON.parse(idl) as MaybeIdl;

    if (item.type === "MISSING") {
      return null;
    }

    return item.idl;
  } catch (e) {
    return null;
  }
};

const serializeIdl = (idl: IdlItem | null): string => {
  const maybeIdl: MaybeIdl = idl === null ? { type: "MISSING" } : { type: "IDL", idl };
  return JSON.stringify(maybeIdl);
};
