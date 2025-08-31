import { describe, test, expect } from "vitest";
import { authReducer } from "./authReducer";

const initialState = {
  username: "",
  password: "",
  authenticated: false,
  error: "",
  closing: false,
  errorFading: false,
};

describe("authReducer", () => {
  test("SET_USERNAME updates username", () => {
    const state = authReducer(initialState, {
      type: "SET_USERNAME",
      payload: "user1",
    });
    expect(state.username).toBe("user1");
  });

  test("SET_PASSWORD updates password", () => {
    const state = authReducer(initialState, {
      type: "SET_PASSWORD",
      payload: "pass123",
    });
    expect(state.password).toBe("pass123");
  });

  test("LOGIN_SUCCESS sets authenticated true and clears error/flags", () => {
    const state = authReducer(
      {
        ...initialState,
        error: "some error",
        closing: true,
        errorFading: true,
      },
      { type: "LOGIN_SUCCESS" }
    );
    expect(state.authenticated).toBe(true);
    expect(state.error).toBe("");
    expect(state.closing).toBe(false);
    expect(state.errorFading).toBe(false);
  });

  test("SET_ERROR sets error with payload", () => {
    const state = authReducer(initialState, {
      type: "SET_ERROR",
      payload: "Custom error",
    });
    expect(state.error).toBe("Custom error");
    expect(state.errorFading).toBe(false);
  });

  test("SET_ERROR sets default error if no payload", () => {
    const state = authReducer(initialState, { type: "SET_ERROR" });
    expect(state.error).toBe("Invalid credentials");
    expect(state.errorFading).toBe(false);
  });

  test("BEGIN_ERROR_FADE_OUT sets errorFading true", () => {
    const state = authReducer(initialState, { type: "BEGIN_ERROR_FADE_OUT" });
    expect(state.errorFading).toBe(true);
  });

  test("BEGIN_MODAL_CLOSE sets closing true", () => {
    const state = authReducer(initialState, { type: "BEGIN_MODAL_CLOSE" });
    expect(state.closing).toBe(true);
  });

  test("CLEAR_FORM resets state to initial", () => {
    const modifiedState = {
      username: "user",
      password: "pass",
      authenticated: true,
      error: "error",
      closing: true,
      errorFading: true,
    };
    const state = authReducer(modifiedState, { type: "CLEAR_FORM" });
    expect(state).toEqual({
      username: "",
      password: "",
      authenticated: true,
      error: "",
      closing: false,
      errorFading: false,
    });
  });

  test("CLEAR_ERROR resets error and errorFading", () => {
    const modifiedState = { ...initialState, error: "oops", errorFading: true };
    const state = authReducer(modifiedState, { type: "CLEAR_ERROR" });
    expect(state.error).toBe("");
    expect(state.errorFading).toBe(false);
  });

  test("unknown action returns current state", () => {
    const state = authReducer(initialState, { type: "UNKNOWN" });
    expect(state).toBe(initialState);
  });
});
