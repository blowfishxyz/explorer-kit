import { AccountParserInterface, ParserType } from "@solanafm/explorer-kit";
import bodyParser from "body-parser";
import express, { Express, Request, Response } from "express";
import { collectDefaultMetrics } from "prom-client";
import { z } from "zod";

import { decodeProgramError } from "@/components/decoders/errors";
import { decodeInstruction, getProgramIds } from "@/components/decoders/instructions";
import { loadAllIdls } from "@/components/idls";
import { register } from "@/components/metrics";
import { responseDurationMiddleware } from "@/middlewares/metrics";
import { Account, DecodedAccount, ProgramError, TopLevelInstruction } from "@/types";
import { isValidBase58, isValidBase64 } from "@/utils/validation";

interface DecodeAccountsRequestBody {
  accounts: Account[];
}

interface DecodeTransactionsRequestBody {
  instructionsPerTransaction: (TopLevelInstruction[] | null)[];
}

interface DecodedErrorsResponse {
  decodedErrors: (ProgramError | null)[];
}

collectDefaultMetrics({ register });

const app: Express = express();
app.use(bodyParser.json({ limit: "50mb" }));

// Endpoint to decode accounts data
app.get("/healthz", async (_req: Request, res: Response) => {
  return res.status(200).json({ status: "OK" });
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
  const allProgramIds = accounts.map((account) => account.ownerProgram);
  const idls = await loadAllIdls(allProgramIds);

  try {
    const decodedAccounts: DecodedAccount[] = [];
    for (const account of accounts) {
      const parser = idls.get(account.ownerProgram);
      if (!parser) {
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

  const programIdsWithFailure = data.errors.filter((err) => err?.errorCode).map((err) => err?.programId) as string[];

  const idls = await loadAllIdls(programIdsWithFailure);
  const decodedErrors = data.errors.map((error) => error && decodeProgramError(idls, error));
  const response: DecodedErrorsResponse = { decodedErrors };

  return res.status(200).json(response);
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
    const allProgramIds = getProgramIds(instructionsPerTransaction);
    const idls = await loadAllIdls(allProgramIds);

    const decodedTransactions: (TopLevelInstruction[] | null)[] = [];

    for (const transactionInstructions of instructionsPerTransaction) {
      if (!transactionInstructions) {
        decodedTransactions.push(null);
        continue;
      }

      const decodedTransaction: TopLevelInstruction[] = [];

      for (const instruction of transactionInstructions) {
        // First decode top level ix, then all nested ixs
        const decodedTopLevelInstruction = await decodeInstruction(idls, instruction.topLevelInstruction);
        const decodedInnerInstruction = [];

        for (const innerInstruction of instruction.flattenedInnerInstructions) {
          decodedInnerInstruction.push(await decodeInstruction(idls, innerInstruction));
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
