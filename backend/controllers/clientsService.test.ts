import { describe, test, expect, vi, beforeEach } from "vitest";
import type { Form } from "@prisma/client";
import * as clientsRepo from "./clientsRepository";
import * as normalizeUtils from "../utils/normalizeEmail";
import { getClientFormsStatus, createClient } from "./clientsService";
import { FORM_TYPES } from "../data/formTypes";
import getBecksScoreCategory, { BECKS_NORMAL_MAX, BECKS_MILD_MAX } from "../utils/becksScoreUtils";
import getBurnsScoreCategory, { BURNS_MILD_MAX, BURNS_BORDERLINE_MAX } from "../utils/burnsScoreUtils";
import { getScoreCategory, YSQ_BOUNDARIES } from "../utils/YSQScoreUtils";
import { classifyScore } from "../utils/SMIScoreUtilsBackend";
import { smiBoundaries } from "../data/SMIBoundariesBackend";

vi.mock("./clientsRepository");
vi.mock("../utils/normalizeEmail");

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
      vi.mocked(normalizeUtils.normalizeEmail).mockReturnValue("test@example.com");
      vi.mocked(clientsRepo.findClientByEmail).mockResolvedValue(null);

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
          bdi_score: BECKS_NORMAL_MAX,
          submitted_at: new Date(),
          token_sent_at: new Date(),
          token_expires_at: new Date(Date.now() + 10000),
          is_active: true,
          revoked_at: null,
        },
        {
          id: "f2",
          form_type: "BURNS",
          bai_score: BURNS_MILD_MAX,
          submitted_at: null,
          token_sent_at: new Date(),
          token_expires_at: new Date(Date.now() + 10000),
          is_active: true,
          revoked_at: null,
        },
      ];
      vi.mocked(normalizeUtils.normalizeEmail).mockReturnValue("test@example.com");
      vi.mocked(clientsRepo.findClientByEmail).mockResolvedValue(mockClient as unknown as Awaited<ReturnType<typeof clientsRepo.findClientByEmail>>);
      vi.mocked(clientsRepo.getFormsByClientId).mockResolvedValue(mockForms as unknown as Form[]);

      const result = await getClientFormsStatus("test@example.com");

      expect(result.clientExists).toBe(true);
      expect(result.clientName).toBe("Alice");
      expect(result.formsStatus).toBeDefined();
      expect(result.scores!.bdi?.bdi_score).toBe(`${BECKS_NORMAL_MAX}-${getBecksScoreCategory(BECKS_NORMAL_MAX)}`);
      expect(result.scores!.bai?.bai_score).toBe(`${BURNS_MILD_MAX}-${getBurnsScoreCategory(BURNS_MILD_MAX)}`);
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
      vi.mocked(normalizeUtils.normalizeEmail).mockReturnValue("test@example.com");
      vi.mocked(clientsRepo.createNewClient).mockResolvedValue(mockClient as unknown as Awaited<ReturnType<typeof clientsRepo.createNewClient>>);

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
      vi.mocked(normalizeUtils.normalizeEmail).mockReturnValue("test@example.com");
      vi.mocked(clientsRepo.createNewClient).mockRejectedValue(new Error("DB Error"));

      const result = await createClient({ email: "test@example.com" });

      expect(result.error).toBe("Failed to create client");
    });
  });

  test("client with no forms has formsCompleted 0 and all statuses unsubmitted with no active tokens", async () => {
    const mockClient = {
      id: "1",
      email: "test@example.com",
      name: "Alice",
      dob: null,
      status: "active",
      inactivated_at: null,
    };
    vi.mocked(normalizeUtils.normalizeEmail).mockReturnValue("test@example.com");
    vi.mocked(clientsRepo.findClientByEmail).mockResolvedValue(mockClient as unknown as Awaited<ReturnType<typeof clientsRepo.findClientByEmail>>);
    vi.mocked(clientsRepo.getFormsByClientId).mockResolvedValue([]);

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
    vi.mocked(normalizeUtils.normalizeEmail).mockReturnValue("test@example.com");
    vi.mocked(clientsRepo.findClientByEmail).mockResolvedValue(mockClient as unknown as Awaited<ReturnType<typeof clientsRepo.findClientByEmail>>);
    vi.mocked(clientsRepo.getFormsByClientId).mockResolvedValue(mockForms as unknown as Form[]);

    const result = await getClientFormsStatus("test@example.com");

    expect(result.inactive).toBe(true);
    expect(result.formsCompleted).toBe(1);
    expect(result.formsStatus![FORM_TYPES[0]].submitted).toBe(true);
    expect(result.formsStatus![FORM_TYPES[1]].activeToken).toBe(true);
  });

  test("SMI submitted stays true after a new SMI token is sent", async () => {
    const now = new Date();
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
        form_type: "SMI",
        submitted_at: new Date(now.getTime() - 10000),
        token_sent_at: new Date(now.getTime() - 20000),
        token_expires_at: new Date(now.getTime() - 10000),
        is_active: false,
        revoked_at: null,
      },
      {
        id: "f2",
        form_type: "SMI",
        submitted_at: null,
        token_sent_at: now,
        token_expires_at: new Date(now.getTime() + 100000),
        is_active: true,
        revoked_at: null,
      },
    ];
    vi.mocked(normalizeUtils.normalizeEmail).mockReturnValue("test@example.com");
    vi.mocked(clientsRepo.findClientByEmail).mockResolvedValue(mockClient as unknown as Awaited<ReturnType<typeof clientsRepo.findClientByEmail>>);
    vi.mocked(clientsRepo.getFormsByClientId).mockResolvedValue(mockForms as unknown as Form[]);

    const result = await getClientFormsStatus("test@example.com");

    expect(result.formsStatus!.SMI.submitted).toBe(true);
    expect(result.formsStatus!.SMI.activeToken).toBe(true);
  });

  test("createClient converts DOB string to Date", async () => {
    const mockClient = {
      id: "1",
      email: "test@example.com",
      name: "Alice",
      dob: new Date("1990-01-01"),
    };
    vi.mocked(clientsRepo.createNewClient).mockResolvedValue(mockClient as unknown as Awaited<ReturnType<typeof clientsRepo.createNewClient>>);
    vi.mocked(normalizeUtils.normalizeEmail).mockReturnValue("test@example.com");

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

    const edScore = YSQ_BOUNDARIES.ED[0];   // 8, at Low boundary for ED
    const ed456Score = 2;                    // well within Low for ED
    const maScore = YSQ_BOUNDARIES.MA[0];   // 12, at Low boundary for MA
    const ma456Score = 4;                   // well within Low for MA

    const mockYsqForm = {
      id: "f1",
      form_type: "YSQ",
      token_sent_at: new Date(),
      token_expires_at: new Date(Date.now() + 10000),
      is_active: true,
      revoked_at: null,
      submitted_at: new Date(),
      ysq_ed_score: edScore,
      ysq_ed_456: ed456Score,
      ysq_ma_score: maScore,
      ysq_ma_456: ma456Score,
      bdi_score: null,
      bai_score: null,
    };

    vi.mocked(normalizeUtils.normalizeEmail).mockReturnValue("alice@example.com");
    vi.mocked(clientsRepo.findClientByEmail).mockResolvedValue(mockClient as unknown as Awaited<ReturnType<typeof clientsRepo.findClientByEmail>>);
    vi.mocked(clientsRepo.getFormsByClientId).mockResolvedValue([mockYsqForm] as unknown as Form[]);

    const result = await getClientFormsStatus("alice@example.com");

    expect(result.scores!.ysq).toEqual({
      ysq_ed_score: `${edScore}-${getScoreCategory("ED", edScore)}`,
      ysq_ma_score: `${maScore}-${getScoreCategory("MA", maScore)}`,
    });
    expect(result.scores!.ysq456).toEqual({
      ysq_ed_456: `${ed456Score}-${getScoreCategory("ED", ed456Score)}`,
      ysq_ma_456: `${ma456Score}-${getScoreCategory("MA", ma456Score)}`,
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
    vi.mocked(normalizeUtils.normalizeEmail).mockReturnValue("test@example.com");
    vi.mocked(clientsRepo.findClientByEmail).mockResolvedValue(mockClient as unknown as Awaited<ReturnType<typeof clientsRepo.findClientByEmail>>);
    vi.mocked(clientsRepo.getFormsByClientId).mockResolvedValue([]);

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
      smi_vc_score: 3,
    };

    vi.mocked(normalizeUtils.normalizeEmail).mockReturnValue("test@example.com");
    vi.mocked(clientsRepo.findClientByEmail).mockResolvedValue(mockClient as unknown as Awaited<ReturnType<typeof clientsRepo.findClientByEmail>>);
    vi.mocked(clientsRepo.getFormsByClientId).mockResolvedValue([mockForm] as unknown as Form[]);

    const result = await getClientFormsStatus("test@example.com");
    expect(result.scores!.smi.smi_q1).toBe("5");
    expect(result.scores!.smi.smi_q2).toBeNull();
    expect(result.scores!.smi.smi_vc_score).toBe(`3-${classifyScore(3, smiBoundaries["smi_vc_score"])}`);
    expect(result.scores!.ysq456).toEqual({});
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
        bai_score: BURNS_BORDERLINE_MAX,
        submitted_at: new Date("2024-01-01"),
        token_sent_at: new Date(),
        token_expires_at: new Date(Date.now() + 10000),
        is_active: true,
        revoked_at: null,
      },
    ];

    vi.mocked(normalizeUtils.normalizeEmail).mockReturnValue("test@example.com");
    vi.mocked(clientsRepo.findClientByEmail).mockResolvedValue(mockClient as unknown as Awaited<ReturnType<typeof clientsRepo.findClientByEmail>>);
    vi.mocked(clientsRepo.getFormsByClientId).mockResolvedValue(mockForms as unknown as Form[]);

    const result = await getClientFormsStatus("test@example.com");

    expect(result.scores!.bdi).toBeNull();
    expect(result.scores!.bai).toEqual({
      bai_score: `${BURNS_BORDERLINE_MAX}-${getBurnsScoreCategory(BURNS_BORDERLINE_MAX)}`,
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
        bdi_score: BECKS_MILD_MAX,
        submitted_at: null,
        token_sent_at: new Date(),
        token_expires_at: new Date(Date.now() + 10000),
        is_active: true,
        revoked_at: null,
      },
    ];

    vi.mocked(normalizeUtils.normalizeEmail).mockReturnValue("test@example.com");
    vi.mocked(clientsRepo.findClientByEmail).mockResolvedValue(mockClient as unknown as Awaited<ReturnType<typeof clientsRepo.findClientByEmail>>);
    vi.mocked(clientsRepo.getFormsByClientId).mockResolvedValue(mockForms as unknown as Form[]);

    const result = await getClientFormsStatus("test@example.com");

    expect(result.scores!.bdi).toEqual({
      bdi_score: `${BECKS_MILD_MAX}-${getBecksScoreCategory(BECKS_MILD_MAX)}`,
      submitted_at: null,
    });
  });
});
