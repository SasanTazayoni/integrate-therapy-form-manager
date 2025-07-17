import {
  createTokenGenerationError,
  createMagicLinkSendingError,
  isTypedError,
} from "./errors";
import { describe, test, expect } from "vitest";

describe("Error utilities", () => {
  test("createTokenGenerationError creates error with correct type and message", () => {
    const err = createTokenGenerationError("fail message");
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe("fail message");
    expect(err.type).toBe("TokenGenerationError");
  });

  test("createTokenGenerationError uses default message", () => {
    const err = createTokenGenerationError();
    expect(err.message).toBe("Token generation failed");
  });

  test("createMagicLinkSendingError creates error with correct type and message", () => {
    const err = createMagicLinkSendingError("magic link fail");
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe("magic link fail");
    expect(err.type).toBe("MagicLinkSendingError");
  });

  test("createMagicLinkSendingError uses default message", () => {
    const err = createMagicLinkSendingError();
    expect(err.message).toBe("Magic link sending failed");
  });

  test("isTypedError returns true for error with type property", () => {
    const err = createTokenGenerationError();
    expect(isTypedError(err)).toBe(true);
  });

  test("isTypedError returns false for non-error objects or errors without type", () => {
    expect(isTypedError(null)).toBe(false);
    expect(isTypedError({})).toBe(false);
    expect(isTypedError(new Error())).toBe(false);
    expect(isTypedError("string")).toBe(false);
  });
});
