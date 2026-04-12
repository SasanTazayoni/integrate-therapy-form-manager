import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "../../prisma/client";
import { deleteClientByEmail } from "../../controllers/clientDeletion";
import { deleteInactiveClientsOlderThanOneYear } from "./deleteInactiveClients";

vi.mock("../../prisma/client", () => ({
  default: {
    client: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("../../controllers/clientDeletion", () => ({
  deleteClientByEmail: vi.fn(),
}));

const mockPrisma = prisma as unknown as {
  client: { findMany: ReturnType<typeof vi.fn> };
};

describe("deleteInactiveClientsOlderThanOneYear", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete all expired inactive clients", async () => {
    const mockClients = [
      { email: "a@example.com" },
      { email: "b@example.com" },
    ];

    mockPrisma.client.findMany.mockResolvedValue(mockClients);

    await deleteInactiveClientsOlderThanOneYear();

    expect(mockPrisma.client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "inactive",
        }),
      })
    );

    expect(vi.mocked(deleteClientByEmail)).toHaveBeenCalledTimes(mockClients.length);
    expect(vi.mocked(deleteClientByEmail)).toHaveBeenCalledWith("a@example.com");
    expect(vi.mocked(deleteClientByEmail)).toHaveBeenCalledWith("b@example.com");
  });

  it("should handle errors from deleteClientByEmail gracefully", async () => {
    const mockClients = [{ email: "a@example.com" }];
    mockPrisma.client.findMany.mockResolvedValue(mockClients);
    vi.mocked(deleteClientByEmail).mockRejectedValue(new Error("delete failed"));

    await deleteInactiveClientsOlderThanOneYear();

    expect(vi.mocked(deleteClientByEmail)).toHaveBeenCalledWith("a@example.com");
  });

  it("should handle errors from prisma.findMany gracefully", async () => {
    mockPrisma.client.findMany.mockRejectedValue(new Error("DB error"));

    await deleteInactiveClientsOlderThanOneYear();

    expect(vi.mocked(deleteClientByEmail)).not.toHaveBeenCalled();
  });
});
