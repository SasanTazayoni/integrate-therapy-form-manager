import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { initializeRippleEffect } from "./ripple"; // adjust path

describe("initializeRippleEffect", () => {
  let button: HTMLButtonElement;

  beforeEach(() => {
    button = document.createElement("button");
    document.body.appendChild(button);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.useRealTimers();
  });

  test("adds a ripple span on mouseover and removes it after 600ms", () => {
    vi.useFakeTimers();

    initializeRippleEffect(button);

    const event = new MouseEvent("mouseover", {
      bubbles: true,
      clientX: 10,
      clientY: 10,
    });

    button.dispatchEvent(event);

    const ripple = button.querySelector("span");
    expect(ripple).toBeTruthy();
    expect(ripple?.style.left).toBe("10px");
    expect(ripple?.style.top).toBe("10px");

    vi.advanceTimersByTime(600);

    expect(button.querySelector("span")).toBeNull();
  });

  test("does not create ripple if event target is not the button", () => {
    vi.useFakeTimers();

    initializeRippleEffect(button);

    const fakeTarget = document.createElement("div");
    const event = new MouseEvent("mouseover", {
      bubbles: true,
      clientX: 10,
      clientY: 10,
    });

    Object.defineProperty(event, "target", {
      value: fakeTarget,
      writable: true,
    });

    button.dispatchEvent(event);

    expect(button.querySelector("span")).toBeNull();
  });
});
