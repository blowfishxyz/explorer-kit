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
  transactions: string[];
}

interface DecodedTransactions {
  error: string | null;
  instructions: Instruction[] | null;
}

interface Instruction {
  programId: string;
  encodedData: string;
  decodedData: any | null;
  name: string | null;
}

const app: Express = express();
app.use(bodyParser.json());

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
  const { transactions } = req.body as DecodeTransactionsRequestBody;

  let instructionParsers: { [key: string]: InstructionParserInterface } = {};
  let decodedTransactions: DecodedTransactions[] = [];
  for (var encodedTx of transactions) {
    let txBuffer = null;
    if (isValidBase58(encodedTx)) {
      txBuffer = Buffer.from(bs58.decode(encodedTx));
    } else if (isValidBase64(encodedTx)) {
      txBuffer = Buffer.from(encodedTx, "base64");
    } else {
      decodedTransactions.push({ error: "'transaction' is not a valid base64 string.", instructions: null });
      continue;
    }

    try {
      const tx = VersionedTransaction.deserialize(txBuffer);
      let instructions: Instruction[] = [];
      if (tx.message instanceof Message) {
        for (var ix of tx.message.instructions) {
          let programId = tx.message.accountKeys[ix.programIdIndex];
          if (programId === undefined) {
            decodedTransactions.push({ error: "programId not found in accounts", instructions: null });
            continue;
          }
          instructions.push({
            programId: programId.toString(), // We know programId will exist
            encodedData: ix.data,
            name: null,
            decodedData: null,
          });
        }
      } else if (tx.message instanceof MessageV0) {
        for (var inst of tx.message.compiledInstructions) {
          let programId = tx.message.staticAccountKeys[inst.programIdIndex];
          if (programId === undefined) {
            decodedTransactions.push({ error: "programId not found in staticAccountKeys", instructions: null });
            continue;
          }
          instructions.push({
            programId: programId.toString(),
            encodedData: bs58.encode(inst.data),
            name: null,
            decodedData: null,
          });
        }
      } else {
        throw new Error("Unsupported message version");
      }

      let finalInstructions: Instruction[] = [];
      for (var instruction of instructions) {
        const programId = instruction.programId.toString();
        let instructionParser = instructionParsers[programId];

        if (instructionParser == undefined) {
          const SFMIdlItem = await getProgramIdl(programId);
          if (SFMIdlItem) {
            const parser = new SolanaFMParser(SFMIdlItem, programId);
            instructionParser = parser.createParser(ParserType.INSTRUCTION) as InstructionParserInterface;
            instructionParsers[programId] = instructionParser;
          } else {
            finalInstructions.push(instruction);
            continue;
          }
        }

        // Parse the transaction
        const decodedInstruction = instructionParser.parseInstructions(instruction.encodedData);
        finalInstructions.push({
          programId: instruction.programId,
          encodedData: instruction.encodedData,
          name: decodedInstruction?.name || null,
          decodedData: decodedInstruction?.data || null,
        });
      }

      decodedTransactions.push({ error: null, instructions: finalInstructions });
    } catch (e: any) {
      decodedTransactions.push({ error: e.message, instructions: null });
    }
  }

  return res.status(200).json({ decodedTransactions });
});

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
