import type { RefObject, Dispatch } from "react";

export default function setErrorTimers(
  dispatch: Dispatch<any>,
  fadeOutAction: string,
  clearAction: string,
  fadeOutDelay = 2500,
  clearDelay = 3000,
  fadeTimerRef: RefObject<number | null>,
  clearTimerRef: RefObject<number | null>
) {
  fadeTimerRef.current = window.setTimeout(() => {
    dispatch({ type: fadeOutAction });
    fadeTimerRef.current = null;
  }, fadeOutDelay);

  clearTimerRef.current = window.setTimeout(() => {
    dispatch({ type: clearAction });
    clearTimerRef.current = null;
  }, clearDelay);
}
