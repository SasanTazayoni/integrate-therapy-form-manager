import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import useQuestionnaireForm from "./useQuestionnaireForm";

const items = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
];
const validValues = [0, 1, 2, 3] as const;

describe("useQuestionnaireForm", () => {
  describe("initial state", () => {
    test("starts with empty answers, no error, no missing IDs", () => {
      const { result } = renderHook(() =>
        useQuestionnaireForm(items, validValues)
      );
      expect(result.current.answers).toEqual({});
      expect(result.current.formError).toBeNull();
      expect(result.current.missingIds).toEqual([]);
    });

    test("total starts at 0", () => {
      const { result } = renderHook(() =>
        useQuestionnaireForm(items, validValues)
      );
      expect(result.current.total).toBe(0);
    });
  });

  describe("handleChange", () => {
    test("records a valid answer", () => {
      const { result } = renderHook(() =>
        useQuestionnaireForm(items, validValues)
      );
      act(() => result.current.handleChange(1, 2));
      expect(result.current.answers[1]).toBe(2);
    });

    test("updates total when answers change", () => {
      const { result } = renderHook(() =>
        useQuestionnaireForm(items, validValues)
      );
      act(() => {
        result.current.handleChange(1, 1);
        result.current.handleChange(2, 2);
        result.current.handleChange(3, 3);
      });
      expect(result.current.total).toBe(6);
    });

    test("removes answer and does not update total when value is undefined", () => {
      const { result } = renderHook(() =>
        useQuestionnaireForm(items, validValues)
      );
      act(() => result.current.handleChange(1, 2));
      act(() => result.current.handleChange(1, undefined));
      expect(result.current.answers[1]).toBeUndefined();
      expect(result.current.total).toBe(0);
    });

    test("clears item from missingIds when answered", () => {
      const { result } = renderHook(() =>
        useQuestionnaireForm(items, validValues)
      );
      act(() =>
        result.current.handleSubmit(vi.fn())({
          preventDefault: () => {},
        } as React.FormEvent)
      );
      expect(result.current.missingIds).toContain(1);

      act(() => result.current.handleChange(1, 1));
      expect(result.current.missingIds).not.toContain(1);
    });

    test("warns and does not record an invalid answer", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { result } = renderHook(() =>
        useQuestionnaireForm(items, validValues)
      );
      act(() => result.current.handleChange(1, 99));
      expect(warnSpy).toHaveBeenCalledWith("Invalid answer value: 99");
      expect(result.current.answers[1]).toBeUndefined();
      warnSpy.mockRestore();
    });
  });

  describe("handleSubmit", () => {
    test("sets missingIds and formError when questions are unanswered", () => {
      const { result } = renderHook(() =>
        useQuestionnaireForm(items, validValues)
      );
      const onValid = vi.fn();
      act(() =>
        result.current.handleSubmit(onValid)({
          preventDefault: () => {},
        } as React.FormEvent)
      );
      expect(result.current.missingIds).toEqual([1, 2, 3]);
      expect(result.current.formError).toBe("Please answer all questions");
      expect(onValid).not.toHaveBeenCalled();
    });

    test("calls onValidSubmit and clears error when all questions answered", () => {
      const { result } = renderHook(() =>
        useQuestionnaireForm(items, validValues)
      );
      act(() => {
        result.current.handleChange(1, 1);
        result.current.handleChange(2, 2);
        result.current.handleChange(3, 3);
      });
      const onValid = vi.fn();
      act(() =>
        result.current.handleSubmit(onValid)({
          preventDefault: () => {},
        } as React.FormEvent)
      );
      expect(onValid).toHaveBeenCalledOnce();
      expect(result.current.formError).toBeNull();
      expect(result.current.missingIds).toEqual([]);
    });

    test("only lists unanswered items in missingIds", () => {
      const { result } = renderHook(() =>
        useQuestionnaireForm(items, validValues)
      );
      act(() => result.current.handleChange(2, 1));
      act(() =>
        result.current.handleSubmit(vi.fn())({
          preventDefault: () => {},
        } as React.FormEvent)
      );
      expect(result.current.missingIds).toEqual([1, 3]);
    });
  });

  describe("reset flow", () => {
    beforeEach(() => {});

    test("handleResetClick opens the modal", () => {
      const { result } = renderHook(() =>
        useQuestionnaireForm(items, validValues)
      );
      act(() => result.current.handleResetClick());
      expect(result.current.resetModalOpen).toBe(true);
    });

    test("confirmReset clears answers, error, missingIds, and sets closing", () => {
      const { result } = renderHook(() =>
        useQuestionnaireForm(items, validValues)
      );
      act(() => {
        result.current.handleChange(1, 1);
        result.current.handleSubmit(vi.fn())({
          preventDefault: () => {},
        } as React.FormEvent);
      });
      act(() => result.current.confirmReset());
      expect(result.current.answers).toEqual({});
      expect(result.current.formError).toBeNull();
      expect(result.current.missingIds).toEqual([]);
      expect(result.current.resetModalClosing).toBe(true);
    });

    test("cancelReset sets closing without clearing answers", () => {
      const { result } = renderHook(() =>
        useQuestionnaireForm(items, validValues)
      );
      act(() => result.current.handleChange(1, 2));
      act(() => result.current.cancelReset());
      expect(result.current.resetModalClosing).toBe(true);
      expect(result.current.answers[1]).toBe(2);
    });

    test("handleModalCloseFinished closes and un-sets closing flag", () => {
      const { result } = renderHook(() =>
        useQuestionnaireForm(items, validValues)
      );
      act(() => result.current.handleResetClick());
      act(() => result.current.confirmReset());
      act(() => result.current.handleModalCloseFinished());
      expect(result.current.resetModalOpen).toBe(false);
      expect(result.current.resetModalClosing).toBe(false);
    });
  });
});
