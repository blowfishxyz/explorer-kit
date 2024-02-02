import { Message, MessageV0, VersionedTransaction } from "@solana/web3.js";
import { AccountParserInterface, InstructionParserInterface, ParserType, SolanaFMParser } from "@solanafm/explorer-kit";
import { getProgramIdl } from "@solanafm/explorer-kit-idls";
import bodyParser from "body-parser";
import express, { Express, Request, Response } from "express";
import NodeCache from "node-cache";

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

// Cache that evicts anything unused in the last 10mins
let thirty_mins_in_seconds = 1800;
const instructionParsersCache = new NodeCache({ stdTTL: thirty_mins_in_seconds, checkperiod: 120 });
const accountParsersCache = new NodeCache({ stdTTL: thirty_mins_in_seconds, checkperiod: 120 });

// NOTE(fabio): If we cannot find a parser for a programId, we insert null into the cache
// We want to periodically evict these null entries so that we retry fetching them periodically
// in case they are now available
function evictNullEntries(cache: NodeCache) {
  const keys = cache.keys();
  for (const key of keys) {
    const value = cache.get(key);
    if (value === null) {
      cache.del(key);
    }
  }
}

const seventy_mins_in_miliseconds = 4200000;
setInterval(evictNullEntries.bind(null, instructionParsersCache), seventy_mins_in_miliseconds);
setInterval(evictNullEntries.bind(null, accountParsersCache), seventy_mins_in_miliseconds);

const app: Express = express();
app.use(bodyParser.json({ limit: "50mb" }));

// Endpoint to decode accounts data
app.get("/healthz", async (_req: Request, res: Response) => {
  return res.status(200).json({ status: "OK" });
});

// Endpoint to decode accounts data
app.get("/stats", async (_req: Request, res: Response) => {
  return res.status(200).json({
    instructionParsersCacheStats: instructionParsersCache.getStats(),
    accountParsersCacheStats: accountParsersCache.getStats(),
  });
});

// Endpoint to decode accounts data
app.post("/decode/accounts", async (req: Request, res: Response) => {
  const { accounts } = req.body as DecodeAccountsRequestBody;

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

    // TODO(fabio): Store failed lookups too
    let accountParser = accountParsersCache.get(account.ownerProgram) as AccountParserInterface;
    if (accountParser === undefined) {
      const SFMIdlItem = await getProgramIdl(account.ownerProgram);
      if (SFMIdlItem === null) {
        accountParsersCache.set(account.ownerProgram, null);
        decodedAccounts.push({ error: "Failed to find program IDL", decodedData: null });
        continue;
      }

      const parser = new SolanaFMParser(SFMIdlItem, account.ownerProgram);
      accountParser = parser.createParser(ParserType.ACCOUNT) as AccountParserInterface;
      accountParsersCache.set(account.ownerProgram, accountParser);
    } else if (accountParser == null) {
      // Didn't find parser last time we checked
      decodedAccounts.push({ error: "Failed to find program IDL", decodedData: null });
      continue;
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

  let decodedTransactions: TopLevelInstruction[][] = [];
  for (var transactionInstructions of instructionsPerTransaction) {
    let decodedTransaction: TopLevelInstruction[] = [];
    for (var instruction of transactionInstructions) {
      // First decode top level ix, then all nested ixs
      let decodedTopLevelInstruction = await decodeInstruction(instruction.topLevelInstruction);
      let decodedInnerInstruction = [];
      for (var inner_instruction of instruction.flattenedInnerInstructions) {
        decodedInnerInstruction.push(await decodeInstruction(inner_instruction));
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

async function decodeInstruction(instruction: Instruction): Promise<Instruction> {
  const programId = instruction.programId.toString();
  let parsedInstruction = {
    programId: programId.toString(),
    encodedData: instruction.encodedData,
    name: null,
    decodedData: null,
    accountKeys: instruction.accountKeys,
  };

  let instructionParser = instructionParsersCache.get(programId) as InstructionParserInterface;
  // If we've never seen the programId before, try to fetch the IDL
  if (instructionParser === undefined) {
    const SFMIdlItem = await getProgramIdl(programId);
    if (SFMIdlItem != undefined) {
      const parser = new SolanaFMParser(SFMIdlItem, programId);
      instructionParser = parser.createParser(ParserType.INSTRUCTION) as InstructionParserInterface;
      instructionParsersCache.set(programId, instructionParser);
    } else {
      instructionParsersCache.set(programId, null); // Insert into cache to avoid trying to fetch IDL again
      return parsedInstruction; // Short-circuit
    }
  } else if (instructionParser == null) {
    return parsedInstruction; // Short-circuit
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
