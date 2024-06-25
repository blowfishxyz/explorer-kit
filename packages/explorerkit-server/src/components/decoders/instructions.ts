import { checkIfInstructionParser, ParserType } from "@solanafm/explorer-kit";
import { Buffer } from "buffer";

import { IdlsMap } from "@/components/idls";
import { Instruction, TopLevelInstruction } from "@/types";

export function decodeInstruction(idls: IdlsMap, instruction: Instruction): Instruction {
  const programId = instruction.programId.toString();
  let parsedInstruction = {
    programId: programId.toString(),
    encodedData: instruction.encodedData,
    name: null,
    decodedData: null,
    accountKeys: instruction.accountKeys,
  };

  let parser = idls.get(programId);
  if (!parser) {
    return parsedInstruction; // Short-circuit without decodedData since IDL is missing
  }

  let instructionParser;
  try {
    instructionParser = parser.createParser(ParserType.INSTRUCTION);
  } catch {
    return parsedInstruction; // Short-circuit without instructionParser we can't decode the instruction
  }

  if (!instructionParser || !checkIfInstructionParser(instructionParser)) {
    return parsedInstruction; // Short-circuit without decodedData parser can't be created
  }

  // Parse the transaction
  const decodedInstruction = instructionParser.parseInstructions(instruction.encodedData, instruction.accountKeys);
  const decodedInstructionWithTypes = instructionParser.parseInstructions(
    instruction.encodedData,
    instruction.accountKeys,
    true
  );
  const finalDecodedInstructionData = postProcessDecodedInstruction(
    decodedInstruction?.data,
    decodedInstructionWithTypes?.data
  );
  return {
    programId: instruction.programId,
    encodedData: instruction.encodedData,
    name: decodedInstruction?.name || null,
    decodedData: finalDecodedInstructionData || null,
    accountKeys: instruction.accountKeys,
  };
}

function postProcessDecodedInstruction(decodedInstructionData?: any, decodedInstructionDataWithTypes?: any): any {
  if (!decodedInstructionData || !decodedInstructionDataWithTypes) {
    return null;
  }

  Object.keys(decodedInstructionDataWithTypes).forEach((key) => {
    const property = decodedInstructionDataWithTypes[key];
    // If [[u8, X]],  base64 encode it
    if (
      typeof property.type === "object" &&
      typeof property.type.vec === "object" &&
      Array.isArray(property.type.vec.array) &&
      property.type.vec.array[0] === "u8"
    ) {
      const rawValue = decodedInstructionData[key];
      if (rawValue && Array.isArray(rawValue) && Array.isArray(rawValue[0])) {
        decodedInstructionData[key] = rawValue.map((arr: number[]) => Buffer.from(arr).toString("base64"));
      }
    }
    // If [u8, X], base64 encode it
    if (typeof property.type === "object" && Array.isArray(property.type.array) && property.type.array[0] === "u8") {
      // Base64 encode the byte array from decodedInstructionData
      const byteArray = decodedInstructionData[key];
      if (byteArray && Array.isArray(byteArray)) {
        decodedInstructionData[key] = Buffer.from(byteArray).toString("base64");
      }
    }
    // If bytes, base64 encode it
    if (property.type === "bytes") {
      const bytes = decodedInstructionData[key];
      if (bytes && bytes.constructor === Uint8Array) {
        decodedInstructionData[key] = Buffer.from(bytes).toString("base64");
      }
    }
  });

  return decodedInstructionData;
}

export function getProgramIds(instructionsPerTransaction: (TopLevelInstruction[] | null)[]): string[] {
  const allProgramIds = instructionsPerTransaction
    .flatMap((transactionInstructions) => transactionInstructions || [])
    .flatMap((ix) => [ix.topLevelInstruction.programId, ...ix.flattenedInnerInstructions.map((i) => i.programId)]);

  return Array.from(new Set(allProgramIds));
}
