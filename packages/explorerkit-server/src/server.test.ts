import { describe, expect, it, vi } from "vitest";

import { app } from "@/server";

vi.mock("@/core/shared-dependencies", (loadActual) => {
  class MultiCacheMock {
    private data: Record<string, string> = {};

    async get(key: string) {
      return this.data[key] || null;
    }

    async multiGet(keys: string[]) {
      return keys.map((key) => this.data[key] || null);
    }

    async set(key: string, value: string) {
      this.data[key] = value;
    }
  }

  const deps = {
    cache: new MultiCacheMock(),
  };

  return {
    ...loadActual(),
    initSharedDependencies: () => {},
    getSharedDep: (name: keyof typeof deps) => deps[name],
    getSharedDeps: () => deps,
  };
});

describe("Server API Tests", () => {
  it("Decodes accounts correctly", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/decode/accounts",
      payload: {
        accounts: [
          {
            ownerProgram: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            data: "/NFB6YMsrxCtkXSVyg8nG1spPNRwJ+pzcAftQOs5oL0mA+FEPRpnATHIUtp5LuY9RJEScraeiSf6ghxvpIcl2eGPjQUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          },
        ],
      },
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toMatchObject({
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

  it("decodes bid account properly", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/decode/accounts",
      payload: {
        accounts: [
          {
            ownerProgram: "mmm3XBJg5gk8XJxEKBvdgptZz6SgK4tXvn36sodowMc",
            data: "8ZptBBGxbbzgRKMAAAAAAAEAAAAAAAAAAAAAyAEKaAAAAAAAAHFCN/cMRn4LOnoO/r6kmKE061M8JsnXBHFy4ZNXQ/JfAAAQJ0zufPV2spaZ95NZ+dckOKecm1kc7wAwcpVP12ZpS/smAAAAAAAAAAAAAAAAAAAAAJFdxOK7UMF2mQdngDZMZeGqdi8416DWf7XEa6aQITPNBX82VZkozhurrbZbi12eMbon+FOb7GAsyxrcKvufRnBJmSpZ2osBx1xOP/NUUp8gWwa5+/CBmpQfr4c65YPZyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUzufPV2spaZ95NZ+dckOKecm1kc7wAwcpVP12ZpS/smAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ESjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          },
        ],
      },
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({
      decodedAccounts: [
        {
          decodedData: {
            owner: "mmm3XBJg5gk8XJxEKBvdgptZz6SgK4tXvn36sodowMc",
            name: "Pool",
            data: {
              spotPrice: "10700000",
              curveType: 1,
              curveDelta: "0",
              reinvestFulfillBuy: false,
              reinvestFulfillSell: false,
              expiry: "1745486280",
              lpFeeBp: 0,
              referral: "8d7dmXFxP9YKubdfo3JeFYUYfC1C65HHtw9tAGsg934z",
              referralBp: 0,
              buysideCreatorRoyaltyBp: 10000,
              cosignerAnnotation: "TO589Xaylpn3k1n51yQ4p5ybWRzvADBylU/XZmlL+yY=",
              sellsideAssetAmount: "0",
              lpFeeEarned: "0",
              owner: "AnT3fqrEPSH1poYFNXVvcjoSVgttn2HwURUZoWM8FJv8",
              cosigner: "NTYeYJ1wr4bpM5xo6zx5En44SvJFAd35zTxxNoERYqd",
              uuid: "5xJDtZGdD7ZbpcBWr2SeUnPKTEVfPqy35oLYXvCzzZ43",
              paymentMint: "11111111111111111111111111111111",
              allowlists: [
                {
                  kind: 1,
                  value: "6BJuVsENAMUEvR9ftviSVb5JokS12pF3FF2EnExdc2UD",
                },
                {
                  kind: 0,
                  value: "11111111111111111111111111111111",
                },
                {
                  kind: 0,
                  value: "11111111111111111111111111111111",
                },
                {
                  kind: 0,
                  value: "11111111111111111111111111111111",
                },
                {
                  kind: 0,
                  value: "11111111111111111111111111111111",
                },
                {
                  kind: 0,
                  value: "11111111111111111111111111111111",
                },
              ],
              buysidePaymentAmount: "10700000",
              sharedEscrowAccount: "11111111111111111111111111111111",
              sharedEscrowCount: "0",
            },
          },
        },
      ],
    });
  });

  it("Decodes instructions correctly", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/decode/instructions",
      payload: {
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
      },
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toMatchObject({
      decodedTransactions: [
        [
          {
            topLevelInstruction: {
              programId: "ComputeBudget111111111111111111111111111111",
              encodedData: "G7pdkT",
              name: "setComputeUnitLimit",
              decodedData: { discriminator: 2, computeUnitLimit: 224847 },
              accountKeys: [],
            },
            flattenedInnerInstructions: [],
          },
          {
            topLevelInstruction: {
              programId: "ComputeBudget111111111111111111111111111111",
              encodedData: "3ta97iYzVb3u",
              name: "setComputeUnitPrice",
              decodedData: { discriminator: 3, computeUnitPrice: 317673 },
              accountKeys: [],
            },
            flattenedInnerInstructions: [],
          },
          {
            topLevelInstruction: {
              programId: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
              encodedData: "2",
              name: "createIdempotent",
              decodedData: {
                discriminator: 1,
                fundingAddress: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                associatedAccountAddress: "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                walletAddress: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                tokenMintAddress: "So11111111111111111111111111111111111111112",
                systemProgram: "11111111111111111111111111111111",
                tokenProgram: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              },
              accountKeys: [
                "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                "So11111111111111111111111111111111111111112",
                "11111111111111111111111111111111",
                "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              ],
            },
            flattenedInnerInstructions: [
              {
                programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                encodedData: "84eT",
                name: "getAccountDataSize",
                decodedData: { discriminator: 21, mint: "So11111111111111111111111111111111111111112" },
                accountKeys: ["So11111111111111111111111111111111111111112"],
              },
              {
                programId: "11111111111111111111111111111111",
                encodedData: "11119os1e9qSs2u7TsThXqkBSRVFxhmYaFKFZ1waB2X7armDmvK3p5GmLdUxYdg3h7QSrL",
                name: "createAccount",
                decodedData: {
                  discriminator: 0,
                  lamports: "2039280",
                  space: "165",
                  owner: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                  fundingAccount: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                  newAccount: "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                },
                accountKeys: [
                  "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                  "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                ],
              },
              {
                programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                encodedData: "P",
                name: "initializeImmutableOwner",
                decodedData: { discriminator: 22, initializeAccount: "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae" },
                accountKeys: ["EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae"],
              },
              {
                programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                encodedData: "6TVvVvH1pYTAyPUVAWuGot6sWWw8MZzkRpJ9Pu6RZyYT1",
                name: "initializeAccount3",
                decodedData: {
                  discriminator: 18,
                  owner: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                  initializeAccount: "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                  associatedMint: "So11111111111111111111111111111111111111112",
                },
                accountKeys: [
                  "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                  "So11111111111111111111111111111111111111112",
                ],
              },
            ],
          },
          {
            topLevelInstruction: {
              programId: "11111111111111111111111111111111",
              encodedData: "3Bxs3zzLZLuLQEYX",
              name: "transfer",
              decodedData: {
                discriminator: 2,
                lamports: "1000000000",
                source: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                destination: "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
              },
              accountKeys: [
                "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
              ],
            },
            flattenedInnerInstructions: [],
          },
          {
            topLevelInstruction: {
              programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              encodedData: "J",
              name: "syncNative",
              decodedData: { discriminator: 17, nativeTokenAccount: "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae" },
              accountKeys: ["EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae"],
            },
            flattenedInnerInstructions: [],
          },
          {
            topLevelInstruction: {
              programId: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
              encodedData: "2",
              name: "createIdempotent",
              decodedData: {
                discriminator: 1,
                fundingAddress: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                associatedAccountAddress: "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                walletAddress: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                tokenMintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                systemProgram: "11111111111111111111111111111111",
                tokenProgram: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              },
              accountKeys: [
                "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                "11111111111111111111111111111111",
                "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              ],
            },
            flattenedInnerInstructions: [
              {
                programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                encodedData: "84eT",
                name: "getAccountDataSize",
                decodedData: { discriminator: 21, mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" },
                accountKeys: ["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"],
              },
              {
                programId: "11111111111111111111111111111111",
                encodedData: "11119os1e9qSs2u7TsThXqkBSRVFxhmYaFKFZ1waB2X7armDmvK3p5GmLdUxYdg3h7QSrL",
                name: "createAccount",
                decodedData: {
                  discriminator: 0,
                  lamports: "2039280",
                  space: "165",
                  owner: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                  fundingAccount: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                  newAccount: "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                },
                accountKeys: [
                  "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                  "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                ],
              },
              {
                programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                encodedData: "P",
                name: "initializeImmutableOwner",
                decodedData: { discriminator: 22, initializeAccount: "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH" },
                accountKeys: ["GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH"],
              },
              {
                programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                encodedData: "6TVvVvH1pYTAyPUVAWuGot6sWWw8MZzkRpJ9Pu6RZyYT1",
                name: "initializeAccount3",
                decodedData: {
                  discriminator: 18,
                  owner: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                  initializeAccount: "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                  associatedMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                },
                accountKeys: [
                  "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                ],
              },
            ],
          },
          {
            topLevelInstruction: {
              programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
              encodedData: "PrpFmsY4d26dKbdKMY6XTWGbxStW9GLfTwK7MEYLnMZJoCb1",
              name: "route",
              decodedData: {
                route_plan: [{ swap: { LifinityV2: {} }, percent: 100, input_index: 0, output_index: 1 }],
                in_amount: "1000000000",
                quoted_out_amount: "129746609",
                slippage_bps: 50,
                platform_fee_bps: 0,
                token_program: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                user_transfer_authority: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                user_source_token_account: "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                user_destination_token_account: "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                destination_token_account: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
                destination_mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                platform_fee_account: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
                event_authority: "D8cy77BBepLMngZx6ZukaTff5hCt1HrWyKk3Hnd9oitf",
                program: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
                Unknown: "7oo7u7iXrNCekxWWpfLYCbXyjrYLAco5FM9qSjQeNn7g",
              },
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
            },
            flattenedInnerInstructions: [
              {
                programId: "2wT8Yq49kHgDzXuPxZSaeLaH1qbmGXtEyPy64bL7aD3c",
                encodedData: "PgQWtn8oziwptKbHC8eyBMEh75L46cD9R",
                name: "swap",
                decodedData: {
                  amountIn: "1000000000",
                  minimumAmountOut: "0",
                  authority: "7GmDCbu7bYiWJvFaNUyPNiM8PjvvBcmyBcZY1qSsAGi2",
                  amm: "DrRd8gYMJu9XGxLhwTCPdHNLXCKHsxJtMpbn62YqmwQe",
                  userTransferAuthority: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                  sourceInfo: "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                  destinationInfo: "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                  swapSource: "EVGW4q1iFjDmtxtHr3NoPi5iVKAxwEjohsusMrinDxr6",
                  swapDestination: "53EkU98Vbv2TQPwGG6t2asCynzFjCX5AnvaabbXafaed",
                  poolMint: "FGYgFJSxZTGzaLwzUL9YZqK2yUZ8seofCwGq8BPEw4o8",
                  feeAccount: "FwWV8a193zZsYxaRAbYkrM6tmrHMoVY1Xahh2PNFejvF",
                  tokenProgram: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                  oracleMainAccount: "856QrABEMYwVXStv5G1KkUtKuF3nUDPpVwFY2nc2NwXd",
                  oracleSubAccount: "H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG",
                  oraclePcAccount: "7oo7u7iXrNCekxWWpfLYCbXyjrYLAco5FM9qSjQeNn7g",
                },
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
              },
              {
                programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                encodedData: "3DbEuZHcyqBD",
                name: "transfer",
                decodedData: {
                  discriminator: 3,
                  amount: "1000000000",
                  source: "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                  destination: "EVGW4q1iFjDmtxtHr3NoPi5iVKAxwEjohsusMrinDxr6",
                  authority: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                },
                accountKeys: [
                  "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                  "EVGW4q1iFjDmtxtHr3NoPi5iVKAxwEjohsusMrinDxr6",
                  "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                ],
              },
              {
                programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                encodedData: "6iJigqBUeUcF",
                name: "mintTo",
                decodedData: {
                  discriminator: 7,
                  amount: "245692",
                  mint: "FGYgFJSxZTGzaLwzUL9YZqK2yUZ8seofCwGq8BPEw4o8",
                  mintTo: "FwWV8a193zZsYxaRAbYkrM6tmrHMoVY1Xahh2PNFejvF",
                  mintAuthority: "7GmDCbu7bYiWJvFaNUyPNiM8PjvvBcmyBcZY1qSsAGi2",
                },
                accountKeys: [
                  "FGYgFJSxZTGzaLwzUL9YZqK2yUZ8seofCwGq8BPEw4o8",
                  "FwWV8a193zZsYxaRAbYkrM6tmrHMoVY1Xahh2PNFejvF",
                  "7GmDCbu7bYiWJvFaNUyPNiM8PjvvBcmyBcZY1qSsAGi2",
                ],
              },
              {
                programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                encodedData: "3w5WV196TcpF",
                name: "transfer",
                decodedData: {
                  discriminator: 3,
                  amount: "135058680",
                  source: "53EkU98Vbv2TQPwGG6t2asCynzFjCX5AnvaabbXafaed",
                  destination: "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                  authority: "7GmDCbu7bYiWJvFaNUyPNiM8PjvvBcmyBcZY1qSsAGi2",
                },
                accountKeys: [
                  "53EkU98Vbv2TQPwGG6t2asCynzFjCX5AnvaabbXafaed",
                  "GAC19PLL5BP7GxutFjaxKpwNLp2FPcdAc6J1VKfNYUYH",
                  "7GmDCbu7bYiWJvFaNUyPNiM8PjvvBcmyBcZY1qSsAGi2",
                ],
              },
              {
                programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
                encodedData:
                  "QMqFu4fYGGeUEysFnenhAvGHnSPFLovkZXi46MfLjsSzqJhm6XkVGqWpaXx8STNjEgoafNsZcrmDQKhSHUushBvvEwmFp69UewGqbW1sofQNSqKEUdGJbzFaqosQg3PZ2iuLpqr1ZzESM9QK6RSi5HrSakDckdoMr8eeNo6GNBTidyy",
                name: "Anchor Self-CPI Log",
                decodedData: {
                  logAuthority: { data: "D8cy77BBepLMngZx6ZukaTff5hCt1HrWyKk3Hnd9oitf", type: "publicKey" },
                },
                accountKeys: ["D8cy77BBepLMngZx6ZukaTff5hCt1HrWyKk3Hnd9oitf"],
              },
            ],
          },
          {
            topLevelInstruction: {
              programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              encodedData: "A",
              name: "closeAccount",
              decodedData: {
                discriminator: 9,
                closeAccount: "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                destination: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                owner: "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
              },
              accountKeys: [
                "EgpY6FoUWnJRV6418wm1ziG55VvrZRSugH4aZ568Ptae",
                "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
                "7NDpz5V2Fbu97zPeRk5UQ8S823YYAFUj7NyYQWjkgQ23",
              ],
            },
            flattenedInnerInstructions: [],
          },
        ],
      ],
    });
  });

  it("Decodes instructions and replaces u8 arrays with the base64 encoded version", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/decode/instructions",
      payload: {
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
      },
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toMatchObject({
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
    const res = await app.inject({
      method: "POST",
      url: "/decode/errors",
      payload: {
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
          },
        ],
      },
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toMatchObject({
      decodedErrors: [
        {
          decodedMessage: "Slippage tolerance exceeded",
          errorCode: 6001,
          kind: "SlippageToleranceExceeded",
          programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
        },
        null,
        {
          decodedMessage: "Invalid calculation",
          errorCode: 6002,
          kind: "InvalidCalculation",
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
