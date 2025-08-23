import { describe, test, expect, vi, beforeEach } from "vitest";
import { getValidFormByToken, validateTokenOrFail } from "./formTokenHelpers";
import prisma from "../../prisma/client";
import { isFormTokenUsable } from "../../utils/formUtils";

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

describe("getValidFormByToken", () => {
  const mockForm = { id: 1, token: "abc123", client: {} };

  test("returns null if token is falsy", async () => {
    const result = await getValidFormByToken("");
    expect(result).toBeNull();
  });

  test("returns null if prisma returns null", async () => {
    prisma.form.findUnique.mockResolvedValue(null);
    const result = await getValidFormByToken("abc123");
    expect(result).toBeNull();
  });

  test("returns null if form is not usable", async () => {
    prisma.form.findUnique.mockResolvedValue(mockForm);
    isFormTokenUsable.mockReturnValue(false);
    const result = await getValidFormByToken("abc123");
    expect(result).toBeNull();
  });

  test("returns the form if token is valid and usable", async () => {
    prisma.form.findUnique.mockResolvedValue(mockForm);
    isFormTokenUsable.mockReturnValue(true);
    const result = await getValidFormByToken("abc123");
    expect(result).toBe(mockForm);
  });
});

describe("validateTokenOrFail", () => {
  const mockForm = { id: 1, token: "abc123", client: {} };
  const mockRes = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns null and sends 403 if form is invalid", async () => {
    prisma.form.findUnique.mockResolvedValue(null);
    const result = await validateTokenOrFail("abc123", mockRes);
    expect(result).toBeNull();
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Token is invalid or expired",
      code: "INVALID_TOKEN",
    });
  });

  test("returns the form if token is valid", async () => {
    prisma.form.findUnique.mockResolvedValue(mockForm);
    isFormTokenUsable.mockReturnValue(true);
    const result = await validateTokenOrFail("abc123", mockRes);
    expect(result).toBe(mockForm);
    expect(mockRes.status).not.toHaveBeenCalled();
  });
});
