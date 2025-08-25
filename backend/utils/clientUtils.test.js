import { describe, test, expect, vi, beforeEach } from "vitest";
import prisma from "../prisma/client";
import { findClientByEmail } from "./clientUtils";
import { normalizeEmail } from "./normalizeEmail";

vi.mock("../prisma/client", () => ({
  default: {
    client: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("./normalizeEmail", () => ({
  normalizeEmail: vi.fn(),
}));

describe("findClientByEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("calls prisma.client.findUnique with normalized email", async () => {
    normalizeEmail.mockReturnValue("normalized@example.com");
    prisma.client.findUnique.mockResolvedValue({
      id: 1,
      email: "normalized@example.com",
    });

    const result = await findClientByEmail("TEST@Example.com");

    expect(normalizeEmail).toHaveBeenCalledWith("TEST@Example.com");
    expect(prisma.client.findUnique).toHaveBeenCalledWith({
      where: { email: "normalized@example.com" },
    });
    expect(result).toEqual({ id: 1, email: "normalized@example.com" });
  });

  test("returns null if client not found", async () => {
    normalizeEmail.mockReturnValue("notfound@example.com");
    prisma.client.findUnique.mockResolvedValue(null);

    const result = await findClientByEmail("unknown@example.com");

    expect(normalizeEmail).toHaveBeenCalledWith("unknown@example.com");
    expect(result).toBeNull();
  });
});
