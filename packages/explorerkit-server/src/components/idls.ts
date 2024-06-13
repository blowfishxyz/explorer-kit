import { SolanaFMParser } from "@solanafm/explorer-kit";
import { getProgramIdl, IdlItem } from "@solanafm/explorer-kit-idls";

import { getSharedDep } from "@/core/shared-dependencies";

export type IdlsMap = Map<string, SolanaFMParser | null>;

const IDL_CACHE_TTL = 3600; // one hour

export async function loadAllIdls(programIds: string[]): Promise<IdlsMap> {
  const cache = getSharedDep("cache");
  const cachedIdls = await Promise.allSettled(programIds.map((id) => cache.get(id)));
  const idls: IdlsMap = new Map();

  const programIdsWithMissingIdls = cachedIdls
    .map((res, i) => {
      const programId = programIds[i]!;

      if (res.status === "fulfilled" && res.value) {
        const idl = deserializeIdl(res.value);

        idls.set(programId, idl && new SolanaFMParser(idl, programId));

        return;
      }

      return programId;
    })
    .filter(Boolean)
    .map((id) => id!);

  await Promise.allSettled(
    programIdsWithMissingIdls.map(async (programId) => {
      const idl = await getProgramIdl(programId);

      void cache.set(programId, serializeIdl(idl), { EX: IDL_CACHE_TTL });

      idls.set(programId, idl && new SolanaFMParser(idl, programId));
    })
  );

  return idls;
}

type MaybeIdl = { type: "MISSING" } | { type: "IDL"; idl: IdlItem };

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
