import { describe, expect, it } from "vitest";

import { isValidBase58, isValidBase64 } from "./validation";

describe("validation", () => {
  describe("isValidBase58", () => {
    it("should return true for a valid base58 string", () => {
      expect(isValidBase58("2n9X1oUzPc1t")).true;
    });

    it("should return false for an invalid base58 string", () => {
      expect(isValidBase58("2n9X1oUzPc1t!")).false;
    });
  });

  describe("isValidBase64", () => {
    it("should return true for a valid base64 string", () => {
      expect(isValidBase64(Buffer.from("hello").toString("base64"))).true;
    });

    it("should return false for an invalid base64 string", () => {
      expect(isValidBase64("hello")).false;
    });
  });
});
