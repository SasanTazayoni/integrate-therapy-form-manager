import { describe, test, expect, vi } from "vitest";
import { generateToken, computeExpiry, TOKEN_TTL_DAYS } from "./tokens";

describe("tokenUtils", () => {
  test("generateToken returns a valid UUID v4", () => {
    const token = generateToken();

    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    expect(token).toMatch(uuidV4Regex);
  });

  test("computeExpiry adds TOKEN_TTL_DAYS by default", () => {
    const now = new Date("2023-01-01T00:00:00Z");

    const expiry = computeExpiry(now);
    const expected = new Date(
      now.getTime() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
    );

    expect(expiry.toISOString()).toBe(expected.toISOString());
  });

  test("computeExpiry allows overriding days", () => {
    const now = new Date("2023-01-01T00:00:00Z");

    const expiry = computeExpiry(now, 7);
    const expected = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    expect(expiry.toISOString()).toBe(expected.toISOString());
  });

  test("computeExpiry uses current date when now not provided", () => {
    const before = Date.now();
    const expiry = computeExpiry();
    const after = Date.now();

    const expectedMin = before + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
    const expectedMax = after + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

    expect(expiry.getTime()).toBeGreaterThanOrEqual(expectedMin);
    expect(expiry.getTime()).toBeLessThanOrEqual(expectedMax);
  });
});
