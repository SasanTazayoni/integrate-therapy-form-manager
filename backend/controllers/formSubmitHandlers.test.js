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
import getBurnsScoreCategory from "../utils/burnsScoreUtils";
import { getScoreCategory } from "../utils/YSQScoreUtils";
import { classifyScore, normalizeLabel } from "../utils/SMIScoreUtilsBackend";
import {
  smiBoundaries,
  labelToBoundaryKey,
} from "../data/SMIBoundariesBackend";

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

describe("submitBecksForm", () => {
  let req;
  let res;

  beforeEach(() => {
    vi.clearAllMocks();

    prisma.form = { update: vi.fn() };

    req = { body: { token: "token123", result: "someResult" } };
    res = { json: vi.fn(), status: vi.fn(() => res) };

    validateRequestBodyFields.mockReturnValue({ valid: true });
  });

  test("should successfully submit the Becks form", async () => {
    const mockForm = { id: 1, token: "token123", bdi_score: 10 };
    validateTokenOrFail.mockResolvedValue(mockForm);
    parseAndCombineScore.mockReturnValue(15);
    prisma.form.update.mockResolvedValue({ ...mockForm, bdi_score: 15 });
    mapFormSafe.mockReturnValue({ id: 1, bdi_score: 15 });

    await submitBecksForm(req, res);

    expect(prisma.form.update).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      form: { id: 1, bdi_score: 15 },
    });
  });

  test("should handle errors thrown during submission", async () => {
    validateTokenOrFail.mockRejectedValue(new Error("DB Error"));

    await submitBecksForm(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to submit form",
      code: "SUBMIT_ERROR",
    });
  });

  test("should return early if validation fails", async () => {
    validateRequestBodyFields.mockReturnValue({ valid: false });

    await submitBecksForm(req, res);

    expect(prisma.form.update).not.toHaveBeenCalled();
  });

  test("should return early if token validation returns null", async () => {
    req.body = { token: "token123", result: "someResult" };

    validateTokenOrFail.mockResolvedValue(null);
    await submitBecksForm(req, res);
    expect(prisma.form.update).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe("submitBurnsForm", () => {
  let req;
  let res;

  beforeEach(() => {
    vi.clearAllMocks();

    prisma.form = { update: vi.fn() };

    req = { body: { token: "token123", result: "someResult" } };
    res = { json: vi.fn(), status: vi.fn(() => res) };

    validateRequestBodyFields.mockReturnValue({ valid: true });
  });

  test("should successfully submit the Burns form", async () => {
    const mockForm = { id: 1, token: "token123", bai_score: 10 };
    validateTokenOrFail.mockResolvedValue(mockForm);

    const rawScore = 18;
    const expectedCategory = getBurnsScoreCategory(rawScore);
    const combinedScore = `${rawScore}-${expectedCategory}`;

    parseAndCombineScore.mockReturnValue(combinedScore);
    prisma.form.update.mockResolvedValue({
      ...mockForm,
      bai_score: combinedScore,
    });
    mapFormSafe.mockReturnValue({ id: 1, bai_score: combinedScore });

    await submitBurnsForm(req, res);

    expect(validateTokenOrFail).toHaveBeenCalledWith("token123", res);
    expect(parseAndCombineScore).toHaveBeenCalledWith(
      "someResult",
      getBurnsScoreCategory
    );
    expect(prisma.form.update).toHaveBeenCalledWith({
      where: { token: "token123" },
      data: expect.objectContaining({ bai_score: combinedScore }),
    });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      form: { id: 1, bai_score: combinedScore },
    });
  });

  test("should return early if validation fails", async () => {
    validateRequestBodyFields.mockReturnValue({ valid: false });

    await submitBurnsForm(req, res);

    expect(prisma.form.update).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test("should handle errors thrown during submission", async () => {
    validateTokenOrFail.mockRejectedValue(new Error("DB Error"));

    await submitBurnsForm(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to submit form",
      code: "SUBMIT_ERROR",
    });
  });

  test("should return early if token validation returns null", async () => {
    validateTokenOrFail.mockResolvedValue(null);

    await submitBurnsForm(req, res);

    expect(prisma.form.update).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe("submitYSQForm", () => {
  let req;
  let res;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma.form = { update: vi.fn() };

    req = {
      body: {
        token: "token123",
        scores: { ysq_ed_answers: [1, 2, 3, 4, 5] },
      },
    };
    res = {
      json: vi.fn(),
      status: vi.fn(() => res),
    };

    validateRequestBodyFields.mockReturnValue({ valid: true });
    validateTokenOrFail.mockResolvedValue({ id: 1, token: "token123" });
    getScoreCategory.mockImplementation((_schema, score) => {
      if (score < 5) return "low";
      if (score < 15) return "medium";
      return "high";
    });
  });

  test("should successfully submit the YSQ form", async () => {
    prisma.form.update.mockResolvedValue({ id: 1, token: "token123" });
    mapFormSafe.mockReturnValue({ id: 1, token: "token123" });

    await submitYSQForm(req, res);

    expect(validateTokenOrFail).toHaveBeenCalledWith("token123", res);

    expect(prisma.form.update).toHaveBeenCalledWith({
      where: { token: "token123" },
      data: expect.objectContaining({
        ysq_ed_456: "9-medium",
        ysq_ed_score: "15-high",
      }),
    });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      form: { id: 1, token: "token123" },
    });
  });

  test("should return 400 if scores missing", async () => {
    req.body = { token: "token123" };

    await submitYSQForm(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing required fields",
      code: "MISSING_FIELDS",
    });
  });

  test("should return early if validation fails", async () => {
    validateRequestBodyFields.mockReturnValue({ valid: false });

    await submitYSQForm(req, res);

    expect(prisma.form.update).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test("should return early if token validation returns null", async () => {
    validateTokenOrFail.mockResolvedValue(null);

    await submitYSQForm(req, res);

    expect(prisma.form.update).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test("should handle errors thrown during submission", async () => {
    prisma.form.update.mockRejectedValue(new Error("DB Error"));

    await submitYSQForm(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to submit YSQ form",
      code: "SUBMIT_ERROR",
    });
  });

  test("should handle non-numeric answers and multiple schemas", async () => {
    req.body.scores = {
      ysq_ed_answers: [1, "2", null, undefined, "abc"],
      ysq_ab_answers: [4, 5, 6],
    };

    prisma.form.update.mockResolvedValue({ id: 1, token: "token123" });
    mapFormSafe.mockReturnValue({ id: 1, token: "token123" });

    await submitYSQForm(req, res);

    expect(prisma.form.update).toHaveBeenCalledWith({
      where: { token: "token123" },
      data: expect.objectContaining({
        ysq_ed_score: "3-low",
        ysq_ed_456: "0-low",
        ysq_ab_score: "15-high",
        ysq_ab_456: "15-high",
      }),
    });

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      form: { id: 1, token: "token123" },
    });
  });
});

describe("submitSMIForm", () => {
  let req;
  let res;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma.form = { update: vi.fn() };

    req = {
      body: {
        token: "token123",
        results: {
          smi_depression: { average: 12.34 },
        },
      },
    };
    res = {
      json: vi.fn(),
      status: vi.fn(() => res),
    };

    validateRequestBodyFields.mockReturnValue({ valid: true });
    validateTokenOrFail.mockResolvedValue({ id: 1, token: "token123" });
    classifyScore.mockReturnValue("medium");
  });

  test("should successfully submit SMI form", async () => {
    prisma.form.update.mockResolvedValue({ id: 1, token: "token123" });
    mapFormSafe.mockReturnValue({ id: 1, token: "token123" });

    await submitSMIForm(req, res);

    expect(validateTokenOrFail).toHaveBeenCalledWith("token123", res);
    expect(classifyScore).toHaveBeenCalledWith(
      12.34,
      smiBoundaries.smi_depression
    );
    expect(prisma.form.update).toHaveBeenCalledWith({
      where: { token: "token123" },
      data: expect.objectContaining({
        smi_depression: "12.34-medium",
      }),
    });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      form: { id: 1, token: "token123" },
    });
  });

  test("should return 400 if results missing", async () => {
    req.body = { token: "token123" };

    await submitSMIForm(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid or missing results object",
      code: "MISSING_FIELDS",
    });
  });

  test("should return early if validation fails", async () => {
    validateRequestBodyFields.mockReturnValue({ valid: false });

    await submitSMIForm(req, res);

    expect(prisma.form.update).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test("should return early if token validation fails", async () => {
    validateTokenOrFail.mockResolvedValue(null);

    await submitSMIForm(req, res);

    expect(prisma.form.update).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test("should skip invalid averages (NaN)", async () => {
    req.body.results = { smi_depression: { average: "oops" } };

    prisma.form.update.mockResolvedValue({ id: 1, token: "token123" });
    mapFormSafe.mockReturnValue({ id: 1, token: "token123" });

    await submitSMIForm(req, res);

    expect(classifyScore).not.toHaveBeenCalled();
    expect(prisma.form.update).toHaveBeenCalledWith({
      where: { token: "token123" },
      data: expect.not.objectContaining({ smi_depression: expect.anything() }),
    });
  });

  test("should handle errors during submission", async () => {
    prisma.form.update.mockRejectedValue(new Error("DB Error"));

    await submitSMIForm(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to submit SMI form",
      code: "SUBMIT_ERROR",
    });
  });

  test("should skip keys that normalize but have no boundaries", async () => {
    req.body.results = { Anxiety: { average: 10 } };

    normalizeLabel.mockReturnValue("anxiety");
    prisma.form.update.mockResolvedValue({ id: 1, token: "token123" });
    mapFormSafe.mockReturnValue({ id: 1, token: "token123" });

    await submitSMIForm(req, res);

    expect(normalizeLabel).toHaveBeenCalledWith("Anxiety");
    expect(prisma.form.update).toHaveBeenCalledWith({
      where: { token: "token123" },
      data: expect.not.objectContaining({ smi_anxiety: expect.anything() }),
    });
  });

  test("should skip if normalized key maps to missing smiBoundaries entry", async () => {
    req.body.results = { Stress: { average: 8 } };

    normalizeLabel.mockReturnValue("stress");
    labelToBoundaryKey.stress = "smi_stress";

    prisma.form.update.mockResolvedValue({ id: 1, token: "token123" });
    mapFormSafe.mockReturnValue({ id: 1, token: "token123" });

    await submitSMIForm(req, res);

    expect(normalizeLabel).toHaveBeenCalledWith("Stress");
    expect(prisma.form.update).toHaveBeenCalledWith({
      where: { token: "token123" },
      data: expect.not.objectContaining({ smi_stress: expect.anything() }),
    });
  });
});
