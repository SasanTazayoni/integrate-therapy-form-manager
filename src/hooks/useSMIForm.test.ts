import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import useSMIForm from "./useSMIForm";
import SMIItems from "../data/SMIItems";

describe("useSMIForm", () => {
  test("uses SMIItems — missing IDs count matches item count on empty submit", () => {
    const { result } = renderHook(() => useSMIForm());
    const mockSubmit = vi.fn();

    act(() => {
      result.current.handleSubmit(mockSubmit)({
        preventDefault: () => {},
      } as React.FormEvent);
    });

    expect(result.current.missingIds.length).toBe(SMIItems.length);
  });

  test("valid values are 1–6 — accepts 1, rejects 0", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderHook(() => useSMIForm());
    const id = SMIItems[0].id;

    act(() => result.current.handleChange(id, 1));
    expect(result.current.answers[id]).toBe(1);

    act(() => result.current.handleChange(id, 0));
    expect(warnSpy).toHaveBeenCalledWith("Invalid answer value: 0");

    warnSpy.mockRestore();
  });
});
