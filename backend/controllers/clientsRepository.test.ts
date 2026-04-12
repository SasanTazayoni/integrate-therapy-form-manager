import { describe, test, expect, vi, beforeEach } from "vitest";
import prisma from "../prisma/client";
import {
  findClientByEmail,
  getFormsByClientId,
  createNewClient,
} from "./clientsRepository";

vi.mock("../prisma/client");

const mockPrisma = prisma as unknown as {
  client: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  form: {
    findMany: ReturnType<typeof vi.fn>;
  };
};

describe("clientsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("findClientByEmail calls prisma.client.findUnique with correct args", async () => {
    const mockClient = { id: "1", email: "test@example.com" };
    mockPrisma.client.findUnique = vi.fn().mockResolvedValue(mockClient);

    const result = await findClientByEmail("test@example.com");

    expect(mockPrisma.client.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
    expect(result).toEqual(mockClient);
  });

  test("getFormsByClientId calls prisma.form.findMany with correct args", async () => {
    const mockForms = [{ id: "1", clientId: "123" }];
    mockPrisma.form.findMany = vi.fn().mockResolvedValue(mockForms);

    const result = await getFormsByClientId("123");

    expect(mockPrisma.form.findMany).toHaveBeenCalledWith({
      where: { clientId: "123" },
    });
    expect(result).toEqual(mockForms);
  });

  test("createNewClient calls prisma.client.create with correct args", async () => {
    const clientData = { email: "new@example.com", name: "Alice" };
    const mockClient = { id: "1", ...clientData };
    mockPrisma.client.create = vi.fn().mockResolvedValue(mockClient);

    const result = await createNewClient(clientData);

    expect(mockPrisma.client.create).toHaveBeenCalledWith({ data: clientData });
    expect(result).toEqual(mockClient);
  });

  test("findClientByEmail returns null when client does not exist", async () => {
    mockPrisma.client.findUnique = vi.fn().mockResolvedValue(null);

    const result = await findClientByEmail("notfound@example.com");

    expect(result).toBeNull();
  });

  test("findClientByEmail throws if prisma throws", async () => {
    mockPrisma.client.findUnique = vi.fn().mockRejectedValue(new Error("DB error"));

    await expect(findClientByEmail("test@example.com")).rejects.toThrow("DB error");
  });

  test("getFormsByClientId returns empty array when client has no forms", async () => {
    mockPrisma.form.findMany = vi.fn().mockResolvedValue([]);

    const result = await getFormsByClientId("123");

    expect(result).toEqual([]);
  });

  test("getFormsByClientId throws if prisma throws", async () => {
    mockPrisma.form.findMany = vi.fn().mockRejectedValue(new Error("DB error"));

    await expect(getFormsByClientId("123")).rejects.toThrow("DB error");
  });

  test("createNewClient throws if prisma throws", async () => {
    mockPrisma.client.create = vi.fn().mockRejectedValue(new Error("DB error"));

    await expect(
      createNewClient({ email: "new@example.com" })
    ).rejects.toThrow("DB error");
  });
});
