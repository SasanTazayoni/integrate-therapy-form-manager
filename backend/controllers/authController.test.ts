import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response } from "express";
import { loginHandler, _resetRateLimitForTesting } from "./authController";

vi.mock("../utils/requiredEnv", () => ({
  getEnvVar: vi.fn((key: string) => {
    if (key === "THERAPIST_USERNAME") return "admin";
    if (key === "THERAPIST_PASSWORD") return "secret";
    if (key === "JWT_SECRET") return "test-secret";
  }),
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(() => "mocked.jwt.token"),
  },
}));

type MockResponse = {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

const mockRes = (): MockResponse => {
  const res = {} as MockResponse;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("loginHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetRateLimitForTesting();
  });

  test("returns 200 with a token for correct credentials", () => {
    const req = { body: { username: "admin", password: "secret" } } as unknown as Request;
    const res = mockRes();

    loginHandler(req, res as unknown as Response);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ token: "mocked.jwt.token" });
  });

  test("returns 401 for wrong username", () => {
    const req = { body: { username: "wrong", password: "secret" } } as unknown as Request;
    const res = mockRes();

    loginHandler(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
  });

  test("returns 401 for wrong password", () => {
    const req = { body: { username: "admin", password: "wrong" } } as unknown as Request;
    const res = mockRes();

    loginHandler(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
  });

  test("returns 401 for empty body", () => {
    const req = { body: {} } as unknown as Request;
    const res = mockRes();

    loginHandler(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
  });

  test("returns 401 for both fields wrong", () => {
    const req = { body: { username: "bad", password: "bad" } } as unknown as Request;
    const res = mockRes();

    loginHandler(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
  });
});

describe("loginHandler — rate limiting", () => {
  const badReq = (ip: string) =>
    ({ ip, body: { username: "wrong", password: "wrong" } } as unknown as Request);
  const goodReq = (ip: string) =>
    ({ ip, body: { username: "admin", password: "secret" } } as unknown as Request);

  beforeEach(() => {
    vi.clearAllMocks();
    _resetRateLimitForTesting();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("returns 429 with retryAfter after 5 failed attempts", () => {
    const ip = "1.2.3.4";
    for (let i = 0; i < 5; i++) {
      loginHandler(badReq(ip), mockRes() as unknown as Response);
    }
    const res = mockRes();
    loginHandler(badReq(ip), res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(429);
    const body = (res.json.mock.calls[0] as [{ error: string; retryAfter: number }])[0];
    expect(body.error).toBe("Too many incorrect attempts");
    expect(body.retryAfter).toBeGreaterThan(0);
    expect(body.retryAfter).toBeLessThanOrEqual(60);
  });

  test("locked IP stays locked until duration elapses", () => {
    vi.useFakeTimers();
    const ip = "2.3.4.5";
    for (let i = 0; i < 5; i++) {
      loginHandler(badReq(ip), mockRes() as unknown as Response);
    }

    vi.advanceTimersByTime(59_000);
    const midRes = mockRes();
    loginHandler(badReq(ip), midRes as unknown as Response);
    expect(midRes.status).toHaveBeenCalledWith(429);

    vi.advanceTimersByTime(2_000);
    const afterRes = mockRes();
    loginHandler(badReq(ip), afterRes as unknown as Response);
    expect(afterRes.status).toHaveBeenCalledWith(401);
  });

  test("successful login clears the failed attempt counter", () => {
    const ip = "3.4.5.6";
    for (let i = 0; i < 4; i++) {
      loginHandler(badReq(ip), mockRes() as unknown as Response);
    }
    loginHandler(goodReq(ip), mockRes() as unknown as Response);

    for (let i = 0; i < 4; i++) {
      loginHandler(badReq(ip), mockRes() as unknown as Response);
    }
    const res = mockRes();
    loginHandler(badReq(ip), res as unknown as Response);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("different IPs are tracked independently", () => {
    const ipA = "10.0.0.1";
    const ipB = "10.0.0.2";
    for (let i = 0; i < 5; i++) {
      loginHandler(badReq(ipA), mockRes() as unknown as Response);
    }

    const res = mockRes();
    loginHandler(badReq(ipB), res as unknown as Response);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
