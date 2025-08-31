import { describe, test, expect } from "vitest";
import { clientInfoReducer, modalInitialState } from "./clientInfoReducer";

describe("clientInfoReducer", () => {
  test("returns initial state for unknown action", () => {
    const state = clientInfoReducer(modalInitialState, { type: "UNKNOWN" });
    expect(state).toEqual(modalInitialState);
  });

  test("sets name when action is SET_NAME", () => {
    const newState = clientInfoReducer(modalInitialState, {
      type: "SET_NAME",
      payload: "Alice",
    });
    expect(newState.name).toBe("Alice");
  });

  test("sets dob when action is SET_DOB", () => {
    const newState = clientInfoReducer(modalInitialState, {
      type: "SET_DOB",
      payload: "2000-01-01",
    });
    expect(newState.dob).toBe("2000-01-01");
  });

  test("sets error and resets errorFading when action is SET_ERROR", () => {
    const newState = clientInfoReducer(modalInitialState, {
      type: "SET_ERROR",
      payload: "Invalid input",
    });
    expect(newState.error).toBe("Invalid input");
    expect(newState.errorFading).toBe(false);
  });

  test("sets errorFading to true when action is BEGIN_ERROR_FADE_OUT", () => {
    const newState = clientInfoReducer(modalInitialState, {
      type: "BEGIN_ERROR_FADE_OUT",
    });
    expect(newState.errorFading).toBe(true);
  });

  test("clears error and resets errorFading when action is CLEAR_ERROR", () => {
    const stateWithError = {
      ...modalInitialState,
      error: "Some error",
      errorFading: true,
    };
    const newState = clientInfoReducer(stateWithError, { type: "CLEAR_ERROR" });
    expect(newState.error).toBe("");
    expect(newState.errorFading).toBe(false);
  });
});
