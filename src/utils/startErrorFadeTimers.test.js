import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import startErrorFadeTimers from "./startErrorFadeTimers";

describe("startErrorFadeTimers", () => {
  let dispatch;
  let fadeTimerRef;
  let clearTimerRef;

  beforeEach(() => {
    vi.useFakeTimers();
    dispatch = vi.fn();
    fadeTimerRef = { current: null };
    clearTimerRef = { current: null };
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  test("dispatches fadeOut and clear actions at the correct times", () => {
    startErrorFadeTimers(
      dispatch,
      "FADE",
      "CLEAR",
      500,
      1000,
      fadeTimerRef,
      clearTimerRef
    );

    expect(dispatch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: "FADE" });
    expect(fadeTimerRef.current).toBeNull();

    vi.advanceTimersByTime(500);
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenCalledWith({ type: "CLEAR" });
    expect(clearTimerRef.current).toBeNull();
  });

  test("clears previous timers when called again", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

    startErrorFadeTimers(
      dispatch,
      "FADE1",
      "CLEAR1",
      500,
      1000,
      fadeTimerRef,
      clearTimerRef
    );
    const firstFade = fadeTimerRef.current;
    const firstClear = clearTimerRef.current;

    startErrorFadeTimers(
      dispatch,
      "FADE2",
      "CLEAR2",
      500,
      1000,
      fadeTimerRef,
      clearTimerRef
    );

    expect(clearTimeoutSpy).toHaveBeenCalledWith(firstFade);
    expect(clearTimeoutSpy).toHaveBeenCalledWith(firstClear);
  });
});
