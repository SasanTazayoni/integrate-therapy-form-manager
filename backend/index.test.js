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

vi.mock("./utils/generateTokens");

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

let server;

beforeAll(() => {
  server = http.createServer(app);
  tokenUtils.generateTokens.mockResolvedValue([
    { questionnaire: "SMI", token: "fakeToken1" },
    { questionnaire: "YSQ", token: "fakeToken2" },
    { questionnaire: "BECKS", token: "fakeToken3" },
    { questionnaire: "BURNS", token: "fakeToken4" },
  ]);
  return new Promise((resolve) => server.listen(resolve));
});

afterAll(() => {
  return new Promise((resolve, reject) => {
    if (!server) return resolve();
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

describe("POST /api/dev/generate-tokens", () => {
  test("should generate 4 tokens for the given email", async () => {
    const email = "test@example.com";
    const res = await request(server)
      .post("/api/dev/generate-tokens")
      .send({ email })
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("email", email);
    expect(res.body).toHaveProperty("tokens");
    expect(Array.isArray(res.body.tokens)).toBe(true);
    expect(res.body.tokens.length).toBe(4);

    const questionnaires = ["SMI", "YSQ", "BECKS", "BURNS"];
    const tokenQuestionnaires = res.body.tokens.map((t) => t.questionnaire);

    questionnaires.forEach((q) => {
      expect(tokenQuestionnaires).toContain(q);
    });

    res.body.tokens.forEach((t) => {
      expect(typeof t.token).toBe("string");
      expect(t.token.length).toBeGreaterThan(0);
    });
  });
});

describe("POST /api/dev/generate-tokens error handling", () => {
  test("should return 400 if email is missing in request body", async () => {
    const res = await request(server)
      .post("/api/dev/generate-tokens")
      .send({}) // no email
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Email is required");
  });

  test("should return 500 if generateTokens throws an Error", async () => {
    tokenUtils.generateTokens.mockRejectedValueOnce(
      new Error("Token gen failed")
    );

    const res = await request(server)
      .post("/api/dev/generate-tokens")
      .send({ email: "fail@example.com" })
      .set("Accept", "application/json");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Failed to generate tokens");
    expect(res.body).toHaveProperty("details", "Token gen failed");
  });

  test("should return 500 if generateTokens throws a non-Error value", async () => {
    tokenUtils.generateTokens.mockRejectedValueOnce("Some string error");

    const res = await request(server)
      .post("/api/dev/generate-tokens")
      .send({ email: "fail2@example.com" })
      .set("Accept", "application/json");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Failed to generate tokens");
    expect(res.body).toHaveProperty("details", "Some string error");
  });
});
