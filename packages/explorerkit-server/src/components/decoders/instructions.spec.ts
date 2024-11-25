import { beforeAll, describe, expect, it, vi } from "vitest";

import { decodeInstruction } from "@/components/decoders/instructions";
import { addIdlToRefreshQueue, loadAllIdls, refreshIdlsInQueue } from "@/components/idls";

vi.mock("@/core/shared-dependencies", (loadActual) => {
  class MultiCacheMock {
    private data: Record<string, string> = {};

    async get(key: string) {
      return this.data[key] || null;
    }

    async multiGet(keys: string[]) {
      return keys.map((key) => this.data[key] || null);
    }

    async set(key: string, value: string) {
      this.data[key] = value;
    }
  }

  const deps = {
    cache: new MultiCacheMock(),
  };

  return {
    ...loadActual(),
    initSharedDependencies: () => {},
    getSharedDep: (name: keyof typeof deps) => deps[name],
    getSharedDeps: () => deps,
  };
});

describe("instructions", () => {
  let idls = new Map();
  const instruction = {
    accountKeys: [],
    encodedData: "3ta97iYzVb3u",
    programId: "ComputeBudget111111111111111111111111111111",
  };

  beforeAll(async () => {
    addIdlToRefreshQueue("ComputeBudget111111111111111111111111111111");
    await refreshIdlsInQueue();
    idls = await loadAllIdls([instruction.programId]);
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
});
