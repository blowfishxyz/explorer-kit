import { MaybeIdl } from "@/components/idls";
import { createCache } from "@/core/cache";

type SharedDependencies = {
  cache: Awaited<ReturnType<typeof createCache<MaybeIdl>>>;
};

let sharedDependencies: SharedDependencies | null = null;

export async function initSharedDependencies(): Promise<SharedDependencies> {
  const cache = await createCache<MaybeIdl>();

  sharedDependencies = {
    cache,
  };

  return sharedDependencies;
}

export function getSharedDeps(): SharedDependencies {
  if (!sharedDependencies) {
    throw new Error("Shared dependencies not initialized. Please call initSharedDependencies() first.");
  }

  return sharedDependencies;
}

export function getSharedDep<T extends keyof SharedDependencies>(
  service: keyof SharedDependencies
): SharedDependencies[T] {
  return getSharedDeps()[service];
}
