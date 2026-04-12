import { describe, test, expect } from "vitest";
import type { AxiosError } from "axios";
import { getErrorDisplay } from "./getErrorDisplay";

type AppAxiosError = AxiosError<{ message?: string; error?: string; requestId?: string }>;
const asAxios = (obj: unknown) => obj as AppAxiosError;

describe("getErrorDisplay", () => {
  test("returns message from response.data.message", () => {
    expect(getErrorDisplay(asAxios({ response: { data: { message: "Server error" } } }))).toBe("Server error");
  });

  test("returns error from response.data.error if message missing", () => {
    expect(getErrorDisplay(asAxios({ response: { data: { error: "Validation failed" } } }))).toBe("Validation failed");
  });

  test("returns err.message if response.data missing", () => {
    expect(getErrorDisplay(asAxios({ message: "Network error" }))).toBe("Network error");
  });

  test("appends requestId if present", () => {
    expect(
      getErrorDisplay(asAxios({ response: { data: { message: "Server error", requestId: "1234" } } }))
    ).toBe("Server error (ref: 1234)");
  });

  test("uses fallback message if nothing else is present", () => {
    expect(getErrorDisplay(asAxios({}), "Fallback")).toBe("Fallback");
  });

  test("handles AxiosError with undefined fields safely", () => {
    expect(getErrorDisplay(asAxios({ response: undefined }))).toBe("Something went wrong");
  });
});
