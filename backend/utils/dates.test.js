import { describe, test, expect } from "vitest";
import { parseDateStrict } from "./dates";

describe("parseDateStrict", () => {
  test("returns Date object if input is a valid Date", () => {
    const date = new Date("2025-08-24T12:00:00Z");
    const result = parseDateStrict(date);
    expect(result).toBeInstanceOf(Date);
    expect(result?.getTime()).toBe(date.getTime());
  });

  test("parses a valid date string correctly", () => {
    const dateStr = "2025-08-24T12:00:00Z";
    const result = parseDateStrict(dateStr);
    expect(result).toBeInstanceOf(Date);
    expect(result?.getTime()).toBe(new Date(dateStr).getTime());
  });

  test("returns null for invalid date string", () => {
    expect(parseDateStrict("not-a-date")).toBeNull();
  });

  test("returns null for invalid Date object", () => {
    expect(parseDateStrict(new Date("invalid"))).toBeNull();
  });

  test("handles empty string input", () => {
    expect(parseDateStrict("")).toBeNull();
  });
});
