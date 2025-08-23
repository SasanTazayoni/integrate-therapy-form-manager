import { describe, test, expect, vi, beforeEach } from "vitest";
import prisma from "../prisma/client";
import { deleteClientByEmail } from "./clientDeletion";

vi.mock("../prisma/client", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    default: {
      client: {
        findUnique: vi.fn(),
        delete: vi.fn(),
      },
      $transaction: vi.fn(),
    },
  };
});

describe("deleteClientByEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("throws a generic error if client is not found", async () => {
    prisma.client.findUnique.mockResolvedValue(null);

    await expect(deleteClientByEmail("test@example.com")).rejects.toThrow(
      "Failed to delete client and forms"
    );
  });

  test("deletes client and associated forms in a transaction", async () => {
    const mockClient = { id: 1, email: "test@example.com" };
    prisma.client.findUnique.mockResolvedValue(mockClient);

    prisma.$transaction.mockImplementation(async (fn) => {
      return fn({
        form: {
          updateMany: vi.fn().mockResolvedValue(true),
          deleteMany: vi.fn().mockResolvedValue(true),
        },
        client: { delete: vi.fn().mockResolvedValue(mockClient) },
      });
    });

    const result = await deleteClientByEmail("test@example.com");
    expect(result).toEqual(mockClient);
  });

  test("throws a generic error if transaction fails", async () => {
    const mockClient = { id: 1, email: "test@example.com" };
    prisma.client.findUnique.mockResolvedValue(mockClient);

    prisma.$transaction.mockRejectedValue(new Error("DB failure"));

    await expect(deleteClientByEmail("test@example.com")).rejects.toThrow(
      "Failed to delete client and forms"
    );
  });
});
