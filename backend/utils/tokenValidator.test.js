import { describe, test, expect, vi, beforeEach } from "vitest";
import { tokenValidator } from "./tokenValidator";
import pool from "../db";

vi.mock("../db", () => ({
  default: {
    query: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("tokenValidator", () => {
  test("returns valid = true for valid token", async () => {
    pool.query.mockResolvedValue({
      rows: [
        {
          email: "test@example.com",
          questionnaire: "SMI",
          used: false,
          revoked: false,
          expires_at: new Date(Date.now() + 1000 * 60 * 60),
        },
      ],
    });

    const result = await tokenValidator("validtoken123");
    expect(result).toEqual({
      valid: true,
      email: "test@example.com",
      questionnaire: "SMI",
    });
  });

  test("returns valid = false if no token found", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const result = await tokenValidator("missingtoken");
    expect(result).toEqual({
      valid: false,
      message: "Token not found",
    });
  });

  test("returns valid = false if token is used", async () => {
    pool.query.mockResolvedValue({
      rows: [
        {
          email: "test@example.com",
          questionnaire: "SMI",
          used: true,
          revoked: false,
          expires_at: new Date(Date.now() + 1000),
        },
      ],
    });

    const result = await tokenValidator("usedtoken");
    expect(result).toEqual({
      valid: false,
      message: "Token has already been used",
    });
  });

  test("returns valid = false if token is revoked", async () => {
    pool.query.mockResolvedValue({
      rows: [
        {
          email: "test@example.com",
          questionnaire: "SMI",
          used: false,
          revoked: true,
          expires_at: new Date(Date.now() + 1000),
        },
      ],
    });

    const result = await tokenValidator("revokedtoken");
    expect(result).toEqual({
      valid: false,
      message: "Token access revoked",
    });
  });

  test("returns valid = false if token is expired", async () => {
    pool.query.mockResolvedValue({
      rows: [
        {
          email: "test@example.com",
          questionnaire: "SMI",
          used: false,
          revoked: false,
          expires_at: new Date(Date.now() - 1000),
        },
      ],
    });

    const result = await tokenValidator("expiredtoken");
    expect(result).toEqual({
      valid: false,
      message: "Token expired",
    });
  });

  test("returns valid = false on DB error", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));

    const result = await tokenValidator("dbfail");
    expect(result).toEqual({
      valid: false,
      message: "Internal server error",
    });
  });
});
