import { ErrorParserInterface, ParserType, SolanaFMParser } from "@solanafm/explorer-kit";

import { parsersCache } from "../parsers-cache";
import { ProgramError } from "../types";

export function decodeProgramError(programError: ProgramError): ProgramError {
  if (!programError.errorCode) {
    return programError;
  }

  const programId = programError.programId;
  const parser = parsersCache.get<SolanaFMParser>(programId);

  if (!parser) {
    return programError;
  }

  const hexErrorCode = `0x${programError.errorCode.toString(16)}`;
  const errorParser = parser.createParser(ParserType.ERROR) as ErrorParserInterface;
  const parsedError = errorParser.parseError(hexErrorCode);

  if (!parsedError) {
    return programError;
  }

  return {
    ...programError,
    decodedData: parsedError.data,
    name: parsedError.name,
  };
}
