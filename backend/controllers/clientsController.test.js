import { describe, test, expect, vi, beforeEach } from "vitest";
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

const mockRes = () => {
  const res = {};
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
      const req = { query: {} };
      const res = mockRes();

      getClientFormsStatus.mockResolvedValue({ error: "Email is required" });

      await getClientFormsStatusHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Email is required" });
    });

    test("returns 404 if client not found", async () => {
      const req = { query: { email: "x@test.com" } };
      const res = mockRes();

      getClientFormsStatus.mockResolvedValue({ error: "Client not found" });

      await getClientFormsStatusHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Client not found" });
    });

    test("returns client data if found", async () => {
      const req = { query: { email: "x@test.com" } };
      const res = mockRes();

      getClientFormsStatus.mockResolvedValue({
        clientExists: true,
        clientName: "John",
        clientDob: "2000-01-01",
        inactive: false,
        formsStatus: {},
        formsCompleted: 0,
        scores: {},
      });

      await getClientFormsStatusHandler(req, res);

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
      const req = { query: { email: "x@test.com" } };
      const res = mockRes();

      getClientFormsStatus.mockResolvedValue({
        clientExists: true,
        clientName: "John",
        clientDob: "2000-01-01",
        inactive: false,
        formsStatus: {},
        formsCompleted: 0,
        scores: undefined,
      });

      await getClientFormsStatusHandler(req, res);

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
      const req = { query: { email: "x@test.com" } };
      const res = mockRes();

      getClientFormsStatus.mockResolvedValue({ error: "Some unknown error" });

      await getClientFormsStatusHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });

    test("returns null for clientName and clientDob if missing", async () => {
      const req = { query: { email: "x@test.com" } };
      const res = mockRes();

      getClientFormsStatus.mockResolvedValue({
        clientExists: true,
        clientName: undefined,
        clientDob: undefined,
        inactive: false,
        formsStatus: {},
        formsCompleted: 0,
        scores: {},
      });

      await getClientFormsStatusHandler(req, res);

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
      const req = { body: {} };
      const res = mockRes();

      createClient.mockResolvedValue({ error: "Email is required" });

      await createClientHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Email is required" });
    });

    test("returns 201 and client if created", async () => {
      const req = { body: { email: "test@test.com" } };
      const res = mockRes();

      createClient.mockResolvedValue({ client: { id: "123" } });

      await createClientHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: "123" });
    });

    test("returns 500 on unexpected error", async () => {
      const req = { body: { email: "test@test.com" } };
      const res = mockRes();

      createClient.mockResolvedValue({ error: "Database unavailable" });

      await createClientHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database unavailable" });
    });
  });

  describe("deleteClientByEmailHandler", () => {
    test("returns 400 if email missing", async () => {
      const req = { query: {} };
      const res = mockRes();

      await deleteClientByEmailHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Email is required" });
    });

    test("returns success if client deleted", async () => {
      const req = { query: { email: "test@test.com" } };
      const res = mockRes();

      deleteClientByEmail.mockResolvedValue({ id: "123" });

      await deleteClientByEmailHandler(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Client and all forms deleted",
        client: { id: "123" },
      });
    });

    test("returns 500 if deletion throws", async () => {
      const req = { query: { email: "test@test.com" } };
      const res = mockRes();

      deleteClientByEmail.mockRejectedValue(new Error("DB error"));

      await deleteClientByEmailHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
    });

    test("returns 500 with generic message if non-Error thrown", async () => {
      const req = { query: { email: "test@test.com" } };
      const res = mockRes();

      deleteClientByEmail.mockRejectedValue("some string");

      await deleteClientByEmailHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to delete client",
      });
    });
  });

  describe("deactivateClientHandler", () => {
    test("returns 400 if email missing", async () => {
      const req = { query: {} };
      const res = mockRes();

      await deactivateClientHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Email is required" });
    });

    test("returns success if deactivated", async () => {
      const req = { query: { email: "x@test.com" } };
      const res = mockRes();

      deactivateClient.mockResolvedValue({ ok: true, data: { id: "123" } });

      await deactivateClientHandler(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Client x@test.com deactivated",
        client: { id: "123" },
      });
    });

    test("returns 500 if service returns not ok", async () => {
      const req = { query: { email: "x@test.com" } };
      const res = mockRes();

      deactivateClient.mockResolvedValue({
        ok: false,
        data: { error: "fail" },
      });

      await deactivateClientHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "fail" });
    });

    test("returns 500 if service throws", async () => {
      const req = { query: { email: "x@test.com" } };
      const res = mockRes();

      deactivateClient.mockRejectedValue(new Error("crash"));

      await deactivateClientHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "crash" });
    });

    test("returns generic message if non-Error thrown", async () => {
      const req = { query: { email: "x@test.com" } };
      const res = mockRes();

      deactivateClient.mockRejectedValue("some string");

      await deactivateClientHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to deactivate client",
      });
    });
  });

  describe("activateClientHandler", () => {
    test("returns 400 if email missing", async () => {
      const req = { query: {} };
      const res = mockRes();

      await activateClientHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Email is required" });
    });

    test("returns success if activated", async () => {
      const req = { query: { email: "x@test.com" } };
      const res = mockRes();

      activateClient.mockResolvedValue({ ok: true, data: { id: "123" } });

      await activateClientHandler(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Client x@test.com activated",
        client: { id: "123" },
      });
    });

    test("returns 500 if service returns not ok", async () => {
      const req = { query: { email: "x@test.com" } };
      const res = mockRes();

      activateClient.mockResolvedValue({ ok: false, data: { error: "fail" } });

      await activateClientHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "fail" });
    });

    test("returns 500 if service throws", async () => {
      const req = { query: { email: "x@test.com" } };
      const res = mockRes();

      activateClient.mockRejectedValue(new Error("boom"));

      await activateClientHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "boom" });
    });

    test("returns generic message if non-Error thrown", async () => {
      const req = { query: { email: "x@test.com" } };
      const res = mockRes();

      activateClient.mockRejectedValue("some string");

      await activateClientHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to activate client",
      });
    });
  });
});
