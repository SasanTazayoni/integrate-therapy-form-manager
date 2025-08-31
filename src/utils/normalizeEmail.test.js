import { describe, test, expect } from "vitest";
import normalizeEmail from "../utils/normalizeEmail";

describe("normalizeEmail", () => {
  test("trims whitespace from start and end", () => {
    expect(normalizeEmail("  test@example.com  ")).toBe("test@example.com");
  });

  test("converts uppercase letters to lowercase", () => {
    expect(normalizeEmail("TeSt@Example.COM")).toBe("test@example.com");
  });

  test("trims and lowercases at the same time", () => {
    expect(normalizeEmail("  TeSt@Example.COM  ")).toBe("test@example.com");
  });

  test("returns empty string if input is empty", () => {
    expect(normalizeEmail("")).toBe("");
  });

  test("does nothing if already normalized", () => {
    expect(normalizeEmail("already@normalized.com")).toBe(
      "already@normalized.com"
    );
  });
});
