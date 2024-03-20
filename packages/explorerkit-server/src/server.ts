import { AccountParserInterface, InstructionParserInterface, ParserType, SolanaFMParser } from "@solanafm/explorer-kit";
import { getProgramIdl } from "@solanafm/explorer-kit-idls";
import bodyParser from "body-parser";
import { Buffer } from "buffer";
import express, { Express, Request, Response } from "express";
import NodeCache from "node-cache";
import { collectDefaultMetrics, Gauge, Histogram, Registry } from "prom-client";

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

const register = new Registry();
collectDefaultMetrics({ register });

// Define custom metrics for NodeCache statistics
const hitsGauge = new Gauge({
  name: "nodecache_hits_total",
  help: "Total number of cache hits",
  registers: [register],
});
const missesGauge = new Gauge({
  name: "nodecache_misses_total",
  help: "Total number of cache misses",
  registers: [register],
});
const keysGauge = new Gauge({
  name: "nodecache_keys_total",
  help: "Total number of keys in the cache",
  registers: [register],
});
const ksizeGauge = new Gauge({
  name: "nodecache_ksize_bytes",
  help: "Total key size in bytes",
  registers: [register],
});
const vsizeGauge = new Gauge({
  name: "nodecache_vsize_bytes",
  help: "Total value size in bytes",
  registers: [register],
});
const httpRequestDurationMicroseconds = new Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 5, 15, 50, 100, 300, 500, 1000],
  registers: [register],
});

// Cache that evicts anything unused in the last 30mins
let thirty_mins_in_seconds = 1800;
const parsersCache = new NodeCache({ stdTTL: thirty_mins_in_seconds, checkperiod: 120 });

// Update cache statistics in the metrics
setInterval(() => {
  const stats = parsersCache.getStats();
  hitsGauge.set(stats.hits);
  missesGauge.set(stats.misses);
  keysGauge.set(stats.keys);
  ksizeGauge.set(stats.ksize);
  vsizeGauge.set(stats.vsize);
}, 30000); // Update every 30sec

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

// Middleware to measure response times
app.use((req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => { // Event listener for when the response has been sent
    const diff = process.hrtime(start);
    const responseTimeInMs = diff[0] * 1e3 + diff[1] * 1e-6; // Convert to milliseconds

    httpRequestDurationMicroseconds
      .labels(req.method, req.path, res.statusCode.toString())
      .observe(responseTimeInMs);
  });

  next();
});

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

// Expose the metrics at the /metrics endpoint
app.get("/metrics", async (_req: Request, res: Response) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// Endpoint to decode accounts data
app.post("/decode/accounts", async (req: Request, res: Response) => {
  if (!req.body.accounts || !Array.isArray(req.body.accounts)) {
    return res.status(400).json({ error: "Invalid request body" });
  }
  for (let account of req.body.accounts) {
    if (!account.ownerProgram || typeof account.ownerProgram !== "string") {
      return res.status(400).json({ error: "'account.ownerProgram' is required and must be a string." });
    }
    if (!account.data || typeof account.data !== "string") {
      return res.status(400).json({ error: "'account.data' is required and must be a string." });
    }
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
  for (let account of accounts) {
    allProgramIds.push(account.ownerProgram);
  }
  await loadAllIdls(allProgramIds);

  try {
    let decodedAccounts: DecodedAccount[] = [];
    for (let account of accounts) {
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
  for (let instructions of req.body.instructionsPerTransaction) {
    if (!Array.isArray(instructions) && instructions !== null) {
      return res.status(400).json({ error: "Invalid request body" });
    }
    if (instructions === null) {
      continue;
    }
    for (let instruction of instructions) {
      if (!instruction.topLevelInstruction || !instruction.flattenedInnerInstructions) {
        return res.status(400).json({ error: "Invalid request body" });
      }
      let topLevelInstruction = instruction.topLevelInstruction;
      if (
        topLevelInstruction.programId === undefined ||
        topLevelInstruction.encodedData === undefined ||
        topLevelInstruction.accountKeys === undefined ||
        !Array.isArray(topLevelInstruction.accountKeys) ||
        !Array.isArray(instruction.flattenedInnerInstructions)
      ) {
        return res.status(400).json({ error: "Invalid request body" });
      }
      let flattenedInnerInstructions = instruction.flattenedInnerInstructions;
      for (let innerInstruction of flattenedInnerInstructions) {
        if (
          innerInstruction.programId === undefined ||
          innerInstruction.encodedData === undefined ||
          innerInstruction.accountKeys === undefined ||
          !Array.isArray(innerInstruction.accountKeys)
        ) {
          return res.status(400).json({ error: "Invalid request body" });
        }
      }
    }
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
