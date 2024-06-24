import { beforeAll, describe, expect, it, vi } from "vitest";

import { decodeProgramError } from "@/components/decoders/errors";
import { loadAllIdls } from "@/components/idls";

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

describe("errors", () => {
  let idls = new Map();
  const jupError = {
    errorCode: 0x1771,
    programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
  };

  beforeAll(async () => {
    idls = await loadAllIdls([jupError.programId]);
  });

  describe("decodeProgramError", () => {
    it("should return the decoded error", async () => {
      const result = decodeProgramError(idls, jupError);
      expect(result).toEqual({
        decodedMessage: "Slippage tolerance exceeded",
        errorCode: 6001,
        kind: "SlippageToleranceExceeded",
        programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
      });
    });

    it("should return error for an unknown programId", () => {
      const result = decodeProgramError(idls, {
        errorCode: 0x1771,
        programId: "UnknownProgramId",
      });

      expect(result).toEqual({
        errorCode: 6001,
        programId: "UnknownProgramId",
      });
    });
  });
});
