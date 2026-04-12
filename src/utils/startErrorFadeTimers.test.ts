import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import startErrorFadeTimers from "./startErrorFadeTimers";

type TestAction = { type: "FADE" | "CLEAR" | "FADE1" | "CLEAR1" | "FADE2" | "CLEAR2" };
type TimerRef = { current: ReturnType<typeof setTimeout> | null };

describe("startErrorFadeTimers", () => {
  let dispatch: ReturnType<typeof vi.fn>;
  let fadeTimerRef: TimerRef;
  let clearTimerRef: TimerRef;

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
    startErrorFadeTimers<TestAction>(
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
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

    startErrorFadeTimers<TestAction>(
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

    startErrorFadeTimers<TestAction>(
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
