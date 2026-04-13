import { describe, test, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import { loginHandler } from "./authController";

vi.mock("../utils/requiredEnv", () => ({
  getEnvVar: vi.fn((key: string) => {
    if (key === "THERAPIST_USERNAME") return "admin";
    if (key === "THERAPIST_PASSWORD") return "secret";
  }),
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
  });

  test("returns 200 with ok: true for correct credentials", () => {
    const req = { body: { username: "admin", password: "secret" } } as unknown as Request;
    const res = mockRes();

    loginHandler(req, res as unknown as Response);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ ok: true });
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
