import { describe, test, expect } from "vitest";
import { formatDate } from "./formatDate";

describe("formatDate", () => {
  test("returns empty string if input is undefined", () => {
    expect(formatDate()).toBe("");
  });

  test("returns empty string for empty string input", () => {
    expect(formatDate("")).toBe("");
  });

  test("formats a valid ISO string correctly", () => {
    const iso = "2025-08-31T12:00:00Z";
    const result = formatDate(iso);
    const expected = new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    expect(result).toBe(expected);
  });

  test("handles invalid date string gracefully", () => {
    expect(formatDate("invalid-date")).toBe("Invalid Date");
  });

  test("formats a date far in the past", () => {
    const iso = "1900-03-15T00:00:00Z";
    const expected = new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    expect(formatDate(iso)).toBe(expected);
  });

  test("formats a date far in the future", () => {
    const iso = "2099-12-31T00:00:00Z";
    const expected = new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    expect(formatDate(iso)).toBe(expected);
  });
});
