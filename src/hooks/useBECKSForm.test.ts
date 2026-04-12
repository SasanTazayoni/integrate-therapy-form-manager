import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import useBECKSForm from "./useBECKSForm";
import BECKS_ITEMS from "../data/BECKSItems";

describe("useBECKSForm", () => {
  test("uses BECKS_ITEMS — missing IDs count matches item count on empty submit", () => {
    const { result } = renderHook(() => useBECKSForm());
    const mockSubmit = vi.fn();

    act(() => {
      result.current.handleSubmit(mockSubmit)({
        preventDefault: () => {},
      } as React.FormEvent);
    });

    expect(result.current.missingIds.length).toBe(BECKS_ITEMS.length);
  });

  test("valid values are 0–3 — accepts 0 and rejects 4", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderHook(() => useBECKSForm());
    const id = BECKS_ITEMS[0].id;

    act(() => result.current.handleChange(id, 0));
    expect(result.current.answers[id]).toBe(0);

    act(() => result.current.handleChange(id, 4));
    expect(warnSpy).toHaveBeenCalledWith("Invalid answer value: 4");

    warnSpy.mockRestore();
  });
});
