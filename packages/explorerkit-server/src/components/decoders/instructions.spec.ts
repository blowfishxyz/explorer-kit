import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { decodeInstruction } from "@/components/decoders/instructions";
import { addIdlToRefreshQueue, loadAllIdls, MaybeIdl, refreshIdlsInQueue } from "@/components/idls";
import * as sharedDeps from "@/core/shared-dependencies";
import { initSharedDependencies } from "@/core/shared-dependencies";

class InMemoryMultiCache<T extends {}> {
  private cache: Map<string, T> = new Map();

  async multiGet(keys: string[], _ttlInS: number = 0): Promise<(T | null)[]> {
    return keys.map((key) => this.cache.get(key) || null);
  }

  async set(key: string, value: T, _ttlInS: number = 0): Promise<void> {
    this.cache.set(key, value);
  }

  async teardown() {
    // No-op
  }
}

describe("instructions", () => {
  let idls = new Map();
  const instruction = {
    accountKeys: [],
    encodedData: "3ta97iYzVb3u",
    programId: "ComputeBudget111111111111111111111111111111",
  };

  beforeEach(() => {
    // Create and use in-memory cache for tests
    const inMemoryCache = new InMemoryMultiCache<MaybeIdl>();
    const getSharedDepsOriginal = sharedDeps.getSharedDep;
    vi.spyOn(sharedDeps, "getSharedDep").mockImplementation((service) => {
      if (service === "cache") {
        return inMemoryCache as any;
      }
      return getSharedDepsOriginal(service);
    });
  });

  beforeAll(async () => {
    addIdlToRefreshQueue("ComputeBudget111111111111111111111111111111");
    await initSharedDependencies();
    await refreshIdlsInQueue();
    idls = await loadAllIdls([instruction.programId, "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"]);
  });

  describe("decodeInstruction", () => {
    it("should return the decoded instruction", async () => {
      const result = await decodeInstruction(idls, {
        accountKeys: [],
        encodedData: "3ta97iYzVb3u",
        programId: "ComputeBudget111111111111111111111111111111",
      });
      expect(result).toEqual({
        accountKeys: [],
        decodedData: {
          computeUnitPrice: 317673,
          discriminator: 3,
        },
        encodedData: "3ta97iYzVb3u",
        name: "setComputeUnitPrice",
        programId: "ComputeBudget111111111111111111111111111111",
      });
    });
  });

  it("should return instruction for an unknown programId", async () => {
    const result = await decodeInstruction(idls, {
      accountKeys: [],
      encodedData: "3ta97iYzVb3u",
      programId: "UnknownProgramId",
    });
    expect(result).toEqual({
      accountKeys: [],
      decodedData: null,
      encodedData: "3ta97iYzVb3u",
      name: null,
      programId: "UnknownProgramId",
    });
  });

  it("should decode properly jupiter route instruction", async () => {
    const idls = await loadAllIdls(["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"]);
    const result = decodeInstruction(idls, {
      accountKeys: [
        "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "AnT3fqrEPSH1poYFNXVvcjoSVgttn2HwURUZoWM8FJv8",
        "7Us6hkutTQCoRQ4tjJrLYrAgCoc8fTnrrLCbHvFhGPcS",
        "FXTGwxveCKjU96DkZerPtUc8zG2qQqHjj6dd6Q2Tb4CV",
        "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "J8gt2jBUi6DW6gdUdm1fkP9oGN4xXwPdQbCZkkN78R3Z",
        "D8cy77BBepLMngZx6ZukaTff5hCt1HrWyKk3Hnd9oitf",
        "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
        "obriQD1zbpyLz95G5n7nJe6a4DPjpFwa5XYPoNm113y",
        "AvBSC1KmFNceHpD6jyyXBV6gMXFxZ8BJJ3HVUN8kCurJ",
        "GZsNmWKbqhMYtdSkkvMdEyQF9k5mLmP7tTKYWZjcHVPE",
        "6YawcNeZ74tRyCv4UfGydYMr7eho7vbUR6ScVffxKAb3",
        "FpEzVYQ5MjuSut61Ka18tzYhQKLqndefubV7K2U1mrTz",
        "74tjvZXuW2C7bsBxRYxmwTrqF8BrYr3VDgusj8DwRd9a",
        "7Us6hkutTQCoRQ4tjJrLYrAgCoc8fTnrrLCbHvFhGPcS",
        "FXTGwxveCKjU96DkZerPtUc8zG2qQqHjj6dd6Q2Tb4CV",
        "FpCMFDFGYotvufJ7HrFHsWEiiQCGbkLCtwHiDnh7o28Q",
        "J4HJYz4p7TRP96WVFky3vh7XryxoFehHjoRySUTeSeXw",
        "Sysvar1nstructions1111111111111111111111111",
        "AnT3fqrEPSH1poYFNXVvcjoSVgttn2HwURUZoWM8FJv8",
        "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "J56q6nX15WHRLJcsGB6s1bjaiywrn8DqLLvLccz61cYx",
      ],
      encodedData: "2jtsaD446yyqqK5qJ4chZG7pUNHcDKkCamXAdeGuEmHVMaj1he",
      programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
    });

    expect(result.decodedData).toMatchObject({
      quoted_out_amount: "12260243",
      slippage_bps: 50,
      platform_fee_bps: 85,
    });
  });
});
