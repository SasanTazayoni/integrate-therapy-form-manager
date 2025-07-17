import request from "supertest";
import {
  describe,
  test,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from "vitest";
import http from "http";
import pool from "./db";
import app from "./index";
import * as tokenUtils from "./utils/generateTokens";
import * as emailUtils from "./utils/email";

vi.mock("./utils/generateTokens");
vi.mock("./utils/email");
vi.mock("./db", () => {
  return {
    default: {
      query: vi.fn(),
    },
  };
});

import pool from "./db";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /", () => {
  test("should respond with current database time", async () => {
    pool.query.mockResolvedValue({
      rows: [{ now: "2025-07-16T00:00:00Z" }],
    });

    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/^Database time:/);
  });
});

describe("GET / error handling", () => {
  test("should return 500 when database query fails", async () => {
    pool.query.mockRejectedValue(new Error("DB failure"));

    const res = await request(app).get("/");
    expect(res.statusCode).toBe(500);
    expect(res.text).toBe("Internal Server Error");
  });
});

describe("POST /api/dev/generate-tokens", () => {
  test("should return 400 if email is missing", async () => {
    const res = await request(app).post("/api/dev/generate-tokens").send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Email is required");
  });

  test("should send magic links successfully", async () => {
    const mockTokens = [
      { questionnaire: "PHQ9", token: "abc123" },
      { questionnaire: "GAD7", token: "xyz456" },
    ];

    tokenUtils.generateTokens.mockResolvedValue(mockTokens);
    emailUtils.sendMagicLinksEmail.mockResolvedValue();

    const res = await request(app)
      .post("/api/dev/generate-tokens")
      .send({ email: "test@example.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("test@example.com");
    expect(res.body.magicLinks).toHaveLength(2);
    expect(emailUtils.sendMagicLinksEmail).toHaveBeenCalledWith(
      "test@example.com",
      expect.any(Array)
    );
  });

  test("should handle token generation failure", async () => {
    tokenUtils.generateTokens.mockRejectedValue({
      type: "TokenGenerationError",
      message: "Failed to create tokens",
    });

    const res = await request(app)
      .post("/api/dev/generate-tokens")
      .send({ email: "fail@example.com" });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Failed to generate tokens");
  });

  test("should handle magic link email failure", async () => {
    tokenUtils.generateTokens.mockResolvedValue([
      { questionnaire: "PHQ9", token: "abc123" },
    ]);

    emailUtils.sendMagicLinksEmail.mockRejectedValue({
      type: "MagicLinkSendingError",
      message: "Email failed",
    });

    const res = await request(app)
      .post("/api/dev/generate-tokens")
      .send({ email: "fail2@example.com" });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Failed to send magic links");
  });

  test("should handle unknown/untyped error", async () => {
    tokenUtils.generateTokens.mockImplementation(() => {
      throw new Error("Something totally unexpected");
    });

    const res = await request(app)
      .post("/api/dev/generate-tokens")
      .send({ email: "weird@example.com" });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Unknown error");
    expect(res.body.details).toMatch(/Something totally unexpected/);
  });
});

describe("POST /api/send-pack", () => {
  test("should return 400 if email is missing", async () => {
    const res = await request(app).post("/api/send-pack").send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Email is required");
  });

  test("should use fallback URL when CLIENT_BASE_URL is undefined", async () => {
    const originalBaseUrl = process.env.CLIENT_BASE_URL;
    delete process.env.CLIENT_BASE_URL;

    tokenUtils.generateTokens.mockResolvedValue([
      { questionnaire: "PHQ9", token: "abc123" },
    ]);

    emailUtils.sendMagicLinksEmail.mockResolvedValue(undefined);

    const res = await request(app)
      .post("/api/send-pack")
      .send({ email: "fallback@test.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body.magicLinks[0].url).toBe(
      "http://localhost:3000/phq9?token=abc123"
    );

    process.env.CLIENT_BASE_URL = originalBaseUrl;
  });

  test("should send magic links via send-pack", async () => {
    const mockTokens = [
      { questionnaire: "PHQ9", token: "abc123" },
      { questionnaire: "GAD7", token: "xyz456" },
    ];

    tokenUtils.generateTokens.mockResolvedValue(mockTokens);
    emailUtils.sendMagicLinksEmail.mockResolvedValue();

    const res = await request(app)
      .post("/api/send-pack")
      .send({ email: "client@example.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body.magicLinks).toHaveLength(2);
    expect(emailUtils.sendMagicLinksEmail).toHaveBeenCalled();
  });
});
