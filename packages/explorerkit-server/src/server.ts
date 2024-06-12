import { AccountParserInterface, ParserType, SolanaFMParser } from "@solanafm/explorer-kit";
import bodyParser from "body-parser";
import express, { Express, NextFunction, Request, Response } from "express";
import { collectDefaultMetrics, Histogram, Registry } from "prom-client";
import { z } from "zod";

import { decodeProgramError } from "./decoders/errors";
import { decodeInstruction, getProgramIds } from "./decoders/instructions";
import { loadAllIdls, parsersCache } from "./parsers-cache";
import { Account, DecodedAccount, TopLevelInstruction } from "./types";
import { isValidBase58, isValidBase64 } from "./utils/validation";

interface DecodeAccountsRequestBody {
  accounts: Account[];
}

interface DecodeTransactionsRequestBody {
  instructionsPerTransaction: (TopLevelInstruction[] | null)[];
}

const register = new Registry();
collectDefaultMetrics({ register });

const httpRequestDurationMicroseconds = new Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 5, 15, 50, 100, 300, 500, 1000],
  registers: [register],
});

const app: Express = express();
app.use(bodyParser.json({ limit: "50mb" }));

const responseDurationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = process.hrtime();

  res.on("finish", () => {
    // Event listener for when the response has been sent
    const diff = process.hrtime(start);
    const responseTimeInMs = diff[0] * 1e3 + diff[1] * 1e-6; // Convert to milliseconds

    httpRequestDurationMicroseconds.labels(req.method, req.path, res.statusCode.toString()).observe(responseTimeInMs);
  });

  next();
};

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

const decodeAccountsSchema = z.object({
  accounts: z.array(
    z.object({
      ownerProgram: z.string().refine(isValidBase58, {
        message: "account.ownerProgram is not a valid base58 string",
      }),
      data: z.string().refine(isValidBase64, {
        message: "account.data is not a valid base64 string",
      }),
    })
  ),
});

// Endpoint to decode accounts data
app.post("/decode/accounts", responseDurationMiddleware, async (req: Request, res: Response) => {
  const { data, error } = decodeAccountsSchema.safeParse(req.body);

  if (error) {
    return res.status(400).json({ error: "Invalid request body", errors: error.errors });
  }

  const { accounts } = data satisfies DecodeAccountsRequestBody;

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
    }

    return res.status(200).json({ decodedAccounts });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

const decodeErrorsSchema = z.object({
  errors: z.array(
    z
      .object({
        programId: z.string(),
        errorCode: z.coerce.number().nullable().optional(),
      })
      .nullable()
  ),
});

// Endpoint to decode program errors
app.post("/decode/errors", responseDurationMiddleware, async (req: Request, res: Response) => {
  const { data, error } = decodeErrorsSchema.safeParse(req.body);

  if (error) {
    return res.status(400).json({ error: "Invalid request body", errors: error.errors });
  }

  const programIdsWithFailure = data.errors
    .filter((err) => err?.errorCode)
    .map((err) => err?.programId)
    .map((v) => v!);

  await loadAllIdls(programIdsWithFailure);
  const decodedErrors = data.errors.map((error) => error && decodeProgramError(error));

  return res.status(200).json({ decodedErrors });
});

const decodeInstructionsSchema = z.object({
  instructionsPerTransaction: z.array(
    z
      .array(
        z.object({
          topLevelInstruction: z.object({
            programId: z.string(),
            encodedData: z.string(),
            accountKeys: z.array(z.string()),
          }),
          flattenedInnerInstructions: z.array(
            z.object({
              programId: z.string(),
              encodedData: z.string(),
              accountKeys: z.array(z.string()),
            })
          ),
        })
      )
      .nullable()
  ),
});

// Endpoint to decode instructions for a list of transactions
app.post("/decode/instructions", responseDurationMiddleware, async (req: Request, res: Response) => {
  const { data, error } = decodeInstructionsSchema.safeParse(req.body);

  if (error) {
    return res.status(400).json({ error: "Invalid request body", errors: error.errors });
  }

  try {
    const { instructionsPerTransaction } = data satisfies DecodeTransactionsRequestBody;

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

export { app };
