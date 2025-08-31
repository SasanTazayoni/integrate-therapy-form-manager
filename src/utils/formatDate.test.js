import { describe, test, expect } from "vitest";
import { formatDate } from "./formatDate";

describe("formatDate", () => {
  test("returns empty string if input is undefined", () => {
    expect(formatDate()).toBe("");
  });

  test("formats a valid ISO string correctly", () => {
    const iso = "2025-08-31T12:00:00Z";
    const result = formatDate(iso);
    const date = new Date(iso);
    const expected = date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    expect(result).toBe(expected);
  });

  test("handles invalid date string gracefully", () => {
    const result = formatDate("invalid-date");
    expect(result).toBe("Invalid Date");
  });
});
