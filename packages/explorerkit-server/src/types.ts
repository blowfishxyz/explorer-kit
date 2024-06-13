export interface TopLevelInstruction {
  topLevelInstruction: Instruction;
  flattenedInnerInstructions: Instruction[];
}

export interface Instruction {
  programId: string;
  encodedData: string;
  decodedData?: any | null;
  name?: string | null;
  accountKeys: string[];
}

export interface ProgramError {
  programId: string;
  errorCode?: number | null;
  decodedMessage?: string;
  name?: string | null;
}

export interface Account {
  ownerProgram: string;
  data: string;
}

export interface DecodedAccount {
  decodedData: DecodedAccountData | null;
}

export interface DecodedAccountData {
  owner: string;
  name: string;
  data: any;
}
