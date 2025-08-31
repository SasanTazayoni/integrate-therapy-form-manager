import { describe, test, expect } from "vitest";
import { getErrorDisplay } from "./getErrorDisplay";

describe("getErrorDisplay", () => {
  test("returns message from response.data.message", () => {
    const err = {
      response: { data: { message: "Server error" } },
    };
    expect(getErrorDisplay(err)).toBe("Server error");
  });

  test("returns error from response.data.error if message missing", () => {
    const err = {
      response: { data: { error: "Validation failed" } },
    };
    expect(getErrorDisplay(err)).toBe("Validation failed");
  });

  test("returns err.message if response.data missing", () => {
    const err = { message: "Network error" };
    expect(getErrorDisplay(err)).toBe("Network error");
  });

  test("appends requestId if present", () => {
    const err = {
      response: { data: { message: "Server error", requestId: "1234" } },
    };
    expect(getErrorDisplay(err)).toBe("Server error (ref: 1234)");
  });

  test("uses fallback message if nothing else is present", () => {
    const err = {};
    expect(getErrorDisplay(err, "Fallback")).toBe("Fallback");
  });

  test("handles AxiosError with undefined fields safely", () => {
    const err = { response: undefined };
    expect(getErrorDisplay(err)).toBe("Something went wrong");
  });
});
