import { describe, test, expect, vi, beforeEach } from "vitest";
import prisma from "../prisma/client";
import {
  submitBecksForm,
  submitBurnsForm,
  submitYSQForm,
  submitSMIForm,
} from "./formSubmitHandlers";
import { validateTokenOrFail } from "./formControllerHelpers/formTokenHelpers";
import { validateRequestBodyFields } from "../utils/validationUtils";
import { parseAndCombineScore } from "../utils/scoreUtils";
import { mapFormSafe } from "../utils/formHelpers";
import getBecksScoreCategory from "../utils/becksScoreUtils";
import getBurnsScoreCategory from "../utils/burnsScoreUtils";
import { getScoreCategory } from "../utils/YSQScoreUtils";
import { classifyScore, normalizeLabel } from "../utils/SMIScoreUtilsBackend";
import {
  smiBoundaries,
  labelToBoundaryKey,
} from "../data/SMIBoundariesBackend";
import type { Request, Response } from "express";

vi.mock("../prisma/client");
vi.mock("./formControllerHelpers/formTokenHelpers");
vi.mock("../utils/scoreUtils");
vi.mock("../utils/formHelpers");
vi.mock("../utils/validationUtils");
vi.mock("../utils/YSQScoreUtils");
vi.mock("../utils/SMIScoreUtilsBackend");
vi.mock("../data/SMIBoundariesBackend", async () => {
  return {
    smiBoundaries: {
      smi_depression: { low: 0, medium: 10, high: 20 },
    },
    labelToBoundaryKey: {},
  };
});
vi.mock("../utils/SMIScoreUtilsBackend", () => ({
  normalizeLabel: vi.fn(),
  classifyScore: vi.fn(),
}));

const mockPrisma = prisma as unknown as {
  form: { update: ReturnType<typeof vi.fn> };
};

describe("submitScoreForm (shared factory behaviour)", () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.form = { update: vi.fn() };
    req = { body: { token: "token123", result: "someResult" } } as unknown as Request;
    res = { json: vi.fn(), status: vi.fn().mockReturnThis() } as unknown as Response;
    vi.mocked(validateRequestBodyFields).mockReturnValue({ valid: true });
    vi.mocked(validateTokenOrFail).mockResolvedValue({ id: 1, token: "token123" } as never);
  });

  test("returns early if field validation fails", async () => {
    vi.mocked(validateRequestBodyFields).mockReturnValue({ valid: false });
    await submitBecksForm(req, res);
    expect(mockPrisma.form.update).not.toHaveBeenCalled();
  });

  test("returns early if token validation returns null", async () => {
    vi.mocked(validateTokenOrFail).mockResolvedValue(null as never);
    await submitBecksForm(req, res);
    expect(mockPrisma.form.update).not.toHaveBeenCalled();
    expect((res.json as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
  });

  test("returns 500 on unexpected error", async () => {
    vi.mocked(validateTokenOrFail).mockRejectedValue(new Error("DB Error"));
    await submitBecksForm(req, res);
    expect((res.status as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(500);
    expect((res.json as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith({
      error: "Failed to submit form",
      code: "SUBMIT_ERROR",
    });
  });

  test("submitBecksForm writes bdi_score and calls getBecksScoreCategory", async () => {
    const combinedScore = "10-Minimal depression";
    vi.mocked(parseAndCombineScore).mockReturnValue(combinedScore);
    mockPrisma.form.update.mockResolvedValue({ id: 1 });
    vi.mocked(mapFormSafe).mockReturnValue({ id: 1 } as never);

    await submitBecksForm(req, res);

    expect(vi.mocked(parseAndCombineScore)).toHaveBeenCalledWith("someResult", getBecksScoreCategory);
    expect(mockPrisma.form.update).toHaveBeenCalledWith({
      where: { token: "token123" },
      data: expect.objectContaining({ bdi_score: combinedScore }),
    });
    expect((res.json as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith({ success: true, form: { id: 1 } });
  });

  test("submitBurnsForm writes bai_score and calls getBurnsScoreCategory", async () => {
    const combinedScore = "18-Mild anxiety";
    vi.mocked(parseAndCombineScore).mockReturnValue(combinedScore);
    mockPrisma.form.update.mockResolvedValue({ id: 1 });
    vi.mocked(mapFormSafe).mockReturnValue({ id: 1 } as never);

    await submitBurnsForm(req, res);

    expect(vi.mocked(parseAndCombineScore)).toHaveBeenCalledWith("someResult", getBurnsScoreCategory);
    expect(mockPrisma.form.update).toHaveBeenCalledWith({
      where: { token: "token123" },
      data: expect.objectContaining({ bai_score: combinedScore }),
    });
    expect((res.json as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith({ success: true, form: { id: 1 } });
  });
});

describe("submitYSQForm", () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.form = { update: vi.fn() };

    req = {
      body: {
        token: "token123",
        scores: { ysq_ed_answers: [1, 2, 3, 4, 5] },
      },
    } as unknown as Request;
    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    } as unknown as Response;

    vi.mocked(validateRequestBodyFields).mockReturnValue({ valid: true });
    vi.mocked(validateTokenOrFail).mockResolvedValue({ id: 1, token: "token123" } as never);
    vi.mocked(getScoreCategory).mockImplementation((_schema, score) => {
      if (score < 5) return "low";
      if (score < 15) return "medium";
      return "high";
    });
  });

  test("should successfully submit the YSQ form", async () => {
    mockPrisma.form.update.mockResolvedValue({ id: 1, token: "token123" });
    vi.mocked(mapFormSafe).mockReturnValue({ id: 1, token: "token123" } as unknown as ReturnType<typeof mapFormSafe>);

    await submitYSQForm(req, res);

    expect(vi.mocked(validateTokenOrFail)).toHaveBeenCalledWith("token123", res);

    expect(mockPrisma.form.update).toHaveBeenCalledWith({
      where: { token: "token123" },
      data: expect.objectContaining({
        ysq_ed_456: "9-medium",
        ysq_ed_score: "15-high",
      }),
    });
    expect((res.json as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith({
      success: true,
      form: { id: 1, token: "token123" },
    });
  });

  test("should return 400 if scores missing", async () => {
    req.body = { token: "token123" };

    await submitYSQForm(req, res);

    expect((res.status as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(400);
    expect((res.json as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith({
      error: "Missing required fields",
      code: "MISSING_FIELDS",
    });
  });

  test("should return early if validation fails", async () => {
    vi.mocked(validateRequestBodyFields).mockReturnValue({ valid: false });

    await submitYSQForm(req, res);

    expect(mockPrisma.form.update).not.toHaveBeenCalled();
    expect((res.json as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
  });

  test("should return early if token validation returns null", async () => {
    vi.mocked(validateTokenOrFail).mockResolvedValue(null as never);

    await submitYSQForm(req, res);

    expect(mockPrisma.form.update).not.toHaveBeenCalled();
    expect((res.json as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
  });

  test("should handle errors thrown during submission", async () => {
    mockPrisma.form.update.mockRejectedValue(new Error("DB Error"));

    await submitYSQForm(req, res);

    expect((res.status as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(500);
    expect((res.json as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith({
      error: "Failed to submit YSQ form",
      code: "SUBMIT_ERROR",
    });
  });

  test("should handle non-numeric answers and multiple schemas", async () => {
    req.body.scores = {
      ysq_ed_answers: [1, "2", null, undefined, "abc"],
      ysq_ab_answers: [4, 5, 6],
    };

    mockPrisma.form.update.mockResolvedValue({ id: 1, token: "token123" });
    vi.mocked(mapFormSafe).mockReturnValue({ id: 1, token: "token123" } as unknown as ReturnType<typeof mapFormSafe>);

    await submitYSQForm(req, res);

    expect(mockPrisma.form.update).toHaveBeenCalledWith({
      where: { token: "token123" },
      data: expect.objectContaining({
        ysq_ed_score: "3-low",
        ysq_ed_456: "0-low",
        ysq_ab_score: "15-high",
        ysq_ab_456: "15-high",
      }),
    });

    expect((res.json as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith({
      success: true,
      form: { id: 1, token: "token123" },
    });
  });
});

describe("submitSMIForm", () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.form = { update: vi.fn() };

    req = {
      body: {
        token: "token123",
        results: {
          smi_depression: { average: 12.34 },
        },
      },
    } as unknown as Request;
    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    } as unknown as Response;

    vi.mocked(validateRequestBodyFields).mockReturnValue({ valid: true });
    vi.mocked(validateTokenOrFail).mockResolvedValue({ id: 1, token: "token123" } as never);
    vi.mocked(classifyScore).mockReturnValue("medium");
  });

  test("should successfully submit SMI form", async () => {
    mockPrisma.form.update.mockResolvedValue({ id: 1, token: "token123" });
    vi.mocked(mapFormSafe).mockReturnValue({ id: 1, token: "token123" } as unknown as ReturnType<typeof mapFormSafe>);

    await submitSMIForm(req, res);

    expect(vi.mocked(validateTokenOrFail)).toHaveBeenCalledWith("token123", res);
    expect(vi.mocked(classifyScore)).toHaveBeenCalledWith(
      12.34,
      smiBoundaries.smi_depression
    );
    expect(mockPrisma.form.update).toHaveBeenCalledWith({
      where: { token: "token123" },
      data: expect.objectContaining({
        smi_depression: "12.34-medium",
      }),
    });
    expect((res.json as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith({
      success: true,
      form: { id: 1, token: "token123" },
    });
  });

  test("should return 400 if results missing", async () => {
    req.body = { token: "token123" };

    await submitSMIForm(req, res);

    expect((res.status as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(400);
    expect((res.json as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith({
      error: "Invalid or missing results object",
      code: "MISSING_FIELDS",
    });
  });

  test("should return early if validation fails", async () => {
    vi.mocked(validateRequestBodyFields).mockReturnValue({ valid: false });

    await submitSMIForm(req, res);

    expect(mockPrisma.form.update).not.toHaveBeenCalled();
    expect((res.json as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
  });

  test("should return early if token validation fails", async () => {
    vi.mocked(validateTokenOrFail).mockResolvedValue(null as never);

    await submitSMIForm(req, res);

    expect(mockPrisma.form.update).not.toHaveBeenCalled();
    expect((res.json as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
  });

  test("should skip invalid averages (NaN)", async () => {
    req.body.results = { smi_depression: { average: "oops" } };

    mockPrisma.form.update.mockResolvedValue({ id: 1, token: "token123" });
    vi.mocked(mapFormSafe).mockReturnValue({ id: 1, token: "token123" } as unknown as ReturnType<typeof mapFormSafe>);

    await submitSMIForm(req, res);

    expect(vi.mocked(classifyScore)).not.toHaveBeenCalled();
    expect(mockPrisma.form.update).toHaveBeenCalledWith({
      where: { token: "token123" },
      data: expect.not.objectContaining({ smi_depression: expect.anything() }),
    });
  });

  test("should handle errors during submission", async () => {
    mockPrisma.form.update.mockRejectedValue(new Error("DB Error"));

    await submitSMIForm(req, res);

    expect((res.status as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(500);
    expect((res.json as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith({
      error: "Failed to submit SMI form",
      code: "SUBMIT_ERROR",
    });
  });

  test("should skip keys that normalize but have no boundaries", async () => {
    req.body.results = { Anxiety: { average: 10 } };

    vi.mocked(normalizeLabel).mockReturnValue("anxiety");
    mockPrisma.form.update.mockResolvedValue({ id: 1, token: "token123" });
    vi.mocked(mapFormSafe).mockReturnValue({ id: 1, token: "token123" } as unknown as ReturnType<typeof mapFormSafe>);

    await submitSMIForm(req, res);

    expect(vi.mocked(normalizeLabel)).toHaveBeenCalledWith("Anxiety");
    expect(mockPrisma.form.update).toHaveBeenCalledWith({
      where: { token: "token123" },
      data: expect.not.objectContaining({ smi_anxiety: expect.anything() }),
    });
  });

  test("should succeed with empty results object and call update with no smi fields", async () => {
    req.body.results = {};

    mockPrisma.form.update.mockResolvedValue({ id: 1, token: "token123" });
    vi.mocked(mapFormSafe).mockReturnValue({ id: 1, token: "token123" } as unknown as ReturnType<typeof mapFormSafe>);

    await submitSMIForm(req, res);

    expect(vi.mocked(classifyScore)).not.toHaveBeenCalled();
    expect(mockPrisma.form.update).toHaveBeenCalledWith({
      where: { token: "token123" },
      data: expect.not.objectContaining({ smi_depression: expect.anything() }),
    });
    expect((res.json as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith({
      success: true,
      form: { id: 1, token: "token123" },
    });
  });

  test("should skip if normalized key maps to missing smiBoundaries entry", async () => {
    req.body.results = { Stress: { average: 8 } };

    vi.mocked(normalizeLabel).mockReturnValue("stress");
    labelToBoundaryKey.stress = "smi_stress";

    mockPrisma.form.update.mockResolvedValue({ id: 1, token: "token123" });
    vi.mocked(mapFormSafe).mockReturnValue({ id: 1, token: "token123" } as unknown as ReturnType<typeof mapFormSafe>);

    await submitSMIForm(req, res);

    expect(vi.mocked(normalizeLabel)).toHaveBeenCalledWith("Stress");
    expect(mockPrisma.form.update).toHaveBeenCalledWith({
      where: { token: "token123" },
      data: expect.not.objectContaining({ smi_stress: expect.anything() }),
    });
  });
});
