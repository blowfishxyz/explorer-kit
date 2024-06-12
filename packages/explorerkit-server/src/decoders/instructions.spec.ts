import { beforeAll, describe, expect, it } from "vitest";

import { loadAllIdls } from "../parsers-cache";
import { decodeInstruction } from "./instructions";

describe("instructions", () => {
  const instruction = {
    accountKeys: [],
    encodedData: "3ta97iYzVb3u",
    programId: "ComputeBudget111111111111111111111111111111",
  };

  beforeAll(async () => {
    await loadAllIdls([instruction.programId]);
  });

  describe("decodeInstruction", () => {
    it("should return the decoded instruction", async () => {
      const result = await decodeInstruction({
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
    const result = await decodeInstruction({
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
