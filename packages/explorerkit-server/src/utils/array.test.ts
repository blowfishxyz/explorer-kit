import { describe, expect, it } from "vitest";

import { chunkArray } from "@/utils/array";

describe("array utils", () => {
  it("should chunk an array", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const chunked = chunkArray(arr, 3);

    expect(chunked).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]);
  });

  it("should chunk an array with remainder", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const chunked = chunkArray(arr, 3);

    expect(chunked).toEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [10, 11],
    ]);
  });

  it("should chunk an empty array", () => {
    const chunked = chunkArray([], 3);

    expect(chunked).toEqual([]);
  });
});
