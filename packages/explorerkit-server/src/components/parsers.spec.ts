import { ParserType, SolanaFMParser } from "@solanafm/explorer-kit";
import { getProgramIdl, IdlItem } from "@solanafm/explorer-kit-idls";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { getProgramParser, ProgramParser } from "@/components/parsers";

const COMPUTE_BUDGET = "ComputeBudget111111111111111111111111111111";

describe("ProgramParser", () => {
  let idl: IdlItem;

  beforeAll(async () => {
    idl = (await getProgramIdl(COMPUTE_BUDGET))!;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("builds each parser type once and reuses it", () => {
    const createParser = vi.spyOn(SolanaFMParser.prototype, "createParser");
    const programParser = new ProgramParser(idl, COMPUTE_BUDGET);

    const first = programParser.createParser(ParserType.INSTRUCTION);
    const second = programParser.createParser(ParserType.INSTRUCTION);
    programParser.createParser(ParserType.ERROR);

    expect(second).toBe(first);
    expect(createParser).toHaveBeenCalledTimes(2);
  });

  it("throws the stored construction error again without a rebuild", () => {
    const createParser = vi.spyOn(SolanaFMParser.prototype, "createParser").mockImplementation(() => {
      throw new Error("invalid idl");
    });
    const programParser = new ProgramParser(idl, COMPUTE_BUDGET);

    expect(() => programParser.createParser(ParserType.ACCOUNT)).toThrow("invalid idl");
    expect(() => programParser.createParser(ParserType.ACCOUNT)).toThrow("invalid idl");
    expect(createParser).toHaveBeenCalledTimes(1);
  });
});

describe("getProgramParser", () => {
  it("returns the same ProgramParser for the same IDL object", async () => {
    const idl = (await getProgramIdl(COMPUTE_BUDGET))!;

    expect(getProgramParser(idl, COMPUTE_BUDGET)).toBe(getProgramParser(idl, COMPUTE_BUDGET));
  });

  it("returns a new ProgramParser for a new IDL object", async () => {
    const idl = (await getProgramIdl(COMPUTE_BUDGET))!;
    const refreshedIdl = { ...idl };

    expect(getProgramParser(refreshedIdl, COMPUTE_BUDGET)).not.toBe(getProgramParser(idl, COMPUTE_BUDGET));
  });

  it("does not share a ProgramParser between program ids", async () => {
    const idl = (await getProgramIdl(COMPUTE_BUDGET))!;
    const otherProgramId = "Other11111111111111111111111111111111111111";

    expect(getProgramParser(idl, otherProgramId).programId).toBe(otherProgramId);
    expect(getProgramParser(idl, COMPUTE_BUDGET).programId).toBe(COMPUTE_BUDGET);
  });
});
