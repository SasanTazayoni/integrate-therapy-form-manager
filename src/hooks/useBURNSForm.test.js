import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import useBurnsForm from "./useBurnsForm";
import BURNS_ITEMS from "../data/BURNSItems";

describe("useBurnsForm", () => {
  let firstId;

  beforeEach(() => {
    vi.clearAllMocks();
    firstId = BURNS_ITEMS[0]?.id || "q1";
  });

  test("initial state is correct", () => {
    const { result } = renderHook(() => useBurnsForm());
    expect(result.current.answers).toEqual({});
    expect(result.current.total).toBe(0);
    expect(result.current.formError).toBeNull();
    expect(result.current.missingIds).toEqual([]);
    expect(result.current.resetModalOpen).toBe(false);
    expect(result.current.resetModalClosing).toBe(false);
  });

  test("handleChange sets a valid answer", () => {
    const { result } = renderHook(() => useBurnsForm());

    act(() => {
      result.current.handleChange(firstId, 2);
    });

    expect(result.current.answers[firstId]).toBe(2);
    expect(result.current.missingIds).not.toContain(firstId);
  });

  test("handleChange removes an answer when undefined", () => {
    const { result } = renderHook(() => useBurnsForm());

    act(() => result.current.handleChange(firstId, 1));
    expect(result.current.answers[firstId]).toBe(1);

    act(() => result.current.handleChange(firstId, undefined));
    expect(result.current.answers[firstId]).toBeUndefined();
  });

  test("handleChange ignores invalid values and warns", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderHook(() => useBurnsForm());

    act(() => result.current.handleChange(firstId, 99));

    expect(result.current.answers[firstId]).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith("Invalid answer value: 99");
    consoleSpy.mockRestore();
  });

  test("handleSubmit sets formError when answers are incomplete", () => {
    const { result } = renderHook(() => useBurnsForm());
    const mockSubmit = vi.fn();

    act(() => {
      result.current.handleSubmit(mockSubmit)({ preventDefault: () => {} });
    });

    expect(result.current.formError).toBe("Please answer all questions");
    expect(result.current.missingIds.length).toBeGreaterThan(0);
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test("handleSubmit calls onValidSubmit when all answers are filled", () => {
    const { result } = renderHook(() => useBurnsForm());
    const mockSubmit = vi.fn();

    BURNS_ITEMS.forEach((item) => {
      act(() => result.current.handleChange(item.id, 0));
    });

    act(() =>
      result.current.handleSubmit(mockSubmit)({ preventDefault: () => {} })
    );

    expect(result.current.formError).toBeNull();
    expect(result.current.missingIds).toEqual([]);
    expect(mockSubmit).toHaveBeenCalled();
  });

  test("handleResetClick sets resetModalOpen", () => {
    const { result } = renderHook(() => useBurnsForm());
    act(() => result.current.handleResetClick());
    expect(result.current.resetModalOpen).toBe(true);
  });

  test("confirmReset clears state and opens closing", () => {
    const { result } = renderHook(() => useBurnsForm());

    act(() => result.current.handleChange(firstId, 3));
    expect(result.current.answers[firstId]).toBe(3);

    act(() => result.current.confirmReset());
    expect(result.current.answers).toEqual({});
    expect(result.current.resetModalClosing).toBe(true);
    expect(result.current.formError).toBeNull();
    expect(result.current.missingIds).toEqual([]);
  });

  test("cancelReset sets resetModalClosing", () => {
    const { result } = renderHook(() => useBurnsForm());
    act(() => result.current.cancelReset());
    expect(result.current.resetModalClosing).toBe(true);
  });

  test("handleModalCloseFinished resets modal state", () => {
    const { result } = renderHook(() => useBurnsForm());
    act(() => result.current.handleResetClick());
    act(() => result.current.confirmReset());

    act(() => result.current.handleModalCloseFinished());
    expect(result.current.resetModalOpen).toBe(false);
    expect(result.current.resetModalClosing).toBe(false);
  });
});
