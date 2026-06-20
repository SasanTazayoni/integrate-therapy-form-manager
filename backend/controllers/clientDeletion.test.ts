import { describe, test, expect, vi, beforeEach } from "vitest";
import prisma from "../prisma/client";
import { deleteClientByEmail } from "./clientDeletion";

vi.mock("../prisma/client", async () => {
  return {
    default: {
      client: {
        findUnique: vi.fn(),
        delete: vi.fn(),
      },
    },
  };
});

const mockPrisma = prisma as unknown as {
  client: {
    findUnique: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
};

describe("deleteClientByEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("throws a generic error if client is not found", async () => {
    mockPrisma.client.findUnique.mockResolvedValue(null);

    await expect(deleteClientByEmail("test@example.com")).rejects.toThrow(
      "Failed to delete client and forms"
    );
  });

  test("deletes the client and returns the deleted record", async () => {
    const mockClient = { id: 1, email: "test@example.com" };
    mockPrisma.client.findUnique.mockResolvedValue(mockClient);
    mockPrisma.client.delete.mockResolvedValue(mockClient);

    const result = await deleteClientByEmail("test@example.com");

    expect(mockPrisma.client.delete).toHaveBeenCalledWith({
      where: { id: mockClient.id },
    });
    expect(result).toEqual(mockClient);
  });

  test("throws a generic error if delete fails", async () => {
    const mockClient = { id: 1, email: "test@example.com" };
    mockPrisma.client.findUnique.mockResolvedValue(mockClient);
    mockPrisma.client.delete.mockRejectedValue(new Error("DB failure"));

    await expect(deleteClientByEmail("test@example.com")).rejects.toThrow(
      "Failed to delete client and forms"
    );
  });
});
