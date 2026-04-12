import { describe, test, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import {
  getClientFormsStatusHandler,
  createClientHandler,
  deleteClientByEmailHandler,
  deactivateClientHandler,
  activateClientHandler,
} from "./clientsController";
import { getClientFormsStatus, createClient } from "./clientsService";
import { deleteClientByEmail } from "./clientDeletion";
import { deactivateClient, activateClient } from "./clientStatus";

vi.mock("./clientsService");
vi.mock("./clientDeletion");
vi.mock("./clientStatus");

type MockResponse = {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

const mockRes = (): MockResponse => {
  const res = {} as MockResponse;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("clientsController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getClientFormsStatusHandler", () => {
    test("returns 400 if email is missing", async () => {
      const req = { query: {} } as unknown as Request;
      const res = mockRes();

      vi.mocked(getClientFormsStatus).mockResolvedValue({ error: "Email is required" } as unknown as Awaited<ReturnType<typeof getClientFormsStatus>>);

      await getClientFormsStatusHandler(req, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Email is required" });
    });

    test("returns 404 if client not found", async () => {
      const req = { query: { email: "x@test.com" } } as unknown as Request;
      const res = mockRes();

      vi.mocked(getClientFormsStatus).mockResolvedValue({ error: "Client not found" } as unknown as Awaited<ReturnType<typeof getClientFormsStatus>>);

      await getClientFormsStatusHandler(req, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Client not found" });
    });

    test("returns client data if found", async () => {
      const req = { query: { email: "x@test.com" } } as unknown as Request;
      const res = mockRes();

      vi.mocked(getClientFormsStatus).mockResolvedValue({
        clientExists: true,
        clientName: "John",
        clientDob: "2000-01-01",
        inactive: false,
        formsStatus: {},
        formsCompleted: 0,
        scores: {},
      } as unknown as Awaited<ReturnType<typeof getClientFormsStatus>>);

      await getClientFormsStatusHandler(req, res as unknown as Response);

      expect(res.json).toHaveBeenCalledWith({
        exists: true,
        clientName: "John",
        clientDob: "2000-01-01",
        inactive: false,
        forms: {},
        formsCompleted: 0,
        scores: {},
      });
    });

    test("returns default empty scores if scores missing", async () => {
      const req = { query: { email: "x@test.com" } } as unknown as Request;
      const res = mockRes();

      vi.mocked(getClientFormsStatus).mockResolvedValue({
        clientExists: true,
        clientName: "John",
        clientDob: "2000-01-01",
        inactive: false,
        formsStatus: {},
        formsCompleted: 0,
        scores: undefined,
      } as unknown as Awaited<ReturnType<typeof getClientFormsStatus>>);

      await getClientFormsStatusHandler(req, res as unknown as Response);

      expect(res.json).toHaveBeenCalledWith({
        exists: true,
        clientName: "John",
        clientDob: "2000-01-01",
        inactive: false,
        forms: {},
        formsCompleted: 0,
        scores: {
          bdi: null,
          bai: null,
          ysq: {},
          ysq456: {},
          smi: {},
        },
      });
    });

    test("returns 500 on unexpected error", async () => {
      const req = { query: { email: "x@test.com" } } as unknown as Request;
      const res = mockRes();

      vi.mocked(getClientFormsStatus).mockResolvedValue({ error: "Some unknown error" } as unknown as Awaited<ReturnType<typeof getClientFormsStatus>>);

      await getClientFormsStatusHandler(req, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });

    test("returns null for clientName and clientDob if missing", async () => {
      const req = { query: { email: "x@test.com" } } as unknown as Request;
      const res = mockRes();

      vi.mocked(getClientFormsStatus).mockResolvedValue({
        clientExists: true,
        clientName: undefined,
        clientDob: undefined,
        inactive: false,
        formsStatus: {},
        formsCompleted: 0,
        scores: {},
      } as unknown as Awaited<ReturnType<typeof getClientFormsStatus>>);

      await getClientFormsStatusHandler(req, res as unknown as Response);

      expect(res.json).toHaveBeenCalledWith({
        exists: true,
        clientName: null,
        clientDob: null,
        inactive: false,
        forms: {},
        formsCompleted: 0,
        scores: {},
      });
    });
  });

  describe("createClientHandler", () => {
    test("returns 400 if email is missing", async () => {
      const req = { body: {} } as unknown as Request;
      const res = mockRes();

      vi.mocked(createClient).mockResolvedValue({ error: "Email is required" } as unknown as Awaited<ReturnType<typeof createClient>>);

      await createClientHandler(req, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Email is required" });
    });

    test("returns 201 and client if created", async () => {
      const req = { body: { email: "test@test.com" } } as unknown as Request;
      const res = mockRes();

      vi.mocked(createClient).mockResolvedValue({ client: { id: "123" } } as unknown as Awaited<ReturnType<typeof createClient>>);

      await createClientHandler(req, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: "123" });
    });

    test("returns 500 on unexpected error", async () => {
      const req = { body: { email: "test@test.com" } } as unknown as Request;
      const res = mockRes();

      vi.mocked(createClient).mockResolvedValue({ error: "Database unavailable" } as unknown as Awaited<ReturnType<typeof createClient>>);

      await createClientHandler(req, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database unavailable" });
    });
  });

  describe("deleteClientByEmailHandler", () => {
    test("returns 400 if email missing", async () => {
      const req = { query: {} } as unknown as Request;
      const res = mockRes();

      await deleteClientByEmailHandler(req, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Email is required" });
    });

    test("returns success if client deleted", async () => {
      const req = { query: { email: "test@test.com" } } as unknown as Request;
      const res = mockRes();

      vi.mocked(deleteClientByEmail).mockResolvedValue({ id: "123" } as unknown as Awaited<ReturnType<typeof deleteClientByEmail>>);

      await deleteClientByEmailHandler(req, res as unknown as Response);

      expect(res.json).toHaveBeenCalledWith({
        message: "Client and all forms deleted",
        client: { id: "123" },
      });
    });

    test("returns 500 if deletion throws", async () => {
      const req = { query: { email: "test@test.com" } } as unknown as Request;
      const res = mockRes();

      vi.mocked(deleteClientByEmail).mockRejectedValue(new Error("DB error"));

      await deleteClientByEmailHandler(req, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to delete client" });
    });
  });

  describe("deactivateClientHandler", () => {
    test("returns 400 if email missing", async () => {
      const req = { query: {} } as unknown as Request;
      const res = mockRes();

      await deactivateClientHandler(req, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Email is required" });
    });

    test("returns success if deactivated", async () => {
      const req = { query: { email: "x@test.com" } } as unknown as Request;
      const res = mockRes();

      vi.mocked(deactivateClient).mockResolvedValue({ ok: true, data: { id: "123" } } as unknown as Awaited<ReturnType<typeof deactivateClient>>);

      await deactivateClientHandler(req, res as unknown as Response);

      expect(res.json).toHaveBeenCalledWith({
        message: "Client x@test.com deactivated",
        client: { id: "123" },
      });
    });

    test("returns 500 if service returns not ok", async () => {
      const req = { query: { email: "x@test.com" } } as unknown as Request;
      const res = mockRes();

      vi.mocked(deactivateClient).mockResolvedValue({ ok: false, data: { error: "fail" } } as unknown as Awaited<ReturnType<typeof deactivateClient>>);

      await deactivateClientHandler(req, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "fail" });
    });

    test("returns 500 if service throws", async () => {
      const req = { query: { email: "x@test.com" } } as unknown as Request;
      const res = mockRes();

      vi.mocked(deactivateClient).mockRejectedValue(new Error("crash"));

      await deactivateClientHandler(req, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to deactivate client" });
    });
  });

  describe("activateClientHandler", () => {
    test("returns 400 if email missing", async () => {
      const req = { query: {} } as unknown as Request;
      const res = mockRes();

      await activateClientHandler(req, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Email is required" });
    });

    test("returns success if activated", async () => {
      const req = { query: { email: "x@test.com" } } as unknown as Request;
      const res = mockRes();

      vi.mocked(activateClient).mockResolvedValue({ ok: true, data: { id: "123" } } as unknown as Awaited<ReturnType<typeof activateClient>>);

      await activateClientHandler(req, res as unknown as Response);

      expect(res.json).toHaveBeenCalledWith({
        message: "Client x@test.com activated",
        client: { id: "123" },
      });
    });

    test("returns 500 if service returns not ok", async () => {
      const req = { query: { email: "x@test.com" } } as unknown as Request;
      const res = mockRes();

      vi.mocked(activateClient).mockResolvedValue({ ok: false, data: { error: "fail" } } as unknown as Awaited<ReturnType<typeof activateClient>>);

      await activateClientHandler(req, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "fail" });
    });

    test("returns 500 if service throws", async () => {
      const req = { query: { email: "x@test.com" } } as unknown as Request;
      const res = mockRes();

      vi.mocked(activateClient).mockRejectedValue(new Error("boom"));

      await activateClientHandler(req, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to activate client" });
    });
  });
});
