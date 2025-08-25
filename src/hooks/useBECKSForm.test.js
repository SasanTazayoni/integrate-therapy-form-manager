import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import useBecksForm from "./useBecksForm";
import BECKS_ITEMS from "../data/BECKSItems";

describe("useBecksForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("initial state", () => {
    const { result } = renderHook(() => useBecksForm());

    expect(result.current.answers).toEqual({});
    expect(result.current.total).toBe(0);
    expect(result.current.formError).toBeNull();
    expect(result.current.resetModalOpen).toBe(false);
    expect(result.current.resetModalClosing).toBe(false);
    expect(result.current.missingIds).toEqual([]);
  });

  test("handleChange sets an answer and updates total", () => {
    const { result } = renderHook(() => useBecksForm());

    act(() => {
      result.current.handleChange(BECKS_ITEMS[0].id, 2);
    });

    expect(result.current.answers[BECKS_ITEMS[0].id]).toBe(2);
    expect(result.current.total).toBe(2);
  });

  test("handleChange removes answer if val is undefined", () => {
    const { result } = renderHook(() => useBecksForm());

    act(() => {
      result.current.handleChange(BECKS_ITEMS[0].id, 3);
    });
    act(() => {
      result.current.handleChange(BECKS_ITEMS[0].id, undefined);
    });

    expect(result.current.answers[BECKS_ITEMS[0].id]).toBeUndefined();
  });

  test("handleSubmit sets error if missing answers", () => {
    const { result } = renderHook(() => useBecksForm());
    const onValidSubmit = vi.fn();

    act(() => {
      const fakeEvent = { preventDefault: vi.fn() };
      result.current.handleSubmit(onValidSubmit)(fakeEvent);
    });

    expect(result.current.formError).toBe("Please answer all questions");
    expect(result.current.missingIds.length).toBeGreaterThan(0);
    expect(onValidSubmit).not.toHaveBeenCalled();
  });

  test("handleSubmit calls onValidSubmit if all answered", () => {
    const { result } = renderHook(() => useBecksForm());
    const onValidSubmit = vi.fn();

    act(() => {
      BECKS_ITEMS.forEach((item) => {
        result.current.handleChange(item.id, 1);
      });
    });

    act(() => {
      const fakeEvent = { preventDefault: vi.fn() };
      result.current.handleSubmit(onValidSubmit)(fakeEvent);
    });

    expect(result.current.formError).toBeNull();
    expect(result.current.missingIds).toEqual([]);
    expect(onValidSubmit).toHaveBeenCalled();
  });

  test("reset flow opens and confirms reset", () => {
    const { result } = renderHook(() => useBecksForm());

    act(() => {
      result.current.handleChange(BECKS_ITEMS[0].id, 2);
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
  });

  test("cancelReset just triggers modal closing", () => {
    const { result } = renderHook(() => useBecksForm());

    act(() => {
      result.current.cancelReset();
    });

    expect(result.current.resetModalClosing).toBe(true);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("handleChange warns and ignores invalid value", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderHook(() => useBecksForm());

    act(() => {
      result.current.handleChange(BECKS_ITEMS[0].id, 99);
    });

    expect(warnSpy).toHaveBeenCalledWith("Invalid answer value: 99");
    expect(result.current.answers[BECKS_ITEMS[0].id]).toBeUndefined();

    warnSpy.mockRestore();
  });
});
