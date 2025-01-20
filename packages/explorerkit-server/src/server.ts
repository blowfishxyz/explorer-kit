import { checkIfAccountParser, ParserType } from "@solanafm/explorer-kit";
import { ParserOutput } from "@solanafm/explorer-kit/src";
import fastify, { FastifyInstance } from "fastify";
import { collectDefaultMetrics } from "prom-client";
import { z } from "zod";

import { decodeProgramError } from "@/components/decoders/errors";
import { decodeInstruction, getProgramIds } from "@/components/decoders/instructions";
import { loadAllIdls } from "@/components/idls";
import { register } from "@/components/metrics";
import { responseDurationMiddleware } from "@/middlewares/metrics";
import { Account, DecodedAccount, ProgramError, TopLevelInstruction } from "@/types";

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

const app: FastifyInstance = fastify({
  logger: process.env["NODE_ENV"] !== "production",
  bodyLimit: 50 * 1024 * 1024, // 50MB
});

// Health check endpoint
app.get("/healthz", async (_request, reply) => {
  return reply.status(200).send({ status: "OK" });
});

// Metrics endpoint
app.get("/metrics", async (_request, reply) => {
  reply.header("Content-Type", register.contentType);
  return reply.send(await register.metrics());
});

const decodeAccountsSchema = z.object({
  accounts: z.array(
    z.object({
      ownerProgram: z.string(),
      data: z.string(),
    })
  ),
});

// Decode accounts endpoint
app.post<{ Body: DecodeAccountsRequestBody }>(
  "/decode/accounts",
  { preHandler: responseDurationMiddleware },
  async (request, reply) => {
    const { data, error } = decodeAccountsSchema.safeParse(request.body);

    if (error) {
      return reply.status(400).send({ error: "Invalid request body", errors: error.errors });
    }

    const { accounts } = data;
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
        const accountParser = parser.createParser(ParserType.ACCOUNT);

        if (!accountParser || !checkIfAccountParser(accountParser)) {
          decodedAccounts.push({ decodedData: null });
          continue;
        }

        let decodedData: ParserOutput | undefined;
        try {
          decodedData = accountParser.parseAccount(account.data);
        } catch {
          continue;
        }

        decodedAccounts.push({
          decodedData: decodedData
            ? { owner: account.ownerProgram, name: decodedData.name, data: decodedData.data }
            : null,
        });
      }

      return reply.send({ decodedAccounts });
    } catch (e: any) {
      request.log.error("failed to decode accounts", e);
      return reply.status(500).send({ error: e.message });
    }
  }
);

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

// Decode errors endpoint
app.post("/decode/errors", { preHandler: responseDurationMiddleware }, async (request, reply) => {
  const { data, error } = decodeErrorsSchema.safeParse(request.body);

  if (error) {
    return reply.status(400).send({ error: "Invalid request body", errors: error.errors });
  }

  const programIdsWithFailure = data.errors.filter((err) => err?.errorCode).map((err) => err?.programId) as string[];

  const idls = await loadAllIdls(programIdsWithFailure);

  try {
    const decodedErrors = data.errors.map((error) => error && decodeProgramError(idls, error));
    const response: DecodedErrorsResponse = { decodedErrors };

    return reply.send(response);
  } catch (e: any) {
    request.log.error("failed to decode errors", e);
    return reply.status(500).send({ error: e.message });
  }
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

// Decode instructions endpoint
app.post<{ Body: DecodeTransactionsRequestBody }>(
  "/decode/instructions",
  { preHandler: responseDurationMiddleware },
  async (request, reply) => {
    const { data, error } = decodeInstructionsSchema.safeParse(request.body);

    if (error) {
      return reply.status(400).send({ error: "Invalid request body", errors: error.errors });
    }

    try {
      const { instructionsPerTransaction } = data;
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
          const decodedTopLevelInstruction = decodeInstruction(idls, instruction.topLevelInstruction);
          const decodedInnerInstruction = [];

          for (const innerInstruction of instruction.flattenedInnerInstructions) {
            decodedInnerInstruction.push(decodeInstruction(idls, innerInstruction));
          }

          decodedTransaction.push({
            topLevelInstruction: decodedTopLevelInstruction,
            flattenedInnerInstructions: decodedInnerInstruction,
          });
        }
        decodedTransactions.push(decodedTransaction);
      }

      return reply.send({ decodedTransactions });
    } catch (e: any) {
      request.log.error("failed to decode instructions", e);
      return reply.status(500).send({ error: e.message });
    }
  }
);

export { app };
