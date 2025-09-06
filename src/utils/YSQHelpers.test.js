import { describe, test, expect, vi, beforeEach } from "vitest";
import {
  normalizeCode,
  extractNumber,
  extractRating,
  shouldHighlight,
  getHighlightLevel,
  submitYSQWithToken,
} from "./YSQHelpers";
import { submitYSQForm } from "../api/formsFrontend";

vi.mock("../api/formsFrontend", () => ({
  submitYSQForm: vi.fn(),
}));

describe("YSQHelpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("normalizeCode returns lowercase before slash", () => {
    expect(normalizeCode("ED/123")).toBe("ed");
    expect(normalizeCode("AB")).toBe("ab");
    expect(normalizeCode("MA/xyz")).toBe("ma");
  });

  test("extractNumber extracts digits at start of string", () => {
    expect(extractNumber("25-Medium")).toBe("25");
    expect(extractNumber("100-High")).toBe("100");
    expect(extractNumber("0-Low")).toBe("0");
    expect(extractNumber("NoNumber")).toBe("");
    expect(extractNumber(null)).toBe("");
    expect(extractNumber(undefined)).toBe("");
  });

  test("extractRating extracts text after dash", () => {
    expect(extractRating("25-Medium")).toBe("Medium");
    expect(extractRating("40-High")).toBe("High");
    expect(extractRating("5-Severe")).toBe("Severe");
    expect(extractRating("NoDash")).toBe("");
    expect(extractRating(null)).toBe("");
    expect(extractRating(undefined)).toBe("");
  });

  test("shouldHighlight detects high severity ratings", () => {
    expect(shouldHighlight("High")).toBe(true);
    expect(shouldHighlight("Very High")).toBe(true);
    expect(shouldHighlight("Severe")).toBe(false);
    expect(shouldHighlight("Medium")).toBe(false);
    expect(shouldHighlight("Low")).toBe(false);
    expect(shouldHighlight("")).toBe(false);
  });

  test("getHighlightLevel returns correct highlight level", () => {
    expect(getHighlightLevel("Severe")).toBe("severe");
    expect(getHighlightLevel("High")).toBe("highlight");
    expect(getHighlightLevel("Very High")).toBe("highlight");
    expect(getHighlightLevel("Medium")).toBe("none");
    expect(getHighlightLevel("Low")).toBe("none");
    expect(getHighlightLevel("")).toBe("none");
  });

  test("submitYSQWithToken sets error if token missing", async () => {
    const setFormError = vi.fn();
    const setShowInvalidTokenModal = vi.fn();
    const navigate = vi.fn();

    await submitYSQWithToken({
      answers: {},
      schemas: [],
      setFormError,
      setShowInvalidTokenModal,
      navigate,
    });

    expect(setFormError).toHaveBeenCalledWith("Token missing");
    expect(setShowInvalidTokenModal).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  test("submitYSQWithToken calls submitYSQForm and navigates on success", async () => {
    const setFormError = vi.fn();
    const setShowInvalidTokenModal = vi.fn();
    const navigate = vi.fn();

    submitYSQForm.mockResolvedValue({ ok: true });

    const schemas = [
      { key: "ed", label: "Emotional Deprivation", data: [{ id: "q1" }] },
    ];
    const answers = { q1: 5 };

    await submitYSQWithToken({
      token: "token123",
      answers,
      schemas,
      setFormError,
      setShowInvalidTokenModal,
      navigate,
    });

    expect(submitYSQForm).toHaveBeenCalledWith({
      token: "token123",
      scores: { ysq_ed_answers: [5] },
    });
    expect(setFormError).toHaveBeenCalledWith("");
    expect(navigate).toHaveBeenCalledWith("/submitted");
    expect(setShowInvalidTokenModal).not.toHaveBeenCalled();
  });

  test("submitYSQWithToken handles INVALID_TOKEN error", async () => {
    const setFormError = vi.fn();
    const setShowInvalidTokenModal = vi.fn();
    const navigate = vi.fn();

    submitYSQForm.mockResolvedValue({
      ok: false,
      code: "INVALID_TOKEN",
      error: "Invalid token",
    });

    await submitYSQWithToken({
      token: "token123",
      answers: {},
      schemas: [],
      setFormError,
      setShowInvalidTokenModal,
      navigate,
    });

    expect(setShowInvalidTokenModal).toHaveBeenCalledWith(true);
    expect(setFormError).not.toHaveBeenCalledWith("");
    expect(navigate).not.toHaveBeenCalled();
  });

  test("submitYSQWithToken handles other errors with provided message", async () => {
    const setFormError = vi.fn();
    const setShowInvalidTokenModal = vi.fn();
    const navigate = vi.fn();

    submitYSQForm.mockResolvedValue({
      ok: false,
      code: "OTHER_ERROR",
      error: "Some error",
    });

    await submitYSQWithToken({
      token: "token123",
      answers: {},
      schemas: [],
      setFormError,
      setShowInvalidTokenModal,
      navigate,
    });

    expect(setFormError).toHaveBeenCalledWith("Some error");
    expect(setShowInvalidTokenModal).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  test("submitYSQWithToken handles other errors with default message if error undefined", async () => {
    const setFormError = vi.fn();
    const setShowInvalidTokenModal = vi.fn();
    const navigate = vi.fn();

    submitYSQForm.mockResolvedValue({
      ok: false,
      code: "OTHER_ERROR",
      error: undefined,
    });

    await submitYSQWithToken({
      token: "token123",
      answers: {},
      schemas: [],
      setFormError,
      setShowInvalidTokenModal,
      navigate,
    });

    expect(setFormError).toHaveBeenCalledWith("Failed to submit the YSQ form.");
    expect(setShowInvalidTokenModal).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  test("submitYSQWithToken converts missing or undefined answers to 0 using Number()", async () => {
    const setFormError = vi.fn();
    const setShowInvalidTokenModal = vi.fn();
    const navigate = vi.fn();

    submitYSQForm.mockResolvedValue({ ok: true });

    const schemas = [
      {
        key: "ed",
        label: "Emotional Deprivation",
        data: [{ id: "q1" }, { id: "q2" }],
      },
    ];
    const answers = { q1: 5 };

    await submitYSQWithToken({
      token: "token123",
      answers,
      schemas,
      setFormError,
      setShowInvalidTokenModal,
      navigate,
    });

    expect(submitYSQForm).toHaveBeenCalledWith({
      token: "token123",
      scores: { ysq_ed_answers: [5, 0] },
    });
    expect(setFormError).toHaveBeenCalledWith("");
    expect(navigate).toHaveBeenCalledWith("/submitted");
  });
});
