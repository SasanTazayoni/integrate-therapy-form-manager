import { describe, test, expect, vi, beforeEach } from "vitest";
import { getValidFormByToken, validateTokenOrFail } from "./formTokenHelpers";
import prisma from "../../prisma/client";
import { isFormTokenUsable } from "../../utils/formUtils";
import type { Response } from "express";

vi.mock("../../prisma/client", () => {
  return {
    default: {
      form: {
        findUnique: vi.fn(),
      },
    },
  };
});

vi.mock("../../utils/formUtils", () => ({
  isFormTokenUsable: vi.fn(),
}));

const mockPrisma = prisma as unknown as {
  form: { findUnique: ReturnType<typeof vi.fn> };
};

type MockResponse = {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

describe("getValidFormByToken", () => {
  const mockForm = { id: 1, token: "abc123", client: {} };

  test("returns null if token is falsy", async () => {
    const result = await getValidFormByToken("");
    expect(result).toBeNull();
  });

  test("returns null if prisma returns null", async () => {
    mockPrisma.form.findUnique.mockResolvedValue(null);
    const result = await getValidFormByToken("abc123");
    expect(result).toBeNull();
  });

  test("returns null if form is not usable", async () => {
    mockPrisma.form.findUnique.mockResolvedValue(mockForm);
    vi.mocked(isFormTokenUsable).mockReturnValue(false);
    const result = await getValidFormByToken("abc123");
    expect(result).toBeNull();
  });

  test("returns the form if token is valid and usable", async () => {
    mockPrisma.form.findUnique.mockResolvedValue(mockForm);
    vi.mocked(isFormTokenUsable).mockReturnValue(true);
    const result = await getValidFormByToken("abc123");
    expect(result).toBe(mockForm);
  });
});

describe("validateTokenOrFail", () => {
  const mockForm = { id: 1, token: "abc123", client: {} };
  const mockRes: MockResponse = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns null and sends 403 if form is invalid", async () => {
    mockPrisma.form.findUnique.mockResolvedValue(null);
    const result = await validateTokenOrFail("abc123", mockRes as unknown as Response);
    expect(result).toBeNull();
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Token is invalid or expired",
      code: "INVALID_TOKEN",
    });
  });

  test("returns the form if token is valid", async () => {
    mockPrisma.form.findUnique.mockResolvedValue(mockForm);
    vi.mocked(isFormTokenUsable).mockReturnValue(true);
    const result = await validateTokenOrFail("abc123", mockRes as unknown as Response);
    expect(result).toBe(mockForm);
    expect(mockRes.status).not.toHaveBeenCalled();
  });
});
