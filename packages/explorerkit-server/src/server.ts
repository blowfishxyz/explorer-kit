import { AccountParserInterface, InstructionParserInterface, ParserType, SolanaFMParser } from "@solanafm/explorer-kit";
import { getProgramIdl } from "@solanafm/explorer-kit-idls";
import bodyParser from "body-parser";
import { Buffer } from "buffer";
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
  decodedData: DecodedAccountData | null;
}

interface DecodedAccountData {
  owner: string;
  name: string;
  data: any;
}

interface DecodeTransactionsRequestBody {
  instructionsPerTransaction: (TopLevelInstruction[] | null)[];
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

// Cache that evicts anything unused in the last 30mins
let thirty_mins_in_seconds = 1800;
const parsersCache = new NodeCache({ stdTTL: thirty_mins_in_seconds, checkperiod: 120 });

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
setInterval(evictNullEntries.bind(null, parsersCache), seventy_mins_in_miliseconds);

const app: Express = express();
app.use(bodyParser.json({ limit: "50mb" }));

// Endpoint to decode accounts data
app.get("/healthz", async (_req: Request, res: Response) => {
  return res.status(200).json({ status: "OK" });
});

// Endpoint to decode accounts data
app.get("/stats", async (_req: Request, res: Response) => {
  return res.status(200).json({
    parsersCacheStats: parsersCache.getStats(),
  });
});

// Endpoint to decode accounts data
app.post("/decode/accounts", async (req: Request, res: Response) => {
  if (!req.body.accounts || !Array.isArray(req.body.accounts)) {
    return res.status(400).json({ error: "Invalid request body" });
  }
  const { accounts } = req.body as DecodeAccountsRequestBody;
  for (var i = 0; i < accounts.length; i++) {
    let account = accounts[i] as Account;
    if (!isValidBase58(account.ownerProgram)) {
      return res.status(400).json({ error: `'account.ownerProgram' at index ${i} is not a valid base58 string.` });
    }
    if (!isValidBase64(account.data)) {
      return res.status(400).json({ error: `'account.data' at index ${i} is not a valid base64 string.` });
    }
  }

  let allProgramIds = [];
  for (var account of accounts) {
    allProgramIds.push(account.ownerProgram);
  }
  await loadAllIdls(allProgramIds);

  try {
    let decodedAccounts: DecodedAccount[] = [];
    for (var account of accounts) {
      let parser = parsersCache.get(account.ownerProgram) as SolanaFMParser;
      if (parser === null) {
        // Didn't find parser last time we checked
        decodedAccounts.push({ decodedData: null });
        continue;
      }

      // Parse the account
      let accountParser = parser.createParser(ParserType.ACCOUNT) as AccountParserInterface;
      const decodedData = accountParser.parseAccount(account.data);
      decodedAccounts.push({
        decodedData: decodedData
          ? { owner: account.ownerProgram, name: decodedData?.name, data: decodedData?.data }
          : null,
      });
      continue;
    }

    return res.status(200).json({ decodedAccounts });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

// Endpoint to decode instructions for a list of transactions
app.post("/decode/instructions", async (req: Request, res: Response) => {
  // TODO(fabio): Improve validation of request body
  if (!req.body.instructionsPerTransaction) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const { instructionsPerTransaction } = req.body as DecodeTransactionsRequestBody;

    let allProgramIds = getProgramIds(instructionsPerTransaction);
    await loadAllIdls(allProgramIds);

    let decodedTransactions: (TopLevelInstruction[] | null)[] = [];
    for (var transactionInstructions of instructionsPerTransaction) {
      if (transactionInstructions === null) {
        decodedTransactions.push(null);
        continue;
      }
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
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

async function loadAllIdls(programIds: string[]) {
  let getProgramIdlFutures = [];
  let programsWithMissingIdls = [];
  for (var programId of programIds) {
    let instructionParser = parsersCache.get(programId) as InstructionParserInterface;
    // If we already seen the programId before, skip
    if (instructionParser !== undefined || instructionParser === null) {
      continue;
    }

    // We haven't seen the programId before, add call to fetch it's IDL
    getProgramIdlFutures.push(getProgramIdl(programId));
    programsWithMissingIdls.push(programId);
  }

  let SFMIdlItems = await Promise.all(getProgramIdlFutures);
  for (var i = 0; i < SFMIdlItems.length; i++) {
    let SFMIdlItem = SFMIdlItems[i];
    let programId = programsWithMissingIdls[i] as string;
    if (SFMIdlItem != undefined) {
      const parser = new SolanaFMParser(SFMIdlItem, programId);
      parsersCache.set(programId, parser);
    } else {
      parsersCache.set(programId, null); // Insert into cache to avoid trying to fetch IDL again
    }
  }
}

async function decodeInstruction(instruction: Instruction): Promise<Instruction> {
  const programId = instruction.programId.toString();
  let parsedInstruction = {
    programId: programId.toString(),
    encodedData: instruction.encodedData,
    name: null,
    decodedData: null,
    accountKeys: instruction.accountKeys,
  };

  let parser = parsersCache.get(programId) as SolanaFMParser;
  if (parser == null) {
    return parsedInstruction; // Short-circuit without decodedData since IDL is missing
  }
  let instructionParser = parser.createParser(ParserType.INSTRUCTION) as InstructionParserInterface;

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

function postProcessDecodedInstruction(decodedInstructionData: any, decodedInstructionDataWithTypes: any): any {
  if (decodedInstructionData === null || decodedInstructionDataWithTypes === null) {
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
  });

  return decodedInstructionData;
}

function getProgramIds(instructionsPerTransaction: (TopLevelInstruction[] | null)[]): string[] {
  let allProgramIds: string[] = [];
  for (var transactionInstructions of instructionsPerTransaction) {
    if (transactionInstructions === null) continue; // Skip nulls
    for (var instruction of transactionInstructions) {
      allProgramIds.push(instruction.topLevelInstruction.programId);
      for (var inner_instruction of instruction.flattenedInnerInstructions) {
        allProgramIds.push(inner_instruction.programId);
      }
    }
  }
  // Dedup programIds
  let dedupedProgramIds = new Set(allProgramIds);
  return Array.from(dedupedProgramIds);
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
