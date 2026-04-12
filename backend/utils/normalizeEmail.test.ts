import { describe, test, expect } from "vitest";
import { normalizeEmail } from "./normalizeEmail";

describe("normalizeEmail", () => {
  test("trims whitespace from start and end", () => {
    expect(normalizeEmail("  test@example.com  ")).toBe("test@example.com");
  });

  test("converts to lowercase", () => {
    expect(normalizeEmail("TeSt@ExAmPlE.CoM")).toBe("test@example.com");
  });

  test("trims and lowercases together", () => {
    expect(normalizeEmail("  TeSt@ExAmPlE.CoM  ")).toBe("test@example.com");
  });

  test("returns empty string as empty string", () => {
    expect(normalizeEmail("")).toBe("");
  });

  test("does not affect already normalized emails", () => {
    expect(normalizeEmail("hello@world.com")).toBe("hello@world.com");
  });
});
