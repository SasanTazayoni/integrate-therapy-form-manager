import { describe, test, expect, vi } from "vitest";
import { parseAndCombineScore } from "./scoreUtils";

describe("parseAndCombineScore", () => {
  const mockCategoryFn = vi.fn((score) => {
    if (score < 5) return "low";
    if (score < 10) return "medium";
    return "high";
  });

  test("parses a valid integer string and returns combined score-category", () => {
    const result = parseAndCombineScore("7", mockCategoryFn);
    expect(result).toBe("7-medium");
    expect(mockCategoryFn).toHaveBeenCalledWith(7);
  });

  test("parses a string with number and ignores non-numeric parts", () => {
    const result = parseAndCombineScore("12abc", mockCategoryFn);
    expect(result).toBe("12-high");
    expect(mockCategoryFn).toHaveBeenCalledWith(12);
  });

  test("returns 0 for non-numeric strings", () => {
    const result = parseAndCombineScore("abc", mockCategoryFn);
    expect(result).toBe("0-low");
    expect(mockCategoryFn).toHaveBeenCalledWith(0);
  });

  test("returns 0 for empty string", () => {
    const result = parseAndCombineScore("", mockCategoryFn);
    expect(result).toBe("0-low");
    expect(mockCategoryFn).toHaveBeenCalledWith(0);
  });

  test("handles negative numbers correctly", () => {
    const result = parseAndCombineScore("-3", mockCategoryFn);
    expect(result).toBe("-3-low");
    expect(mockCategoryFn).toHaveBeenCalledWith(-3);
  });

  test("handles zero correctly", () => {
    const result = parseAndCombineScore("0", mockCategoryFn);
    expect(result).toBe("0-low");
    expect(mockCategoryFn).toHaveBeenCalledWith(0);
  });
});
