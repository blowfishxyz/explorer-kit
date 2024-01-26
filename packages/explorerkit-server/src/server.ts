import { Message, MessageV0, VersionedTransaction } from "@solana/web3.js";
import { AccountParserInterface, InstructionParserInterface, ParserType, SolanaFMParser } from "@solanafm/explorer-kit";
import { getProgramIdl } from "@solanafm/explorer-kit-idls";
import bodyParser from "body-parser";
import bs58 from "bs58";
import express, { Express, Request, Response } from "express";

interface Account {
  ownerProgram: string;
  data: string;
}

interface DecodeAccountsRequestBody {
  accounts: Account[];
}

interface DecodedAccount {
  error: string | null;
  decodedData: DecodedAccountData | null;
}

interface DecodedAccountData {
  owner: string;
  name: string;
  data: any;
}

interface DecodeTransactionsRequestBody {
  instructionsPerTransaction: TopLevelInstruction[][];
}

interface TopLevelInstruction {
  topLevelInstruction: Instruction;
  flattenedInnerInstructions: Instruction[];
}

interface Instruction {
  programId: string;
  encodedData: string;
  decodedData: any | null;
  name: string | null;
  accountKeys: string[];
}

const app: Express = express();
app.use(bodyParser.json());

// Endpoint to decode accounts data
app.get("/healthz", async (_req: Request, res: Response) => {
  return res.status(200).json({ status: "OK" });
});

// Endpoint to decode accounts data
app.post("/decode/accounts", async (req: Request, res: Response) => {
  const { accounts } = req.body as DecodeAccountsRequestBody;

  let accountParsers: { [key: string]: AccountParserInterface } = {};
  let decodedAccounts: DecodedAccount[] = [];
  for (var account of accounts) {
    if (!isValidBase58(account.ownerProgram)) {
      decodedAccounts.push({ error: "'account.ownerProgram' is not a valid base58 string.", decodedData: null });
      continue;
    }
    if (!isValidBase64(account.data)) {
      decodedAccounts.push({ error: "'account.data' is not a valid base64 string.", decodedData: null });
      continue;
    }

    let accountParser = accountParsers[account.ownerProgram];
    if (accountParser == undefined) {
      const SFMIdlItem = await getProgramIdl(account.ownerProgram);
      if (SFMIdlItem === null) {
        decodedAccounts.push({ error: "Failed to find program IDL", decodedData: null });
        continue;
      }

      const parser = new SolanaFMParser(SFMIdlItem, account.ownerProgram);
      accountParser = parser.createParser(ParserType.ACCOUNT) as AccountParserInterface;
      accountParsers[account.ownerProgram] = accountParser;
    }

    // Parse the transaction
    const decodedData = accountParser.parseAccount(account.data);
    decodedAccounts.push({
      error: null,
      decodedData: decodedData
        ? { owner: account.ownerProgram, name: decodedData?.name, data: decodedData?.data }
        : null,
    });
    continue;
  }

  return res.status(200).json({ decodedAccounts });
});

// Endpoint to decode instructions for a list of transactions
app.post("/decode/instructions", async (req: Request, res: Response) => {
  // TODO(fabio): Improve validation of request body
  if (!req.body.instructionsPerTransaction) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { instructionsPerTransaction } = req.body as DecodeTransactionsRequestBody;

  let instructionParsers: { [key: string]: InstructionParserInterface } = {};
  let decodedTransactions: TopLevelInstruction[][] = [];
  for (var transactionInstructions of instructionsPerTransaction) {
    let decodedTransaction: TopLevelInstruction[] = [];
    for (var instruction of transactionInstructions) {
      // First decode top level ix, then all nested ixs
      let decodedTopLevelInstruction = await decodeInstruction(instructionParsers, instruction.topLevelInstruction);
      let decodedInnerInstruction = [];
      for (var inner_instruction of instruction.flattenedInnerInstructions) {
        decodedInnerInstruction.push(await decodeInstruction(instructionParsers, inner_instruction));
      }
      decodedTransaction.push({
        topLevelInstruction: decodedTopLevelInstruction,
        flattenedInnerInstructions: decodedInnerInstruction,
      });
    }
    decodedTransactions.push(decodedTransaction);
  }

  return res.status(200).json({ decodedTransactions });
});

async function decodeInstruction(
  instructionParsers: { [key: string]: InstructionParserInterface },
  instruction: Instruction
): Promise<Instruction> {
  const programId = instruction.programId.toString();
  let parsedInstruction = {
    programId: programId.toString(),
    encodedData: instruction.encodedData,
    name: null,
    decodedData: null,
    accountKeys: instruction.accountKeys,
  };

  let instructionParser = instructionParsers[programId];
  if (instructionParser == undefined) {
    const SFMIdlItem = await getProgramIdl(programId);
    if (SFMIdlItem) {
      const parser = new SolanaFMParser(SFMIdlItem, programId);
      instructionParser = parser.createParser(ParserType.INSTRUCTION) as InstructionParserInterface;
      instructionParsers[programId] = instructionParser;
    } else {
      return parsedInstruction;
    }
  }

  // Parse the transaction
  const decodedInstruction = instructionParser.parseInstructions(instruction.encodedData, instruction.accountKeys);
  return {
    programId: instruction.programId,
    encodedData: instruction.encodedData,
    name: decodedInstruction?.name || null,
    decodedData: decodedInstruction?.data || null,
    accountKeys: instruction.accountKeys,
  };
}

function isValidBase58(str: string): boolean {
  const base58Regex = /^[A-HJ-NP-Za-km-z1-9]+$/;
  return base58Regex.test(str);
}

function isValidBase64(str: string): boolean {
  try {
    const base64Encoded = Buffer.from(str, "base64").toString("base64");
    return str === base64Encoded;
  } catch (e) {
    return false;
  }
}

export { app };
