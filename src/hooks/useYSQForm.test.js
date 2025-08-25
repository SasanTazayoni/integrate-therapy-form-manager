import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import useYSQForm from "./useYSQForm";

vi.mock("../data/YSQEmotionalDeprivation", () => ({
  default: [{ id: 1, text: "Q1" }],
}));
vi.mock("../data/YSQAbandonment", () => ({ default: [{ id: 2, text: "Q2" }] }));
vi.mock("../data/YSQMistrustAbuse", () => ({ default: [] }));
vi.mock("../data/YSQSocialIsolation", () => ({ default: [] }));
vi.mock("../data/YSQDefectiveness", () => ({ default: [] }));
vi.mock("../data/YSQFailure", () => ({ default: [] }));
vi.mock("../data/YSQDependence", () => ({ default: [] }));
vi.mock("../data/YSQVulnerability", () => ({ default: [] }));
vi.mock("../data/YSQEnmeshment", () => ({ default: [] }));
vi.mock("../data/YSQSubjugation", () => ({ default: [] }));
vi.mock("../data/YSQSelfSacrifice", () => ({ default: [] }));
vi.mock("../data/YSQEmotionalInhibition", () => ({ default: [] }));
vi.mock("../data/YSQUnrelentingStandards", () => ({ default: [] }));
vi.mock("../data/YSQEntitlement", () => ({ default: [] }));
vi.mock("../data/YSQInsufficientSelfControl", () => ({ default: [] }));
vi.mock("../data/YSQApprovalSeeking", () => ({ default: [] }));
vi.mock("../data/YSQNegativityPessimism", () => ({ default: [] }));
vi.mock("../data/YSQPunitiveness", () => ({ default: [] }));

describe("useYSQForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("initial state", () => {
    const { result } = renderHook(() => useYSQForm());
    expect(result.current.answers).toEqual({});
    expect(result.current.total).toBe(0);
    expect(result.current.formError).toBeNull();
    expect(result.current.resetModalOpen).toBe(false);
    expect(result.current.resetModalClosing).toBe(false);
    expect(result.current.missingIds).toEqual([]);
  });

  test("handleChange sets a valid answer", () => {
    const { result } = renderHook(() => useYSQForm());
    act(() => {
      result.current.handleChange(1, 4);
    });
    expect(result.current.answers[1]).toBe(4);
    expect(result.current.total).toBe(4);
  });

  test("handleChange removes answer when val is undefined", () => {
    const { result } = renderHook(() => useYSQForm());
    act(() => {
      result.current.handleChange(1, 3);
    });
    expect(result.current.answers[1]).toBe(3);
    act(() => {
      result.current.handleChange(1, undefined);
    });
    expect(result.current.answers[1]).toBeUndefined();
  });

  test("handleChange warns and ignores invalid value", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderHook(() => useYSQForm());
    act(() => {
      result.current.handleChange(1, 99);
    });
    expect(warnSpy).toHaveBeenCalledWith("Invalid YSQ answer value: 99");
    expect(result.current.answers[1]).toBeUndefined();
    warnSpy.mockRestore();
  });

  test("handleSubmit sets error if unanswered", () => {
    const { result } = renderHook(() => useYSQForm());
    const fakeSubmit = vi.fn();

    act(() => {
      result.current.handleSubmit(fakeSubmit)({ preventDefault: vi.fn() });
    });

    expect(result.current.formError).toBe("Please answer all questions");
    expect(result.current.missingIds).toEqual([1, 2]);
    expect(fakeSubmit).not.toHaveBeenCalled();
  });

  test("handleSubmit calls onValidSubmit when all answered", () => {
    const { result } = renderHook(() => useYSQForm());
    const fakeSubmit = vi.fn();

    act(() => {
      result.current.handleChange(1, 2);
      result.current.handleChange(2, 3);
    });

    act(() => {
      result.current.handleSubmit(fakeSubmit)({ preventDefault: vi.fn() });
    });

    expect(result.current.formError).toBeNull();
    expect(result.current.missingIds).toEqual([]);
    expect(fakeSubmit).toHaveBeenCalled();
  });

  test("reset flow works", () => {
    const { result } = renderHook(() => useYSQForm());

    act(() => {
      result.current.handleChange(1, 5);
      result.current.handleResetClick();
    });
    expect(result.current.resetModalOpen).toBe(true);

    act(() => {
      result.current.confirmReset();
    });
    expect(result.current.answers).toEqual({});
    expect(result.current.resetModalClosing).toBe(true);

    act(() => {
      result.current.handleModalCloseFinished();
    });
    expect(result.current.resetModalOpen).toBe(false);
    expect(result.current.resetModalClosing).toBe(false);

    act(() => {
      result.current.cancelReset();
    });
    expect(result.current.resetModalClosing).toBe(true);
  });
});
