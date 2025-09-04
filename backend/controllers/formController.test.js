import { describe, test, expect, vi, beforeEach } from "vitest";
import prisma from "../prisma/client";
import * as tokens from "../utils/tokens";
import { sendFormLink } from "../utils/sendFormLink";
import { findClientByEmail } from "../utils/clientUtils";
import { getActiveForms, mapFormSafe } from "../utils/formHelpers";
import { parseDateStrict } from "../utils/dates";
import { getValidFormByToken } from "../controllers/formControllerHelpers/formTokenHelpers";
import {
  createForm,
  sendForm,
  sendMultipleForms,
  validateToken,
  revokeFormToken,
  updateClientInfo,
} from "../controllers/formController";
import { FORM_TYPES } from "../data/formTypes";
import { sendMultipleFormLinks } from "../utils/sendMultipleFormLinks";

vi.mock("../prisma/client", () => ({
  default: {
    form: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
    client: {
      update: vi.fn(),
    },
  },
}));

vi.mock("../utils/tokens", () => ({
  generateToken: vi.fn(() => "mocked-token"),
  computeExpiry: vi.fn(() => new Date("2099-01-01T00:00:00Z")),
}));

vi.mock("../utils/formHelpers", () => ({
  getActiveForms: vi.fn(() => []),
  mapFormSafe: vi.fn((f) => f),
}));

vi.mock("../utils/sendFormLink", () => ({
  sendFormLink: vi.fn(),
}));

vi.mock("../utils/clientUtils", () => ({
  findClientByEmail: vi.fn(),
}));

vi.mock("../utils/formUtils", () => ({
  deactivateInvalidActiveForms: vi.fn(),
}));

vi.mock("../utils/dates", () => ({
  parseDateStrict: vi.fn((d) => new Date(d)),
}));

vi.mock("../controllers/formControllerHelpers/formTokenHelpers", () => ({
  getValidFormByToken: vi.fn(),
}));

vi.mock("../utils/sendMultipleFormLinks", () => ({
  sendMultipleFormLinks: vi.fn(),
}));

vi.mock("../utils/formUtils", () => ({
  deactivateInvalidActiveForms: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();

  prisma.form.create.mockResolvedValue({
    id: "new-form",
    token: "mocked-token",
    clientId: "1",
    form_type: FORM_TYPES[0],
    token_sent_at: new Date(),
    token_expires_at: new Date("2099-01-01T00:00:00Z"),
    is_active: true,
    submitted_at: null,
  });

  findClientByEmail.mockResolvedValue({
    id: "1",
    email: "test@test.com",
    name: "John",
  });

  sendFormLink.mockResolvedValue(undefined);

  tokens.generateToken = vi.fn(() => "mocked-token");
  tokens.computeExpiry = vi.fn(() => new Date("2099-01-01T00:00:00Z"));

  getActiveForms.mockReturnValue([]);
  mapFormSafe.mockImplementation((f) => f);
});

describe("formController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("createForm returns 400 if invalid input", async () => {
    const req = { body: { clientId: "", formType: "invalid" } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await createForm(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid input" });
  });

  test("createForm creates form successfully", async () => {
    const mockForm = { id: "1", clientId: "123", form_type: FORM_TYPES[0] };
    prisma.form.create.mockResolvedValue(mockForm);

    const req = { body: { clientId: "123", formType: FORM_TYPES[0] } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await createForm(req, res);

    expect(tokens.generateToken).toHaveBeenCalled();
    expect(tokens.computeExpiry).toHaveBeenCalled();
    expect(prisma.form.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockForm);
  });

  test("createForm handles errors and returns 500", async () => {
    prisma.form.create.mockRejectedValue(new Error("DB error"));
    const req = { body: { clientId: "123", formType: FORM_TYPES[0] } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await createForm(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to create form" });
  });

  test("createForm handles token generation errors", async () => {
    tokens.generateToken.mockImplementation(() => {
      throw new Error("Token failed");
    });
    const req = { body: { clientId: "123", formType: FORM_TYPES[0] } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await createForm(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to create form" });
  });

  test("sendForm returns 400 if input invalid", async () => {
    const req = { body: { email: "" }, params: { formType: "invalid" } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await sendForm(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid input" });
  });

  test("sendForm returns 404 if client not found", async () => {
    findClientByEmail.mockResolvedValue(null);
    const req = {
      body: { email: "test@test.com" },
      params: { formType: FORM_TYPES[0] },
    };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await sendForm(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Client not found" });
  });

  test("sendForm returns 400 if active token exists", async () => {
    const mockClient = { id: "1", email: "test@test.com", name: "John" };
    findClientByEmail.mockResolvedValue(mockClient);
    prisma.form.findMany.mockResolvedValue([{ id: "existing" }]);
    getActiveForms.mockReturnValue([{ id: "existing" }]);

    const req = {
      body: { email: "test@test.com" },
      params: { formType: FORM_TYPES[0] },
    };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await sendForm(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Active token already exists for this form",
    });
  });

  test("should handle errors and return 500", async () => {
    findClientByEmail.mockRejectedValue(new Error("DB error"));

    const req = {
      body: { email: "test@test.com" },
      params: { formType: FORM_TYPES[0] },
    };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await sendForm(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to send form" });
  });

  test("sendForm successfully creates a new form and sends email", async () => {
    const mockClient = { id: "1", email: "test@test.com", name: "John" };
    findClientByEmail.mockResolvedValue(mockClient);
    prisma.form.create.mockResolvedValue({
      id: "new-form",
      token: "mocked-token",
      clientId: mockClient.id,
      form_type: FORM_TYPES[0],
      token_sent_at: new Date(),
      token_expires_at: new Date("2099-01-01T00:00:00Z"),
      is_active: true,
      submitted_at: null,
    });
    getActiveForms.mockReturnValue([]);

    const req = {
      body: { email: "test@test.com" },
      params: { formType: FORM_TYPES[0] },
    };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await sendForm(req, res);

    expect(prisma.form.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          token: "mocked-token",
          clientId: mockClient.id,
          form_type: FORM_TYPES[0],
          is_active: true,
          submitted_at: null,
        }),
      })
    );

    expect(sendFormLink).toHaveBeenCalledWith(
      expect.objectContaining({
        to: mockClient.email,
        token: "mocked-token",
        formType: FORM_TYPES[0],
        clientName: mockClient.name,
      })
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Form sent via email",
        form: expect.any(Object),
      })
    );
  });

  test("sendForm sets clientName to undefined if client.name is null", async () => {
    const mockClient = { id: "1", email: "test@test.com", name: null };
    findClientByEmail.mockResolvedValue(mockClient);
    prisma.form.create.mockResolvedValue({
      id: "new-form",
      token: "mocked-token",
      clientId: mockClient.id,
      form_type: FORM_TYPES[0],
      token_sent_at: new Date(),
      token_expires_at: new Date("2099-01-01T00:00:00Z"),
      is_active: true,
      submitted_at: null,
    });
    getActiveForms.mockReturnValue([]);

    const req = {
      body: { email: "test@test.com" },
      params: { formType: FORM_TYPES[0] },
    };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await sendForm(req, res);

    expect(sendFormLink).toHaveBeenCalledWith(
      expect.objectContaining({
        to: mockClient.email,
        token: "mocked-token",
        formType: FORM_TYPES[0],
        clientName: undefined,
      })
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Form sent via email",
        form: expect.any(Object),
      })
    );
  });

  test("validateToken returns 400 if missing token", async () => {
    const req = { query: {} };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await validateToken(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      valid: false,
      message: "Missing token",
    });
  });

  test("validateToken returns 403 if token invalid", async () => {
    getValidFormByToken.mockResolvedValue(null);
    const req = { query: { token: "invalid" } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await validateToken(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      valid: false,
      message: "Token is invalid or expired",
    });
  });

  test("validateToken returns valid form info", async () => {
    const mockForm = {
      form_type: FORM_TYPES[0],
      client: { name: "John", dob: "2000-01-01" },
    };
    getValidFormByToken.mockResolvedValue(mockForm);
    const req = { query: { token: "valid" } };
    const res = { json: vi.fn() };

    await validateToken(req, res);

    expect(res.json).toHaveBeenCalledWith({
      valid: true,
      questionnaire: mockForm.form_type,
      client: { name: "John", dob: "2000-01-01" },
    });
  });

  test("validateToken returns valid form info with null client fields if missing", async () => {
    const mockForm = {
      form_type: FORM_TYPES[0],
      client: {},
    };
    getValidFormByToken.mockResolvedValue(mockForm);

    const req = { query: { token: "valid" } };
    const res = { json: vi.fn() };

    await validateToken(req, res);

    expect(res.json).toHaveBeenCalledWith({
      valid: true,
      questionnaire: mockForm.form_type,
      client: { name: null, dob: null },
    });
  });

  test("validateToken handles server error", async () => {
    getValidFormByToken.mockRejectedValue(new Error("DB error"));
    const req = { query: { token: "valid" } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await validateToken(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      valid: false,
      message: "Server error validating token",
    });
  });

  test("revokeFormToken returns 400 if input invalid", async () => {
    const req = { body: { email: "" }, params: { formType: "invalid" } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await revokeFormToken(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("revokeFormToken returns 404 if client not found", async () => {
    findClientByEmail.mockResolvedValue(null);
    const req = {
      body: { email: "test@test.com" },
      params: { formType: FORM_TYPES[0] },
    };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await revokeFormToken(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("revokeFormToken returns 404 if no active forms", async () => {
    findClientByEmail.mockResolvedValue({ id: "1" });
    prisma.form.updateMany.mockResolvedValue({ count: 0 });
    const req = {
      body: { email: "test@test.com" },
      params: { formType: FORM_TYPES[0] },
    };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await revokeFormToken(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("revokeFormToken revokes forms successfully", async () => {
    const mockClient = { id: "1" };
    findClientByEmail.mockResolvedValue(mockClient);
    prisma.form.updateMany.mockResolvedValue({ count: 1 });
    prisma.form.findMany.mockResolvedValue([{ revoked_at: new Date() }]);
    getActiveForms.mockReturnValue([{ revoked_at: new Date() }]);

    const req = {
      body: { email: "test@test.com" },
      params: { formType: FORM_TYPES[0] },
    };
    const res = { json: vi.fn() };
    await revokeFormToken(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Form token(s) revoked successfully" })
    );
  });

  test("revokeFormToken sets revokedAt to null if revoked_at is undefined", async () => {
    const mockClient = { id: "1" };
    findClientByEmail.mockResolvedValue(mockClient);
    prisma.form.updateMany.mockResolvedValue({ count: 1 });

    prisma.form.findMany.mockResolvedValue([{}]);
    getActiveForms.mockReturnValue([{}]);

    const req = {
      body: { email: "test@test.com" },
      params: { formType: FORM_TYPES[0] },
    };
    const res = { json: vi.fn() };

    await revokeFormToken(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Form token(s) revoked successfully",
        revokedAt: null,
      })
    );
  });

  test("revokeFormToken handles server error", async () => {
    findClientByEmail.mockRejectedValue(new Error("DB error"));
    const req = {
      body: { email: "test@test.com" },
      params: { formType: FORM_TYPES[0] },
    };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await revokeFormToken(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to revoke form token",
    });
  });

  test("updateClientInfo returns 400 if missing fields", async () => {
    const req = { body: {} };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await updateClientInfo(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("updateClientInfo returns 404 if form or client not found", async () => {
    prisma.form.findUnique.mockResolvedValue(null);
    const req = { body: { token: "t", name: "John", dob: "2000-01-01" } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await updateClientInfo(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("updateClientInfo returns 400 if dob invalid", async () => {
    prisma.form.findUnique.mockResolvedValue({ client: { id: "1" } });
    parseDateStrict.mockReturnValue(null);
    const req = { body: { token: "t", name: "John", dob: "invalid" } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await updateClientInfo(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("updateClientInfo updates client successfully", async () => {
    prisma.form.findUnique.mockResolvedValue({ client: { id: "1" } });
    parseDateStrict.mockReturnValue(new Date("2000-01-01"));
    const req = { body: { token: "t", name: "John", dob: "2000-01-01" } };
    const res = { json: vi.fn() };
    await updateClientInfo(req, res);
    expect(prisma.client.update).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  test("updateClientInfo handles server error", async () => {
    prisma.form.findUnique.mockRejectedValue(new Error("DB error"));
    const req = { body: { token: "t", name: "John", dob: "2000-01-01" } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await updateClientInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Server error updating client info",
    });
  });

  test("sendMultipleForms returns 400 if email is missing", async () => {
    const req = { body: {} };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await sendMultipleForms(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Email required" });
  });

  test("sendMultipleForms returns 404 if client not found", async () => {
    findClientByEmail.mockResolvedValue(null);

    const req = { body: { email: "notfound@test.com" } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await sendMultipleForms(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Client not found" });
  });

  test("sendMultipleForms returns 409 if no forms to send", async () => {
    const existingForms = FORM_TYPES.map((type) => ({
      form_type: type,
      is_active: true,
      submitted_at: null,
    }));
    prisma.form.findMany.mockResolvedValue(existingForms);

    const req = { body: { email: "test@test.com" } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await sendMultipleForms(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "No forms to send. Active tokens or submitted forms already exist.",
    });
  });

  test("sendMultipleForms creates forms and calls sendMultipleFormLinks", async () => {
    prisma.form.findMany.mockResolvedValue([]);

    const req = { body: { email: "test@test.com" } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await sendMultipleForms(req, res);

    expect(prisma.form.create).toHaveBeenCalledTimes(FORM_TYPES.length);
    expect(sendMultipleFormLinks).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "test@test.com",
        clientName: "John",
        forms: expect.any(Array),
      })
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Forms sent via email",
        sentForms: expect.any(Array),
      })
    );
  });

  test("sendMultipleForms handles errors and returns 500", async () => {
    findClientByEmail.mockRejectedValue(new Error("DB error"));

    const req = { body: { email: "test@test.com" } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await sendMultipleForms(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to send multiple forms",
    });
  });

  test("skips creating form if existing active form exists", async () => {
    const mockClient = { id: "1", email: "test@test.com", name: "John" };
    findClientByEmail.mockResolvedValue(mockClient);

    const existingForms = FORM_TYPES.map((type) => ({
      form_type: type,
      is_active: true,
      submitted_at: null,
    }));
    prisma.form.findMany.mockResolvedValue(existingForms);

    const req = { body: { email: "test@test.com" } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await sendMultipleForms(req, res);

    expect(prisma.form.create).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("skips creating form if submitted form exists and formType !== SMI", async () => {
    const mockClient = { id: "1", email: "test@test.com", name: "John" };
    findClientByEmail.mockResolvedValue(mockClient);

    prisma.form.findMany.mockResolvedValue([
      { form_type: "YSQ", is_active: false, submitted_at: new Date() },
    ]);

    const req = { body: { email: "test@test.com" } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await sendMultipleForms(req, res);

    expect(prisma.form.create).toHaveBeenCalledTimes(FORM_TYPES.length - 1); // SMI still created
  });

  test("creates SMI form even if a submitted form exists", async () => {
    const mockClient = { id: "1", email: "test@test.com", name: "John" };
    findClientByEmail.mockResolvedValue(mockClient);

    prisma.form.findMany.mockResolvedValue([
      { form_type: "SMI", is_active: false, submitted_at: new Date() },
    ]);

    const req = { body: { email: "test@test.com" } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await sendMultipleForms(req, res);

    expect(prisma.form.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ form_type: "SMI" }),
      })
    );
  });

  test("sendMultipleForms passes clientName when client has a name", async () => {
    const mockClient = { id: "1", email: "test@test.com", name: "John Doe" };
    findClientByEmail.mockResolvedValue(mockClient);
    prisma.form.findMany.mockResolvedValue([]);

    const req = { body: { email: "test@test.com" } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await sendMultipleForms(req, res);

    expect(sendMultipleFormLinks).toHaveBeenCalledWith(
      expect.objectContaining({
        clientName: "John Doe",
      })
    );
  });

  test("sendMultipleForms sets clientName to undefined when client.name is null", async () => {
    const mockClient = { id: "1", email: "test@test.com", name: null };
    findClientByEmail.mockResolvedValue(mockClient);
    prisma.form.findMany.mockResolvedValue([]);

    const req = { body: { email: "test@test.com" } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await sendMultipleForms(req, res);

    expect(sendMultipleFormLinks).toHaveBeenCalledWith(
      expect.objectContaining({
        clientName: undefined,
      })
    );
  });
});
