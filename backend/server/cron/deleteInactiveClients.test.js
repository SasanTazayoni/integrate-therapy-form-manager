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

describe("deleteInactiveClientsOlderThanOneYear", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete all expired inactive clients", async () => {
    const mockClients = [
      { email: "a@example.com" },
      { email: "b@example.com" },
    ];

    prisma.client.findMany.mockResolvedValue(mockClients);

    await deleteInactiveClientsOlderThanOneYear();

    expect(prisma.client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "inactive",
        }),
      })
    );

    expect(deleteClientByEmail).toHaveBeenCalledTimes(mockClients.length);
    expect(deleteClientByEmail).toHaveBeenCalledWith("a@example.com");
    expect(deleteClientByEmail).toHaveBeenCalledWith("b@example.com");
  });

  it("should handle errors from deleteClientByEmail gracefully", async () => {
    const mockClients = [{ email: "a@example.com" }];
    prisma.client.findMany.mockResolvedValue(mockClients);
    deleteClientByEmail.mockRejectedValue(new Error("delete failed"));

    await deleteInactiveClientsOlderThanOneYear();

    expect(deleteClientByEmail).toHaveBeenCalledWith("a@example.com");
  });

  it("should handle errors from prisma.findMany gracefully", async () => {
    prisma.client.findMany.mockRejectedValue(new Error("DB error"));

    await deleteInactiveClientsOlderThanOneYear();

    expect(deleteClientByEmail).not.toHaveBeenCalled();
  });
});
