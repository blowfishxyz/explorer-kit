import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../src/server";

describe("Server API Tests", () => {
  it("Decodes accounts correctly", async () => {
    const res = await request(app)
      .post("/decode/accounts")
      .send({
        accounts: [
          {
            ownerProgram: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            data: "/NFB6YMsrxCtkXSVyg8nG1spPNRwJ+pzcAftQOs5oL0mA+FEPRpnATHIUtp5LuY9RJEScraeiSf6ghxvpIcl2eGPjQUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      decodedAccounts: [
        {
          decodedData: {
            owner: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            name: "tokenAccount",
            data: {
              mint: "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn",
              owner: "3ZPvbCiQuo3HxSiqQejCUTVWUrnpF3EbBCrrbtPJEBkU",
              amount: "93163489",
              delegate: null,
              accountState: {
                enumType: "initialized",
              },
              isNative: null,
              delegatedAmount: "0",
              closeAuthority: null,
            },
          },
        },
      ],
    });
  });

  it("Decodes instructions correctly", async () => {
    const res = await request(app)
      .post("/decode/instructions")
      .send({
        instructionsPerTransaction: [
          [
            {
              flattenedInnerInstructions: [],
              topLevelInstruction: {
                accountKeys: [],
                decodedData: null,
                encodedData: "G7pdkT",
                name: "setComputeUnitLimit",
                programId: "ComputeBudget111111111111111111111111111111",
              },
            },
            {
              flattenedInnerInstructions: [],
              topLevelInstruction: {
                accountKeys: [],
                decodedData: null,
                encodedData: "3ta97iYzVb3u",
                name: "setComputeUnitPrice",
                programId: "ComputeBudget111111111111111111111111111111",
              },
            },
            {
              flattenedInnerInstructions: [
                {
                  accountKeys: ["So11111111111111111111111111111111111111112"],
                  decodedData: null,
                  encodedData: "84eT",
                  name: "getAccountDataSize",
                  programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                },
                {
                  accountKeys: [
                    "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                    "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                  ],
                  decodedData: null,
                  encodedData: "11119os1e9qSs2u7TsThXqkBSRVFxhmYaFKFZ1waB2X7armDmvK3p5GmLdUxYdg3h7QSrL",
                  name: "createAccount",
                  programId: "11111111111111111111111111111111",
                },
                {
                  accountKeys: ["EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae"],
                  decodedData: null,
                  encodedData: "P",
                  name: "initializeImmutableOwner",
                  programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                },
                {
                  accountKeys: [
                    "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                    "So11111111111111111111111111111111111111112",
                  ],
                  decodedData: null,
                  encodedData: "6TVvVvH1pYTAyPUVAWuGot6sWWw8MZzkRpJ9Pu6RZyYT1",
                  name: "initializeAccount3",
                  programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                },
              ],
              topLevelInstruction: {
                accountKeys: [
                  "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                  "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                  "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                  "So11111111111111111111111111111111111111112",
                  "11111111111111111111111111111111",
                  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                ],
                decodedData: null,
                encodedData: "2",
                name: "createIdempotent",
                programId: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
              },
            },
            {
              flattenedInnerInstructions: [],
              topLevelInstruction: {
                accountKeys: [
                  "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                  "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                ],
                decodedData: null,
                encodedData: "3Bxs3zzLZLuLQEYX",
                name: "transfer",
                programId: "11111111111111111111111111111111",
              },
            },
            {
              flattenedInnerInstructions: [],
              topLevelInstruction: {
                accountKeys: ["EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae"],
                decodedData: null,
                encodedData: "J",
                name: "syncNative",
                programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              },
            },
            {
              flattenedInnerInstructions: [
                {
                  accountKeys: ["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"],
                  decodedData: null,
                  encodedData: "84eT",
                  name: "getAccountDataSize",
                  programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                },
                {
                  accountKeys: [
                    "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                    "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                  ],
                  decodedData: null,
                  encodedData: "11119os1e9qSs2u7TsThXqkBSRVFxhmYaFKFZ1waB2X7armDmvK3p5GmLdUxYdg3h7QSrL",
                  name: "createAccount",
                  programId: "11111111111111111111111111111111",
                },
                {
                  accountKeys: ["GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH"],
                  decodedData: null,
                  encodedData: "P",
                  name: "initializeImmutableOwner",
                  programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                },
                {
                  accountKeys: [
                    "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                  ],
                  decodedData: null,
                  encodedData: "6TVvVvH1pYTAyPUVAWuGot6sWWw8MZzkRpJ9Pu6RZyYT1",
                  name: "initializeAccount3",
                  programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                },
              ],
              topLevelInstruction: {
                accountKeys: [
                  "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                  "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                  "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                  "11111111111111111111111111111111",
                  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                ],
                decodedData: null,
                encodedData: "2",
                name: "createIdempotent",
                programId: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
              },
            },
            {
              flattenedInnerInstructions: [
                {
                  accountKeys: [
                    "7GmDCbu7bYiWJvFaNUyPNiM8PjvvBcmyBcZY1qSsAGi2",
                    "DrRd8gYMJu9XGxLhwTCPdHNLXCKHsxJtMpbn62YqmwQe",
                    "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                    "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                    "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                    "EVGW4q1iFjDmtxtHr3NoPi5iVKAxwEjohsusMrinDxr6",
                    "53EkU98Vbv2TQPwGG6t2asCynzFjCX5AnvaabbXafaed",
                    "FGYgFJSxZTGzaLwzUL9YZqK2yUZ8seofCwGq8BPEw4o8",
                    "FwWV8a193zZsYxaRAbYkrM6tmrHMoVY1Xahh2PNFejvF",
                    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                    "856QrABEMYwVXStv5G1KkUtKuF3nUDPpVwFY2nc2NwXd",
                    "H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG",
                    "7oo7u7iXrNCekxWWpfLYCbXyjrYLAco5FM9qSjQeNn7g",
                  ],
                  decodedData: null,
                  encodedData: "PgQWtn8oziwptKbHC8eyBMEh75L46cD9R",
                  name: "swap",
                  programId: "2wT8Yq49kHgDzXuPxZSaeLaH1qbmGXtEyPy64bL7aD3c",
                },
                {
                  accountKeys: [
                    "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                    "EVGW4q1iFjDmtxtHr3NoPi5iVKAxwEjohsusMrinDxr6",
                    "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                  ],
                  decodedData: null,
                  encodedData: "3DbEuZHcyqBD",
                  name: "transfer",
                  programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                },
                {
                  accountKeys: [
                    "FGYgFJSxZTGzaLwzUL9YZqK2yUZ8seofCwGq8BPEw4o8",
                    "FwWV8a193zZsYxaRAbYkrM6tmrHMoVY1Xahh2PNFejvF",
                    "7GmDCbu7bYiWJvFaNUyPNiM8PjvvBcmyBcZY1qSsAGi2",
                  ],
                  decodedData: null,
                  encodedData: "6iJigqBUeUcF",
                  name: "mintTo",
                  programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                },
                {
                  accountKeys: [
                    "53EkU98Vbv2TQPwGG6t2asCynzFjCX5AnvaabbXafaed",
                    "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                    "7GmDCbu7bYiWJvFaNUyPNiM8PjvvBcmyBcZY1qSsAGi2",
                  ],
                  decodedData: null,
                  encodedData: "3w5WV196TcpF",
                  name: "transfer",
                  programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                },
                {
                  accountKeys: ["D8cy77BBepLMngZx6ZukaTff5hCt1HrWyKk3Hnd9oitf"],
                  decodedData: null,
                  encodedData:
                    "QMqFu4fYGGeUEysFnenhAvGHnSPFLovkZXi46MfLjsSzqJhm6XkVGqWpaXx8STNjEgoafNsZcrmDQKhSHUushBvvEwmFp69UewGqbW1sofQNSqKEUdGJbzFaqosQg3PZ2iuLpqr1ZzESM9QK6RSi5HrSakDckdoMr8eeNo6GNBTidyy",
                  name: "Anchor Self-CPI Log",
                  programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
                },
              ],
              topLevelInstruction: {
                accountKeys: [
                  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                  "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                  "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                  "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                  "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
                  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                  "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
                  "D8cy77BBepLMngZx6ZukaTff5hCt1HrWyKk3Hnd9oitf",
                  "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
                  "2wT8Yq49kHgDzXuPxZSaeLaH1qbmGXtEyPy64bL7aD3c",
                  "7GmDCbu7bYiWJvFaNUyPNiM8PjvvBcmyBcZY1qSsAGi2",
                  "DrRd8gYMJu9XGxLhwTCPdHNLXCKHsxJtMpbn62YqmwQe",
                  "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                  "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                  "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                  "EVGW4q1iFjDmtxtHr3NoPi5iVKAxwEjohsusMrinDxr6",
                  "53EkU98Vbv2TQPwGG6t2asCynzFjCX5AnvaabbXafaed",
                  "FGYgFJSxZTGzaLwzUL9YZqK2yUZ8seofCwGq8BPEw4o8",
                  "FwWV8a193zZsYxaRAbYkrM6tmrHMoVY1Xahh2PNFejvF",
                  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                  "856QrABEMYwVXStv5G1KkUtKuF3nUDPpVwFY2nc2NwXd",
                  "H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG",
                  "7oo7u7iXrNCekxWWpfLYCbXyjrYLAco5FM9qSjQeNn7g",
                ],
                decodedData: null,
                encodedData: "PrpFmsY4d26dKbdKMY6XTWGbxStW9GLfTwK7MEYLnMZJoCb1",
                name: "route",
                programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
              },
            },
            {
              flattenedInnerInstructions: [],
              topLevelInstruction: {
                accountKeys: [
                  "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                  "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                  "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                ],
                decodedData: null,
                encodedData: "A",
                name: "closeAccount",
                programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              },
            },
          ],
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      decodedTransactions: [
        [
          {
            flattenedInnerInstructions: [],
            topLevelInstruction: {
              accountKeys: [],
              decodedData: {
                computeUnitLimit: 224847,
                discriminator: 2,
              },
              encodedData: "G7pdkT",
              name: "setComputeUnitLimit",
              programId: "ComputeBudget111111111111111111111111111111",
            },
          },
          {
            flattenedInnerInstructions: [],
            topLevelInstruction: {
              accountKeys: [],
              decodedData: {
                computeUnitPrice: 317673,
                discriminator: 3,
              },
              encodedData: "3ta97iYzVb3u",
              name: "setComputeUnitPrice",
              programId: "ComputeBudget111111111111111111111111111111",
            },
          },
          {
            flattenedInnerInstructions: [
              {
                accountKeys: ["So11111111111111111111111111111111111111112"],
                decodedData: {
                  discriminator: 21,
                  mint: "So11111111111111111111111111111111111111112",
                },
                encodedData: "84eT",
                name: "getAccountDataSize",
                programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              },
              {
                accountKeys: [
                  "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                  "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                ],
                decodedData: {
                  discriminator: 0,
                  fundingAccount: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                  lamports: "2039280",
                  newAccount: "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                  owner: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                  space: "165",
                },
                encodedData: "11119os1e9qSs2u7TsThXqkBSRVFxhmYaFKFZ1waB2X7armDmvK3p5GmLdUxYdg3h7QSrL",
                name: "createAccount",
                programId: "11111111111111111111111111111111",
              },
              {
                accountKeys: ["EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae"],
                decodedData: {
                  discriminator: 22,
                  initializeAccount: "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                },
                encodedData: "P",
                name: "initializeImmutableOwner",
                programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              },
              {
                accountKeys: [
                  "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                  "So11111111111111111111111111111111111111112",
                ],
                decodedData: {
                  associatedMint: "So11111111111111111111111111111111111111112",
                  discriminator: 18,
                  initializeAccount: "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                  owner: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                },
                encodedData: "6TVvVvH1pYTAyPUVAWuGot6sWWw8MZzkRpJ9Pu6RZyYT1",
                name: "initializeAccount3",
                programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              },
            ],
            topLevelInstruction: {
              accountKeys: [
                "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                "So11111111111111111111111111111111111111112",
                "11111111111111111111111111111111",
                "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              ],
              decodedData: {
                associatedAccountAddress: "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                discriminator: 1,
                fundingAddress: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                systemProgram: "11111111111111111111111111111111",
                tokenMintAddress: "So11111111111111111111111111111111111111112",
                tokenProgram: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                walletAddress: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
              },
              encodedData: "2",
              name: "createIdempotent",
              programId: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
            },
          },
          {
            flattenedInnerInstructions: [],
            topLevelInstruction: {
              accountKeys: [
                "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
              ],
              decodedData: {
                destination: "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                discriminator: 2,
                lamports: "1000000000",
                source: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
              },
              encodedData: "3Bxs3zzLZLuLQEYX",
              name: "transfer",
              programId: "11111111111111111111111111111111",
            },
          },
          {
            flattenedInnerInstructions: [],
            topLevelInstruction: {
              accountKeys: ["EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae"],
              decodedData: {
                discriminator: 17,
                nativeTokenAccount: "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
              },
              encodedData: "J",
              name: "syncNative",
              programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            },
          },
          {
            flattenedInnerInstructions: [
              {
                accountKeys: ["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"],
                decodedData: {
                  discriminator: 21,
                  mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                },
                encodedData: "84eT",
                name: "getAccountDataSize",
                programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              },
              {
                accountKeys: [
                  "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                  "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                ],
                decodedData: {
                  discriminator: 0,
                  fundingAccount: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                  lamports: "2039280",
                  newAccount: "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                  owner: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                  space: "165",
                },
                encodedData: "11119os1e9qSs2u7TsThXqkBSRVFxhmYaFKFZ1waB2X7armDmvK3p5GmLdUxYdg3h7QSrL",
                name: "createAccount",
                programId: "11111111111111111111111111111111",
              },
              {
                accountKeys: ["GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH"],
                decodedData: {
                  discriminator: 22,
                  initializeAccount: "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                },
                encodedData: "P",
                name: "initializeImmutableOwner",
                programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              },
              {
                accountKeys: [
                  "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                ],
                decodedData: {
                  associatedMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                  discriminator: 18,
                  initializeAccount: "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                  owner: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                },
                encodedData: "6TVvVvH1pYTAyPUVAWuGot6sWWw8MZzkRpJ9Pu6RZyYT1",
                name: "initializeAccount3",
                programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              },
            ],
            topLevelInstruction: {
              accountKeys: [
                "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                "11111111111111111111111111111111",
                "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              ],
              decodedData: {
                associatedAccountAddress: "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                discriminator: 1,
                fundingAddress: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                systemProgram: "11111111111111111111111111111111",
                tokenMintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                tokenProgram: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                walletAddress: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
              },
              encodedData: "2",
              name: "createIdempotent",
              programId: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
            },
          },
          {
            flattenedInnerInstructions: [
              {
                accountKeys: [
                  "7GmDCbu7bYiWJvFaNUyPNiM8PjvvBcmyBcZY1qSsAGi2",
                  "DrRd8gYMJu9XGxLhwTCPdHNLXCKHsxJtMpbn62YqmwQe",
                  "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                  "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                  "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                  "EVGW4q1iFjDmtxtHr3NoPi5iVKAxwEjohsusMrinDxr6",
                  "53EkU98Vbv2TQPwGG6t2asCynzFjCX5AnvaabbXafaed",
                  "FGYgFJSxZTGzaLwzUL9YZqK2yUZ8seofCwGq8BPEw4o8",
                  "FwWV8a193zZsYxaRAbYkrM6tmrHMoVY1Xahh2PNFejvF",
                  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                  "856QrABEMYwVXStv5G1KkUtKuF3nUDPpVwFY2nc2NwXd",
                  "H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG",
                  "7oo7u7iXrNCekxWWpfLYCbXyjrYLAco5FM9qSjQeNn7g",
                ],
                decodedData: {
                  amm: "DrRd8gYMJu9XGxLhwTCPdHNLXCKHsxJtMpbn62YqmwQe",
                  amountIn: "1000000000",
                  authority: "7GmDCbu7bYiWJvFaNUyPNiM8PjvvBcmyBcZY1qSsAGi2",
                  destinationInfo: "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                  feeAccount: "FwWV8a193zZsYxaRAbYkrM6tmrHMoVY1Xahh2PNFejvF",
                  minimumAmountOut: "0",
                  oracleMainAccount: "856QrABEMYwVXStv5G1KkUtKuF3nUDPpVwFY2nc2NwXd",
                  oraclePcAccount: "7oo7u7iXrNCekxWWpfLYCbXyjrYLAco5FM9qSjQeNn7g",
                  oracleSubAccount: "H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG",
                  poolMint: "FGYgFJSxZTGzaLwzUL9YZqK2yUZ8seofCwGq8BPEw4o8",
                  sourceInfo: "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                  swapDestination: "53EkU98Vbv2TQPwGG6t2asCynzFjCX5AnvaabbXafaed",
                  swapSource: "EVGW4q1iFjDmtxtHr3NoPi5iVKAxwEjohsusMrinDxr6",
                  tokenProgram: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                  userTransferAuthority: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                },
                encodedData: "PgQWtn8oziwptKbHC8eyBMEh75L46cD9R",
                name: "swap",
                programId: "2wT8Yq49kHgDzXuPxZSaeLaH1qbmGXtEyPy64bL7aD3c",
              },
              {
                accountKeys: [
                  "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                  "EVGW4q1iFjDmtxtHr3NoPi5iVKAxwEjohsusMrinDxr6",
                  "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                ],
                decodedData: {
                  amount: "1000000000",
                  authority: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                  destination: "EVGW4q1iFjDmtxtHr3NoPi5iVKAxwEjohsusMrinDxr6",
                  discriminator: 3,
                  source: "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                },
                encodedData: "3DbEuZHcyqBD",
                name: "transfer",
                programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              },
              {
                accountKeys: [
                  "FGYgFJSxZTGzaLwzUL9YZqK2yUZ8seofCwGq8BPEw4o8",
                  "FwWV8a193zZsYxaRAbYkrM6tmrHMoVY1Xahh2PNFejvF",
                  "7GmDCbu7bYiWJvFaNUyPNiM8PjvvBcmyBcZY1qSsAGi2",
                ],
                decodedData: {
                  amount: "245692",
                  discriminator: 7,
                  mint: "FGYgFJSxZTGzaLwzUL9YZqK2yUZ8seofCwGq8BPEw4o8",
                  mintAuthority: "7GmDCbu7bYiWJvFaNUyPNiM8PjvvBcmyBcZY1qSsAGi2",
                  mintTo: "FwWV8a193zZsYxaRAbYkrM6tmrHMoVY1Xahh2PNFejvF",
                },
                encodedData: "6iJigqBUeUcF",
                name: "mintTo",
                programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              },
              {
                accountKeys: [
                  "53EkU98Vbv2TQPwGG6t2asCynzFjCX5AnvaabbXafaed",
                  "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                  "7GmDCbu7bYiWJvFaNUyPNiM8PjvvBcmyBcZY1qSsAGi2",
                ],
                decodedData: {
                  amount: "135058680",
                  authority: "7GmDCbu7bYiWJvFaNUyPNiM8PjvvBcmyBcZY1qSsAGi2",
                  destination: "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                  discriminator: 3,
                  source: "53EkU98Vbv2TQPwGG6t2asCynzFjCX5AnvaabbXafaed",
                },
                encodedData: "3w5WV196TcpF",
                name: "transfer",
                programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              },
              {
                accountKeys: ["D8cy77BBepLMngZx6ZukaTff5hCt1HrWyKk3Hnd9oitf"],
                decodedData: {
                  logAuthority: {
                    data: "D8cy77BBepLMngZx6ZukaTff5hCt1HrWyKk3Hnd9oitf",
                    type: "publicKey",
                  },
                },
                encodedData:
                  "QMqFu4fYGGeUEysFnenhAvGHnSPFLovkZXi46MfLjsSzqJhm6XkVGqWpaXx8STNjEgoafNsZcrmDQKhSHUushBvvEwmFp69UewGqbW1sofQNSqKEUdGJbzFaqosQg3PZ2iuLpqr1ZzESM9QK6RSi5HrSakDckdoMr8eeNo6GNBTidyy",
                name: "Anchor Self-CPI Log",
                programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
              },
            ],
            topLevelInstruction: {
              accountKeys: [
                "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
                "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
                "D8cy77BBepLMngZx6ZukaTff5hCt1HrWyKk3Hnd9oitf",
                "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
                "2wT8Yq49kHgDzXuPxZSaeLaH1qbmGXtEyPy64bL7aD3c",
                "7GmDCbu7bYiWJvFaNUyPNiM8PjvvBcmyBcZY1qSsAGi2",
                "DrRd8gYMJu9XGxLhwTCPdHNLXCKHsxJtMpbn62YqmwQe",
                "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                "EVGW4q1iFjDmtxtHr3NoPi5iVKAxwEjohsusMrinDxr6",
                "53EkU98Vbv2TQPwGG6t2asCynzFjCX5AnvaabbXafaed",
                "FGYgFJSxZTGzaLwzUL9YZqK2yUZ8seofCwGq8BPEw4o8",
                "FwWV8a193zZsYxaRAbYkrM6tmrHMoVY1Xahh2PNFejvF",
                "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                "856QrABEMYwVXStv5G1KkUtKuF3nUDPpVwFY2nc2NwXd",
                "H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG",
                "7oo7u7iXrNCekxWWpfLYCbXyjrYLAco5FM9qSjQeNn7g",
              ],
              decodedData: {
                Unknown: "7oo7u7iXrNCekxWWpfLYCbXyjrYLAco5FM9qSjQeNn7g",
                destinationMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                destinationTokenAccount: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
                eventAuthority: "D8cy77BBepLMngZx6ZukaTff5hCt1HrWyKk3Hnd9oitf",
                inAmount: "1000000000",
                platformFeeAccount: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
                platformFeeBps: 0,
                program: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
                quotedOutAmount: "129746609",
                routePlan: [
                  {
                    inputIndex: 0,
                    outputIndex: 1,
                    percent: 100,
                    swap: {
                      lifinityV2: {},
                    },
                  },
                ],
                slippageBps: 50,
                tokenProgram: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                userDestinationTokenAccount: "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                userSourceTokenAccount: "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                userTransferAuthority: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
              },
              encodedData: "PrpFmsY4d26dKbdKMY6XTWGbxStW9GLfTwK7MEYLnMZJoCb1",
              name: "route",
              programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
            },
          },
          {
            flattenedInnerInstructions: [],
            topLevelInstruction: {
              accountKeys: [
                "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
              ],
              decodedData: {
                closeAccount: "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                destination: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                discriminator: 9,
                owner: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
              },
              encodedData: "A",
              name: "closeAccount",
              programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            },
          },
        ],
      ],
    });
  });

  it("Decodes instructions and replaces u8 arrays with the base64 encoded version", async () => {
    const res = await request(app)
      .post("/decode/instructions")
      .send({
        instructionsPerTransaction: [
          [
            {
              topLevelInstruction: {
                programId: "ComputeBudget111111111111111111111111111111",
                name: null,
                accountKeys: [],
                decodedData: null,
                encodedData: "3gJqkocMWaMm",
              },
              flattenedInnerInstructions: [],
            },
            {
              topLevelInstruction: {
                programId: "ComputeBudget111111111111111111111111111111",
                name: null,
                accountKeys: [],
                decodedData: null,
                encodedData: "Fj2Eoy",
              },
              flattenedInnerInstructions: [],
            },
            {
              topLevelInstruction: {
                programId: "gdrpGjVffourzkdDRrQmySw4aTHr8a3xmQzzxSwFD1a",
                name: null,
                accountKeys: [
                  "5fLKaqSeK9JzacWz4wPDyCx1Qet1Wmzziqwvx7d75bgw",
                  "GFy54nV4omphWte96uCJEKskhytMKMWxpCLEMYyqRDU5",
                  "HMJnQJUHtXpjyxyAxis7qVopTjRb7YLiLU4cV64bGBnE",
                  "Ak1k6b5JSE2MS2tzvjXm66LwEpPC1VhNnvJY7dQhCNCJ",
                  "6bRaU5zgh4qm8FtcnENHovRayjEbCYofruEQHakB18Ch",
                  "6bRaU5zgh4qm8FtcnENHovRayjEbCYofruEQHakB18Ch",
                  "11111111111111111111111111111111",
                  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                ],
                decodedData: null,
                encodedData:
                  "47CrT1QV8LwYJbGky5iSYnu5wHLXkTUebUF84JYF51nNgSTMrVLQCxNgTo8b7WgjByBJznKyh9rEfPhr2qLDwWUQohtsSYVb4wK5FinTjB2KbL7xZTuMGniWpLkhMVwywNfCJTiNiH93y2W5aE2m1cJ15n37FVdXAGWaLP75qwskunrhzudmzqssgrUdVGfxUZDiWsRURiA9RAvMEbQK7vVMfqU8VRR1rtULJ96nCbQnBbXxv14vcbZvCEG1uVz6marrbaxC87xy7BpdEk6mNGwsKFPdz5d7NV3tVkHYKPzyWRbgDVLLpmBqm8S9HZ6EyZQrEknhAnVmeXkZqqrLhWgqW27LfENKnKRRrr1Z5qvHRFCWF3Sbd3sc3sKwmbGvh6PyKo56xvM4AbJ9Egn9Xdt8L88rAdERxcsqQj5o1cAbvLYMajV8jMaBcvjrLx8Vg1VYccPC7EJeGNBJhvurx2LXNpwiz9dy4r3GrjqCDsC9io2LNHmgEc2T2DDVXmfawXCWLwd9GvPg33joe8z87eKTiEMG3JTDLSQZiyqDTDTQqzXCFUzkjwAbvN5vZ1XNw6M6wq2v4enqHn4oLXYZsTkCGY3ZYypSUtXAGmd414uyYpjMExwh3ttkz28u9gi6FqbFTY92B1C4hwW3XBURyUiyoNMJRsBMZ5XnES3PdwXFVBUSyp2SHczF4k5P4hbJ5KrXTKpsokwVWjwBbd2h5mceLN5MrcJiyR9A5iJxX6PM2uN1Z4YenoeZg3ZGbknxLvxq8bxNEoS9cgiM5wQWaaM3FcajxQ2JcC5YYy83fTq49uJdgcpWc9vKWQ513hx7U9aLUQujaBwaNkHVxKMNrbRYZJh1ECJhwNR3jqHaDNAYXxATERG9CrDgScGpjJvd3JRp1PL8dyjd6dLzZm",
              },
              flattenedInnerInstructions: [
                {
                  programId: "11111111111111111111111111111111",
                  name: null,
                  accountKeys: ["GFy54nV4omphWte96uCJEKskhytMKMWxpCLEMYyqRDU5"],
                  decodedData: null,
                  encodedData: "9krTD9xcLhG33Ebh",
                },
              ],
            },
          ],
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      decodedTransactions: [
        [
          {
            topLevelInstruction: {
              programId: "ComputeBudget111111111111111111111111111111",
              encodedData: "3gJqkocMWaMm",
              name: "setComputeUnitPrice",
              decodedData: {
                discriminator: 3,
                computeUnitPrice: 100000,
              },
              accountKeys: [],
            },
            flattenedInnerInstructions: [],
          },
          {
            topLevelInstruction: {
              programId: "ComputeBudget111111111111111111111111111111",
              encodedData: "Fj2Eoy",
              name: "setComputeUnitLimit",
              decodedData: {
                discriminator: 2,
                computeUnitLimit: 200000,
              },
              accountKeys: [],
            },
            flattenedInnerInstructions: [],
          },
          {
            topLevelInstruction: {
              programId: "gdrpGjVffourzkdDRrQmySw4aTHr8a3xmQzzxSwFD1a",
              encodedData:
                "47CrT1QV8LwYJbGky5iSYnu5wHLXkTUebUF84JYF51nNgSTMrVLQCxNgTo8b7WgjByBJznKyh9rEfPhr2qLDwWUQohtsSYVb4wK5FinTjB2KbL7xZTuMGniWpLkhMVwywNfCJTiNiH93y2W5aE2m1cJ15n37FVdXAGWaLP75qwskunrhzudmzqssgrUdVGfxUZDiWsRURiA9RAvMEbQK7vVMfqU8VRR1rtULJ96nCbQnBbXxv14vcbZvCEG1uVz6marrbaxC87xy7BpdEk6mNGwsKFPdz5d7NV3tVkHYKPzyWRbgDVLLpmBqm8S9HZ6EyZQrEknhAnVmeXkZqqrLhWgqW27LfENKnKRRrr1Z5qvHRFCWF3Sbd3sc3sKwmbGvh6PyKo56xvM4AbJ9Egn9Xdt8L88rAdERxcsqQj5o1cAbvLYMajV8jMaBcvjrLx8Vg1VYccPC7EJeGNBJhvurx2LXNpwiz9dy4r3GrjqCDsC9io2LNHmgEc2T2DDVXmfawXCWLwd9GvPg33joe8z87eKTiEMG3JTDLSQZiyqDTDTQqzXCFUzkjwAbvN5vZ1XNw6M6wq2v4enqHn4oLXYZsTkCGY3ZYypSUtXAGmd414uyYpjMExwh3ttkz28u9gi6FqbFTY92B1C4hwW3XBURyUiyoNMJRsBMZ5XnES3PdwXFVBUSyp2SHczF4k5P4hbJ5KrXTKpsokwVWjwBbd2h5mceLN5MrcJiyR9A5iJxX6PM2uN1Z4YenoeZg3ZGbknxLvxq8bxNEoS9cgiM5wQWaaM3FcajxQ2JcC5YYy83fTq49uJdgcpWc9vKWQ513hx7U9aLUQujaBwaNkHVxKMNrbRYZJh1ECJhwNR3jqHaDNAYXxATERG9CrDgScGpjJvd3JRp1PL8dyjd6dLzZm",
              name: "claim",
              decodedData: {
                claimBump: 254,
                index: "63105",
                amount: "1200000000",
                claimantSecret: "6bRaU5zgh4qm8FtcnENHovRayjEbCYofruEQHakB18Ch",
                proof: [
                  "abTllxgQ4C8exT2jy2FQZTnTrxDbWcSSnwbaRqxUlJQ=",
                  "+P5aF5nKGwzsP/619uUukgl3nbIe6ueVvhUephR4ETM=",
                  "wNZ2XXc0uAlAYtHvCx1pFQwVC8vLnZ/t66AC/VXBvzk=",
                  "xQBTbC+hFI8IwipXnfHz8ipWqP3MsdpBiyulArx+5Ew=",
                  "3S4pEZR43s0ibpYC/HQXsd2hXHN+sAv/lvis7EIUPek=",
                  "+znP0rpRYb8LjHlMejJjQ6twP4f/WMkfpjDUqyBjlSw=",
                  "D0T2uQImmTWXvW4atQeLM7HYT6rS/xqM/S5cpJrKMsg=",
                  "ZWa/t/T9uhKP6fmeKq7+pN7eKpnCjxB42BXmj9sbwCw=",
                  "1D1Ec1339AmIKv2N5w3cpZfJ3EpeLaMSTsY/8yjctC8=",
                  "ontQ9Srm0kHkbAT5Qa8ugyQnTRTYbkOEhmqS2K3c1A0=",
                  "ldKAd4Vm3/DoNFOnKVrvgmaGXjMRHClcVImxGlSezKs=",
                  "c+MYJ1yqlFkF5Kzd4yxOwFNxVv3EUlQxs6kobPr3A4U=",
                  "nPCJV1jGnSm+AVivCXAQW1vB1ybKx1s0okGaWFVNe9k=",
                  "Iv+NPd9sbQP6JbN10peZp0pAK0XRvK/YjsZmvVhS7jo=",
                  "HiDaPSv7ekdJ59Un4zFmvOyG5pG9gdAZKw5EL6wtjFQ=",
                  "/UxRC1dWdtjuJ7wDvQvBmwmbZiWMZdvFDqdHDQuf6/s=",
                  "UpdpM3KoFUSVR3IaGItVwMOzeeYiDOTx0eR9go+K+wA=",
                  "IDmLCyS0hJoe3LyP2iIQhAG47tDvRmrjrYCfRVARGCk=",
                  "hzyz3CyAJMVNkJT03egpPJMlrrqylZp0XrXPj7YFNcg=",
                ],
                distributor: "5fLKaqSeK9JzacWz4wPDyCx1Qet1Wmzziqwvx7d75bgw",
                claimStatus: "GFy54nV4omphWte96uCJEKskhytMKMWxpCLEMYyqRDU5",
                from: "HMJnQJUHtXpjyxyAxis7qVopTjRb7YLiLU4cV64bGBnE",
                to: "Ak1k6b5JSE2MS2tzvjXm66LwEpPC1VhNnvJY7dQhCNCJ",
                temporal: "6bRaU5zgh4qm8FtcnENHovRayjEbCYofruEQHakB18Ch",
                payer: "6bRaU5zgh4qm8FtcnENHovRayjEbCYofruEQHakB18Ch",
                systemProgram: "11111111111111111111111111111111",
                tokenProgram: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              },
              accountKeys: [
                "5fLKaqSeK9JzacWz4wPDyCx1Qet1Wmzziqwvx7d75bgw",
                "GFy54nV4omphWte96uCJEKskhytMKMWxpCLEMYyqRDU5",
                "HMJnQJUHtXpjyxyAxis7qVopTjRb7YLiLU4cV64bGBnE",
                "Ak1k6b5JSE2MS2tzvjXm66LwEpPC1VhNnvJY7dQhCNCJ",
                "6bRaU5zgh4qm8FtcnENHovRayjEbCYofruEQHakB18Ch",
                "6bRaU5zgh4qm8FtcnENHovRayjEbCYofruEQHakB18Ch",
                "11111111111111111111111111111111",
                "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              ],
            },
            flattenedInnerInstructions: [
              {
                programId: "11111111111111111111111111111111",
                encodedData: "9krTD9xcLhG33Ebh",
                name: "allocate",
                decodedData: {
                  discriminator: 8,
                  space: "57",
                  newAccount: "GFy54nV4omphWte96uCJEKskhytMKMWxpCLEMYyqRDU5",
                },
                accountKeys: ["GFy54nV4omphWte96uCJEKskhytMKMWxpCLEMYyqRDU5"],
              },
            ],
          },
        ],
      ],
    });
  });

  it("Decodes error messages", async () => {
    const res = await request(app)
      .post("/decode/errors")
      .send({
        errors: [
          {
            programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
            errorCode: "0x1771",

          },
          null,
          {
            programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
            errorCode: 0x1772,
          },
          {
            programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
            errorCode: "0x23",
          }],
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      decodedErrors: [
        {
          decodedData: "Slippage tolerance exceeded",
          errorCode: 6001,
          name: "SlippageToleranceExceeded",
          programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
        },
        null,
        {
          decodedData: "Invalid calculation",
          errorCode: 6002,
          name: "InvalidCalculation",
          programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
        },
        {
          errorCode: 35,
          programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
        },
      ],
    });
  });
});
