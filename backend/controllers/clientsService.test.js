import { describe, test, expect, vi, beforeEach } from "vitest";
import * as clientsRepo from "./clientsRepository";
import * as normalizeUtils from "../utils/normalizeEmail";
import { getClientFormsStatus, createClient } from "./clientsService";
import { getLatestForm } from "../utils/formHelpers";
import { FORM_TYPES } from "../data/formTypes";

vi.mock("./clientsRepository");
vi.mock("../utils/normalizeEmail");
vi.mock("../utils/formHelpers");

describe("clientsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getClientFormsStatus", () => {
    test("returns error if email is missing", async () => {
      const result = await getClientFormsStatus(undefined);
      expect(result.clientExists).toBe(false);
      expect(result.error).toBe("Email is required");
    });

    test("returns error if client not found", async () => {
      normalizeUtils.normalizeEmail.mockReturnValue("test@example.com");
      clientsRepo.findClientByEmail.mockResolvedValue(null);

      const result = await getClientFormsStatus("test@example.com");
      expect(result.clientExists).toBe(false);
      expect(result.error).toBe("Client not found");
    });

    test("returns correct status and scores for existing client", async () => {
      const mockClient = {
        id: "1",
        email: "test@example.com",
        name: "Alice",
        dob: new Date("1990-01-01"),
        status: "active",
        inactivated_at: null,
      };
      const mockForms = [
        {
          id: "f1",
          form_type: "BDI",
          bdi_score: 10,
          submitted_at: new Date(),
          token_sent_at: new Date(),
          token_expires_at: new Date(Date.now() + 10000),
          is_active: true,
          revoked_at: null,
        },
        {
          id: "f2",
          form_type: "BURNS",
          bai_score: 20,
          submitted_at: null,
          token_sent_at: new Date(),
          token_expires_at: new Date(Date.now() + 10000),
          is_active: true,
          revoked_at: null,
        },
      ];
      normalizeUtils.normalizeEmail.mockReturnValue("test@example.com");
      clientsRepo.findClientByEmail.mockResolvedValue(mockClient);
      clientsRepo.getFormsByClientId.mockResolvedValue(mockForms);
      getLatestForm.mockImplementation((forms, predicate) =>
        forms.find(predicate)
      );

      const result = await getClientFormsStatus("test@example.com");

      expect(result.clientExists).toBe(true);
      expect(result.clientName).toBe("Alice");
      expect(result.formsStatus).toBeDefined();
      expect(result.scores.bdi?.bdi_score).toBe("10");
      expect(result.scores.bai?.bai_score).toBe("20");
    });
  });

  describe("createClient", () => {
    test("returns error if email is missing", async () => {
      const result = await createClient({ name: "Alice" });
      expect(result.error).toBe("Email is required");
      expect(result.client).toBeUndefined();
    });

    test("creates client successfully", async () => {
      const mockClient = { id: "1", email: "test@example.com", name: "Alice" };
      normalizeUtils.normalizeEmail.mockReturnValue("test@example.com");
      clientsRepo.createNewClient = vi.fn().mockResolvedValue(mockClient);

      const result = await createClient({
        email: "TEST@EXAMPLE.COM",
        name: "Alice",
      });

      expect(clientsRepo.createNewClient).toHaveBeenCalledWith({
        email: "test@example.com",
        name: "Alice",
        dob: null,
      });
      expect(result.client).toEqual(mockClient);
    });

    test("handles errors from repository", async () => {
      normalizeUtils.normalizeEmail.mockReturnValue("test@example.com");
      clientsRepo.createNewClient = vi
        .fn()
        .mockRejectedValue(new Error("DB Error"));

      const result = await createClient({ email: "test@example.com" });

      expect(result.error).toBe("Failed to create client");
    });
  });

  test("client exists but has no forms", async () => {
    const mockClient = {
      id: "1",
      email: "test@example.com",
      name: "Alice",
      dob: null,
      status: "active",
      inactivated_at: null,
    };
    normalizeUtils.normalizeEmail.mockReturnValue("test@example.com");
    clientsRepo.findClientByEmail.mockResolvedValue(mockClient);
    clientsRepo.getFormsByClientId.mockResolvedValue([]);

    const result = await getClientFormsStatus("test@example.com");

    expect(result.formsCompleted).toBe(0);
    expect(
      Object.values(result.formsStatus || {}).every(
        (f) => !f.submitted && !f.activeToken
      )
    ).toBe(true);
  });

  test("client with mixed forms", async () => {
    const now = new Date();
    const mockClient = {
      id: "1",
      email: "test@example.com",
      name: "Alice",
      dob: null,
      status: "inactive",
      inactivated_at: now,
    };
    const mockForms = [
      {
        id: "f1",
        form_type: FORM_TYPES[0],
        submitted_at: now,
        token_sent_at: now,
        token_expires_at: new Date(now.getTime() + 10000),
        is_active: false,
        revoked_at: null,
      },
      {
        id: "f2",
        form_type: FORM_TYPES[1],
        submitted_at: null,
        token_sent_at: now,
        token_expires_at: new Date(now.getTime() + 10000),
        is_active: true,
        revoked_at: null,
      },
    ];
    normalizeUtils.normalizeEmail.mockReturnValue("test@example.com");
    clientsRepo.findClientByEmail.mockResolvedValue(mockClient);
    clientsRepo.getFormsByClientId.mockResolvedValue(mockForms);
    getLatestForm.mockImplementation((forms, predicate) =>
      forms.find(predicate)
    );

    const result = await getClientFormsStatus("test@example.com");

    expect(result.inactive).toBe(true);
    expect(result.formsCompleted).toBe(1);
    expect(result.formsStatus[FORM_TYPES[0]].submitted).toBe(true);
    expect(result.formsStatus[FORM_TYPES[1]].activeToken).toBe(true);
  });

  test("createClient converts DOB string to Date", async () => {
    const mockClient = {
      id: "1",
      email: "test@example.com",
      name: "Alice",
      dob: new Date("1990-01-01"),
    };
    clientsRepo.createNewClient = vi.fn().mockResolvedValue(mockClient);
    normalizeUtils.normalizeEmail.mockReturnValue("test@example.com");

    const result = await createClient({
      email: "TEST@EXAMPLE.COM",
      name: "Alice",
      dob: "1990-01-01",
    });

    expect(clientsRepo.createNewClient).toHaveBeenCalledWith({
      email: "test@example.com",
      name: "Alice",
      dob: new Date("1990-01-01"),
    });
    expect(result.client).toEqual(mockClient);
  });

  test("should correctly extract ysqScores and ysq456Scores from YSQ form", async () => {
    const mockClient = {
      id: "1",
      email: "alice@example.com",
      name: "Alice",
      dob: null,
      status: "active",
      inactivated_at: null,
    };

    const mockYsqForm = {
      id: "f1",
      form_type: "YSQ",
      token_sent_at: new Date(),
      token_expires_at: new Date(Date.now() + 10000),
      is_active: true,
      revoked_at: null,
      submitted_at: new Date(),
      ysq_ed_score: 5,
      ysq_ed_456: 2,
      ysq_ma_score: 10,
      ysq_ma_456: 4,
      bdi_score: null,
      bai_score: null,
    };

    normalizeUtils.normalizeEmail.mockReturnValue("alice@example.com");
    clientsRepo.findClientByEmail.mockResolvedValue(mockClient);
    clientsRepo.getFormsByClientId.mockResolvedValue([mockYsqForm]);
    getLatestForm.mockImplementation((forms, predicate) =>
      forms.find(predicate)
    );

    const result = await getClientFormsStatus("alice@example.com");

    expect(result.scores.ysq).toEqual({
      ysq_ed_score: "5",
      ysq_ma_score: "10",
    });
    expect(result.scores.ysq456).toEqual({
      ysq_ed_456: "2",
      ysq_ma_456: "4",
    });
  });

  test("client with no name should return clientName as null", async () => {
    const mockClient = {
      id: "1",
      email: "test@example.com",
      name: null,
      dob: null,
      status: "active",
      inactivated_at: null,
    };
    normalizeUtils.normalizeEmail.mockReturnValue("test@example.com");
    clientsRepo.findClientByEmail.mockResolvedValue(mockClient);
    clientsRepo.getFormsByClientId.mockResolvedValue([]);
    getLatestForm.mockImplementation(() => undefined);

    const result = await getClientFormsStatus("test@example.com");

    expect(result.clientName).toBeNull();
  });

  test("extractScores should handle null values and filter exclusions", async () => {
    const mockClient = {
      id: "1",
      email: "test@example.com",
      name: "Bob",
      dob: null,
      status: "active",
      inactivated_at: null,
    };
    const mockForm = {
      id: "f1",
      form_type: "SMI",
      token_sent_at: new Date(),
      token_expires_at: new Date(Date.now() + 10000),
      is_active: true,
      revoked_at: null,
      submitted_at: new Date(),
      smi_q1: 5,
      smi_q2: null,
      smi_hidden: 99,
    };

    normalizeUtils.normalizeEmail.mockReturnValue("test@example.com");
    clientsRepo.findClientByEmail.mockResolvedValue(mockClient);
    clientsRepo.getFormsByClientId.mockResolvedValue([mockForm]);
    getLatestForm.mockImplementation((forms, predicate) =>
      forms.find(predicate)
    );

    const result = await getClientFormsStatus("test@example.com");
    expect(result.scores.smi.smi_q1).toBe("5");
    expect(result.scores.smi.smi_q2).toBeNull();
    expect(result.scores.ysq456).toEqual({});
  });

  test("returns bdi as null when no BDI form exists", async () => {
    const mockClient = {
      id: "1",
      email: "test@example.com",
      name: "Alice",
      dob: null,
      status: "active",
      inactivated_at: null,
    };
    const mockForms = [
      {
        id: "f1",
        form_type: "BAI",
        bai_score: 12,
        submitted_at: new Date("2024-01-01"),
        token_sent_at: new Date(),
        token_expires_at: new Date(Date.now() + 10000),
        is_active: true,
        revoked_at: null,
      },
    ];

    normalizeUtils.normalizeEmail.mockReturnValue("test@example.com");
    clientsRepo.findClientByEmail.mockResolvedValue(mockClient);
    clientsRepo.getFormsByClientId.mockResolvedValue(mockForms);
    getLatestForm.mockImplementation((forms, predicate) =>
      forms.find(predicate)
    );

    const result = await getClientFormsStatus("test@example.com");

    expect(result.scores.bdi).toBeNull();
    expect(result.scores.bai).toEqual({
      bai_score: "12",
      submitted_at: "2024-01-01T00:00:00.000Z",
    });
  });

  test("bdi score exists but submitted_at is null", async () => {
    const mockClient = {
      id: "1",
      email: "test@example.com",
      name: "Alice",
      dob: null,
      status: "active",
      inactivated_at: null,
    };
    const mockForms = [
      {
        id: "f1",
        form_type: "BDI",
        bdi_score: 15,
        submitted_at: null,
        token_sent_at: new Date(),
        token_expires_at: new Date(Date.now() + 10000),
        is_active: true,
        revoked_at: null,
      },
    ];

    normalizeUtils.normalizeEmail.mockReturnValue("test@example.com");
    clientsRepo.findClientByEmail.mockResolvedValue(mockClient);
    clientsRepo.getFormsByClientId.mockResolvedValue(mockForms);
    getLatestForm.mockImplementation((forms, predicate) =>
      forms.find(predicate)
    );

    const result = await getClientFormsStatus("test@example.com");

    expect(result.scores.bdi).toEqual({
      bdi_score: "15",
      submitted_at: null,
    });
  });
});
