import { beforeAll, describe, expect, it } from "vitest";

import { loadAllIdls } from "../parsers-cache";
import { decodeProgramError } from "./errors";

describe("errors", () => {
  const jupError = {
    errorCode: 0x1771,
    programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
  };

  beforeAll(async () => {
    await loadAllIdls([jupError.programId]);
  });

  describe("decodeProgramError", () => {
    it("should return the decoded error", () => {
      const result = decodeProgramError(jupError);

      expect(result).toEqual({
        decodedData: "Slippage tolerance exceeded",
        errorCode: 6001,
        name: "SlippageToleranceExceeded",
        programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
      });
    });

    it("should return error for an unknown programId", () => {
      const result = decodeProgramError({
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
