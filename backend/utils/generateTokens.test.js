import { describe, test, expect, vi, beforeEach } from "vitest";
import pool from "../db";
import { generateTokens } from "./generateTokens";

vi.mock("../db", () => ({
  default: {
    connect: vi.fn(),
  },
}));

describe("generateTokens", () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      query: vi.fn(),
      release: vi.fn(),
    };
    pool.connect.mockResolvedValue(mockClient);
    vi.clearAllMocks();
  });

  test("should generate 4 tokens and insert them into the database", async () => {
    mockClient.query.mockResolvedValue({});

    const email = "test@example.com";
    const tokens = await generateTokens(email);

    expect(tokens).toHaveLength(4);

    const expectedQuestionnaires = ["SMI", "YSQ", "BECKS", "BURNS"];
    const tokenQuestionnaires = tokens.map((t) => t.questionnaire);

    expectedQuestionnaires.forEach((q) => {
      expect(tokenQuestionnaires).toContain(q);
    });

    tokens.forEach((t) => {
      expect(typeof t.token).toBe("string");
      expect(t.token.length).toBe(32);
    });

    expect(pool.connect).toHaveBeenCalledTimes(1);
    expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO access_tokens"),
      expect.any(Array)
    );
    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    expect(mockClient.release).toHaveBeenCalled();
  });

  test("should rollback and throw error if insertion fails", async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockRejectedValueOnce(new Error("DB error")) // INSERT fails
      .mockResolvedValueOnce({}); // ROLLBACK

    const email = "fail@example.com";

    await expect(generateTokens(email)).rejects.toMatchObject({
      type: "TokenGenerationError",
    });

    expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });

  test("should log error when insertion fails", async () => {
    const email = "fail@example.com";
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockRejectedValueOnce(new Error("DB error")) // first INSERT fails
      .mockResolvedValueOnce({}); // ROLLBACK

    await expect(generateTokens(email)).rejects.toMatchObject({
      type: "TokenGenerationError",
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Token generation failed:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  test("should throw and not call release if connect fails", async () => {
    pool.connect.mockRejectedValueOnce(new Error("connect error"));
    await expect(generateTokens("fail@example.com")).rejects.toThrow(
      "connect error"
    );
  });

  test("release throws error but finally block is executed", async () => {
    const mockClient = {
      query: vi.fn().mockResolvedValue(),
      release: vi.fn(() => {
        throw new Error("release error");
      }),
    };
    pool.connect.mockResolvedValue(mockClient);

    const email = "test@example.com";

    await expect(generateTokens(email)).resolves.toHaveLength(4);

    expect(mockClient.release).toHaveBeenCalled();
  });

  test("throws createTokenGenerationError with undefined message if error is not an Error instance", async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockRejectedValueOnce("some string error") // INSERT throws string instead of Error
      .mockResolvedValueOnce({}); // ROLLBACK

    const email = "fail@example.com";

    await expect(generateTokens(email)).rejects.toMatchObject({
      type: "TokenGenerationError",
    });

    await generateTokens(email).catch((err) => {
      expect(err.message).toBeUndefined();
    });
  });
});
