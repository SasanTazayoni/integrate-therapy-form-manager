import { describe, test, expect, vi, beforeEach } from "vitest";
import prisma from "../prisma/client";
import {
  findClientByEmail,
  getFormsByClientId,
  createNewClient,
} from "./clientsRepository";

vi.mock("../prisma/client");

describe("clientsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("findClientByEmail calls prisma.client.findUnique with correct args", async () => {
    const mockClient = { id: "1", email: "test@example.com" };
    prisma.client.findUnique = vi.fn().mockResolvedValue(mockClient);

    const result = await findClientByEmail("test@example.com");

    expect(prisma.client.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
    expect(result).toEqual(mockClient);
  });

  test("getFormsByClientId calls prisma.form.findMany with correct args", async () => {
    const mockForms = [{ id: "1", clientId: "123" }];
    prisma.form.findMany = vi.fn().mockResolvedValue(mockForms);

    const result = await getFormsByClientId("123");

    expect(prisma.form.findMany).toHaveBeenCalledWith({
      where: { clientId: "123" },
    });
    expect(result).toEqual(mockForms);
  });

  test("createNewClient calls prisma.client.create with correct args", async () => {
    const clientData = { email: "new@example.com", name: "Alice" };
    const mockClient = { id: "1", ...clientData };
    prisma.client.create = vi.fn().mockResolvedValue(mockClient);

    const result = await createNewClient(clientData);

    expect(prisma.client.create).toHaveBeenCalledWith({ data: clientData });
    expect(result).toEqual(mockClient);
  });
});
