import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import useBurnsForm from "./useBURNSForm";
import BURNS_ITEMS from "../data/BURNSItems";

describe("useBurnsForm", () => {
  test("uses BURNS_ITEMS — missing IDs count matches item count on empty submit", () => {
    const { result } = renderHook(() => useBurnsForm());
    const mockSubmit = vi.fn();

    act(() => {
      result.current.handleSubmit(mockSubmit)({
        preventDefault: () => {},
      } as React.FormEvent);
    });

    expect(result.current.missingIds.length).toBe(BURNS_ITEMS.length);
  });

  test("valid values are 0–3 — accepts 0, rejects 4", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderHook(() => useBurnsForm());
    const id = BURNS_ITEMS[0].id;

    act(() => result.current.handleChange(id, 0));
    expect(result.current.answers[id]).toBe(0);

    act(() => result.current.handleChange(id, 4));
    expect(warnSpy).toHaveBeenCalledWith("Invalid answer value: 4");

    warnSpy.mockRestore();
  });
});
