import { Program } from "@coral-xyz/anchor";
import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from "vitest";

import { loadAllIdls } from "@/components/idls";

const cache = {
  multiGet: vi.fn(async (keys: string[]) => keys.map(() => null)),
  set: vi.fn(async () => {}),
};

vi.mock("@/core/shared-dependencies", () => ({
  getSharedDep: (name: string) => (name === "cache" ? cache : {}),
}));

const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

describe("loadAllIdls", () => {
  let fetchIdl: MockInstance<Parameters<typeof Program.fetchIdl>, ReturnType<typeof Program.fetchIdl>>;

  beforeEach(() => {
    cache.multiGet.mockClear();
    cache.set.mockClear();
    fetchIdl = vi.spyOn(Program, "fetchIdl").mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches and caches each program id once when the input has duplicates", async () => {
    const idls = await loadAllIdls([TOKEN_PROGRAM, TOKEN_PROGRAM, TOKEN_PROGRAM]);

    expect(idls.size).toBe(1);
    expect(idls.get(TOKEN_PROGRAM)).toBeTruthy();
    expect(cache.multiGet).toHaveBeenCalledWith([TOKEN_PROGRAM], expect.any(Number));
    expect(fetchIdl).toHaveBeenCalledTimes(1);
    expect(cache.set).toHaveBeenCalledTimes(1);
  });

  it("shares one fetch between concurrent requests for the same missing IDL", async () => {
    const [first, second] = await Promise.all([loadAllIdls([TOKEN_PROGRAM]), loadAllIdls([TOKEN_PROGRAM])]);

    expect(fetchIdl).toHaveBeenCalledTimes(1);
    expect(cache.set).toHaveBeenCalledTimes(1);
    expect(second.get(TOKEN_PROGRAM)).toBe(first.get(TOKEN_PROGRAM));
  });

  it("fetches again after the previous fetch completes", async () => {
    await loadAllIdls([TOKEN_PROGRAM]);
    await loadAllIdls([TOKEN_PROGRAM]);

    expect(fetchIdl).toHaveBeenCalledTimes(2);
  });
});
