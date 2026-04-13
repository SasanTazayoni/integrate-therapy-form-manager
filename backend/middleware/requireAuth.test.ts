import { describe, test, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { requireAuth } from "./requireAuth";

vi.mock("../utils/requiredEnv", () => ({
  getEnvVar: vi.fn(() => "test-secret"),
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

import jwt from "jsonwebtoken";

const mockRes = () => {
  const res = {} as Response;
  (res as unknown as { status: ReturnType<typeof vi.fn> }).status = vi.fn().mockReturnValue(res);
  (res as unknown as { json: ReturnType<typeof vi.fn> }).json = vi.fn().mockReturnValue(res);
  return res;
};

describe("requireAuth", () => {
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    next = vi.fn() as unknown as NextFunction;
  });

  test("calls next() when a valid Bearer token is provided", () => {
    vi.mocked(jwt.verify).mockReturnValueOnce({} as never);
    const req = {
      headers: { authorization: "Bearer valid.token.here" },
    } as unknown as Request;
    const res = mockRes();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect((res as unknown as { status: ReturnType<typeof vi.fn> }).status).not.toHaveBeenCalled();
  });

  test("returns 401 when no Authorization header is present", () => {
    const req = { headers: {} } as unknown as Request;
    const res = mockRes();

    requireAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect((res as unknown as { status: ReturnType<typeof vi.fn> }).status).toHaveBeenCalledWith(401);
    expect((res as unknown as { json: ReturnType<typeof vi.fn> }).json).toHaveBeenCalledWith({ error: "Unauthorised" });
  });

  test("returns 401 when Authorization header does not start with Bearer", () => {
    const req = {
      headers: { authorization: "Basic dXNlcjpwYXNz" },
    } as unknown as Request;
    const res = mockRes();

    requireAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect((res as unknown as { status: ReturnType<typeof vi.fn> }).status).toHaveBeenCalledWith(401);
  });

  test("returns 401 when jwt.verify throws (expired/invalid token)", () => {
    vi.mocked(jwt.verify).mockImplementationOnce(() => {
      throw new Error("jwt expired");
    });
    const req = {
      headers: { authorization: "Bearer expired.token" },
    } as unknown as Request;
    const res = mockRes();

    requireAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect((res as unknown as { status: ReturnType<typeof vi.fn> }).status).toHaveBeenCalledWith(401);
    expect((res as unknown as { json: ReturnType<typeof vi.fn> }).json).toHaveBeenCalledWith({ error: "Unauthorised" });
  });
});
