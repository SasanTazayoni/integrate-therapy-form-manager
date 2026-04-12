import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import useYSQForm from "./useYSQForm";

vi.mock("../data/YSQAllItems", () => ({
  default: [
    { id: 1, prompt: "Q1", options: [], category: "test" },
    { id: 2, prompt: "Q2", options: [], category: "test" },
  ],
}));

describe("useYSQForm", () => {
  test("uses YSQAllItems — missing IDs count matches item count on empty submit", () => {
    const { result } = renderHook(() => useYSQForm());
    const mockSubmit = vi.fn();

    act(() => {
      result.current.handleSubmit(mockSubmit)({
        preventDefault: () => {},
      } as React.FormEvent);
    });

    expect(result.current.missingIds).toEqual([1, 2]);
  });

  test("valid values are 1–6 — accepts 1, rejects 0", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderHook(() => useYSQForm());

    act(() => result.current.handleChange(1, 1));
    expect(result.current.answers[1]).toBe(1);

    act(() => result.current.handleChange(1, 0));
    expect(warnSpy).toHaveBeenCalledWith("Invalid answer value: 0");

    warnSpy.mockRestore();
  });
});
