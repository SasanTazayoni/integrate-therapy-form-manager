import type { RefObject, Dispatch } from "react";

export default function setErrorTimers<ActionType extends { type: string }>(
  dispatch: Dispatch<ActionType>,
  fadeOutAction: ActionType["type"],
  clearAction: ActionType["type"],
  fadeOutDelay = 2500,
  clearDelay = 3000,
  fadeTimerRef: RefObject<number | null>,
  clearTimerRef: RefObject<number | null>
) {
  if (fadeTimerRef.current != null) {
    clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = null;
  }
  if (clearTimerRef.current != null) {
    clearTimeout(clearTimerRef.current);
    clearTimerRef.current = null;
  }

  fadeTimerRef.current = window.setTimeout(() => {
    dispatch({ type: fadeOutAction } as ActionType);
    fadeTimerRef.current = null;
  }, fadeOutDelay);

  clearTimerRef.current = window.setTimeout(() => {
    dispatch({ type: clearAction } as ActionType);
    clearTimerRef.current = null;
  }, clearDelay);
}
