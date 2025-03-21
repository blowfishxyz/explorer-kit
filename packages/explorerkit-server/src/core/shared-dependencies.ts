import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair } from "@solana/web3.js";

import { MaybeIdl } from "@/components/idls";
import { createCache } from "@/core/cache";
import { config } from "@/core/config";

type SharedDependencies = {
  cache: Awaited<ReturnType<typeof createCache<MaybeIdl>>>;
  anchorProvider: AnchorProvider;
};

let sharedDependencies: SharedDependencies | null = null;

export async function initSharedDependencies(): Promise<SharedDependencies> {
  const cache = await createCache<MaybeIdl>();

  const rpcConfig = config.RPC_CONFIGS_SOLANA_MAINNET[0]!;
  const anchorProvider = new AnchorProvider(
    new Connection(rpcConfig.url),
    // Note(Cristian): We don't actually use any operations that require a wallet, but constructor requires one.
    new Wallet(Keypair.generate()),
    {}
  );

  sharedDependencies = {
    cache,
    anchorProvider,
  };

  return sharedDependencies;
}

export function getSharedDeps(): SharedDependencies {
  if (!sharedDependencies) {
    throw new Error("Shared dependencies not initialized. Please call initSharedDependencies() first.");
  }

  return sharedDependencies;
}

export function getSharedDep<T extends keyof SharedDependencies>(service: T): SharedDependencies[T] {
  return getSharedDeps()[service];
}
