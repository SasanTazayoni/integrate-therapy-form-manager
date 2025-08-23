import { describe, test, expect, vi, beforeEach } from "vitest";
import prisma from "../prisma/client";
import { activateClient, deactivateClient } from "./clientStatus";

vi.mock("../prisma/client", () => ({
  default: {
    client: {
      update: vi.fn(),
    },
  },
}));

describe("deactivateClient", () => {
  const email = "test@example.com";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return ok: true with client data when update succeeds", async () => {
    const mockClient = { email, status: "inactive" };
    prisma.client.update.mockResolvedValue(mockClient);

    const result = await deactivateClient(email);

    expect(prisma.client.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email },
        data: expect.objectContaining({
          status: "inactive",
        }),
      })
    );
    expect(result).toEqual({ ok: true, data: mockClient });
  });

  test("should return ok: false when update fails", async () => {
    prisma.client.update.mockRejectedValue(new Error("DB error"));

    const result = await deactivateClient(email);

    expect(result).toEqual({
      ok: false,
      data: { error: "Failed to deactivate client" },
    });
  });
});

describe("activateClient", () => {
  const email = "test@example.com";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return ok: true with client data when update succeeds", async () => {
    const mockClient = { email, status: "active" };
    prisma.client.update.mockResolvedValue(mockClient);

    const result = await activateClient(email);

    expect(prisma.client.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email },
        data: expect.objectContaining({
          status: "active",
        }),
      })
    );
    expect(result).toEqual({ ok: true, data: mockClient });
  });

  test("should return ok: false when update fails", async () => {
    prisma.client.update.mockRejectedValue(new Error("DB error"));

    const result = await activateClient(email);

    expect(result).toEqual({
      ok: false,
      data: { error: "Failed to activate client" },
    });
  });
});
