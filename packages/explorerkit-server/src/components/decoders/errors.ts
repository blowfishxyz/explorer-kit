import { ErrorParserInterface, ParserType } from "@solanafm/explorer-kit";

import { IdlsMap } from "@/components/idls";
import { ProgramError } from "@/types";

export function decodeProgramError(idls: IdlsMap, programError: ProgramError): ProgramError {
  if (!programError.errorCode) {
    return programError;
  }

  const programId = programError.programId;
  const parser = idls.get(programId);

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
    decodedMessage: parsedError.data,
    kind: parsedError.name,
  };
}
