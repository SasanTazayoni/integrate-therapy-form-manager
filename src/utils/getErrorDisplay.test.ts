import { describe, test, expect } from "vitest";
import type { AxiosError } from "axios";
import { getErrorDisplay } from "./getErrorDisplay";

type AppAxiosError = AxiosError<{ error?: string }>;
const asAxios = (obj: unknown) => obj as AppAxiosError;

describe("getErrorDisplay", () => {
  test("returns error from response.data.error", () => {
    expect(getErrorDisplay(asAxios({ response: { data: { error: "Validation failed" } } }))).toBe("Validation failed");
  });

  test("returns err.message when there is no response (network error)", () => {
    expect(getErrorDisplay(asAxios({ message: "Network Error" }))).toBe("Network Error");
  });

  test("uses fallback when server responded but no error field", () => {
    expect(getErrorDisplay(asAxios({ response: { data: {} }, message: "Request failed with status code 500" }), "Something went wrong")).toBe("Something went wrong");
  });

  test("uses fallback message if nothing else is present", () => {
    expect(getErrorDisplay(asAxios({}), "Fallback")).toBe("Fallback");
  });

  test("handles AxiosError with undefined fields safely", () => {
    expect(getErrorDisplay(asAxios({ response: undefined }))).toBe("Something went wrong");
  });
});
