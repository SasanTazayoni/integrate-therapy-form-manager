import { renderHook } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { useOutsideClickAndEscape } from "./useOutsideClickAndEscape";

describe("useOutsideClickAndEscape", () => {
  test("calls onClose when clicking outside the element", () => {
    const onClose = vi.fn();
    const div = document.createElement("div");
    document.body.appendChild(div);

    const ref = { current: div };
    renderHook(() => useOutsideClickAndEscape(ref, onClose));

    const outsideDiv = document.createElement("div");
    document.body.appendChild(outsideDiv);

    outsideDiv.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(onClose).toHaveBeenCalled();
  });

  test("does NOT call onClose when clicking inside the element", () => {
    const onClose = vi.fn();
    const div = document.createElement("div");
    document.body.appendChild(div);

    const ref = { current: div };
    renderHook(() => useOutsideClickAndEscape(ref, onClose));

    div.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(onClose).not.toHaveBeenCalled();
  });

  test("calls onClose when pressing Escape key", () => {
    const onClose = vi.fn();
    const ref = { current: null };
    renderHook(() => useOutsideClickAndEscape(ref, onClose));

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(onClose).toHaveBeenCalled();
  });

  test("does NOT call onClose for other keys", () => {
    const onClose = vi.fn();
    const ref = { current: null };
    renderHook(() => useOutsideClickAndEscape(ref, onClose));

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(onClose).not.toHaveBeenCalled();
  });

  test("removes event listeners on unmount", () => {
    const onClose = vi.fn();
    const ref = { current: null };
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = renderHook(() =>
      useOutsideClickAndEscape(ref, onClose)
    );

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));

    removeSpy.mockRestore();
  });
});
