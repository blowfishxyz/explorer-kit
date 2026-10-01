import { Parser, ParserType, SolanaFMParser } from "@solanafm/explorer-kit";
import { IdlItem } from "@solanafm/explorer-kit-idls";

type ParserResult = { parser: Parser } | { error: unknown };

/**
 * Wraps a SolanaFMParser and builds each parser type at most once.
 *
 * Parser construction compiles IDL layouts and costs much more than one decode.
 * Built parsers are stateless, so one instance can decode many inputs.
 * A construction error is also stored and thrown again, so callers keep their error handling.
 */
export class ProgramParser {
  private readonly parsers = new Map<ParserType, ParserResult>();
  private readonly solanaFmParser: SolanaFMParser;

  constructor(
    idl: IdlItem,
    readonly programId: string
  ) {
    this.solanaFmParser = new SolanaFMParser(idl, programId);
  }

  createParser(parserType: ParserType): Parser {
    let result = this.parsers.get(parserType);

    if (!result) {
      try {
        result = { parser: this.solanaFmParser.createParser(parserType) };
      } catch (error) {
        result = { error };
      }
      this.parsers.set(parserType, result);
    }

    if ("error" in result) {
      throw result.error;
    }

    return result.parser;
  }
}

// The key is the IdlItem object, so a refreshed IDL object gets new parsers.
// Entries are released when the IDL cache releases the IdlItem.
const programParsers = new WeakMap<IdlItem, ProgramParser>();

/**
 * Returns the ProgramParser for an IDL object and creates it on first use.
 */
export function getProgramParser(idl: IdlItem, programId: string): ProgramParser {
  const cached = programParsers.get(idl);
  if (cached && cached.programId === programId) {
    return cached;
  }

  const programParser = new ProgramParser(idl, programId);
  if (!cached) {
    programParsers.set(idl, programParser);
  }

  return programParser;
}
