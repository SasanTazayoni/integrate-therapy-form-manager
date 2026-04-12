import { describe, test, expect, vi } from "vitest";
import { submitFormWithToken } from "./becksBurnsHelpers";

const makeArgs = (overrides: object = {}) => ({
  token: "token" as string | undefined,
  result: "result",
  submitFn: vi.fn().mockResolvedValue({ ok: true }),
  setFormError: vi.fn(),
  setShowInvalidTokenModal: vi.fn(),
  navigate: vi.fn(),
  ...overrides,
});

describe("beckBurnsHelpers", () => {
  test("sets form error if token is missing", async () => {
    const args = makeArgs({ token: undefined, submitFn: vi.fn() });
    await submitFormWithToken(args);
    expect(args.setFormError).toHaveBeenCalledWith("Token missing");
    expect(args.submitFn).not.toHaveBeenCalled();
    expect(args.setShowInvalidTokenModal).not.toHaveBeenCalled();
    expect(args.navigate).not.toHaveBeenCalled();
  });

  test("calls submitFn with token and result", async () => {
    const submitFn = vi.fn().mockResolvedValue({ ok: true });
    const args = makeArgs({ token: "abc123", result: 42, submitFn });
    await submitFormWithToken(args);
    expect(submitFn).toHaveBeenCalledWith({ token: "abc123", result: 42 });
    expect(args.setFormError).toHaveBeenCalledWith("");
  });

  test("navigates to /submitted if submitFn returns ok", async () => {
    const args = makeArgs();
    await submitFormWithToken(args);
    expect(args.navigate).toHaveBeenCalledWith("/submitted");
  });

  test("shows invalid token modal if submitFn returns code INVALID_TOKEN", async () => {
    const args = makeArgs({
      submitFn: vi.fn().mockResolvedValue({ ok: false, code: "INVALID_TOKEN" }),
    });
    await submitFormWithToken(args);
    expect(args.setShowInvalidTokenModal).toHaveBeenCalledWith(true);
    expect(args.setFormError).toHaveBeenCalledWith("");
    expect(args.navigate).not.toHaveBeenCalled();
  });

  test("sets form error if submitFn fails with generic error", async () => {
    const args = makeArgs({
      submitFn: vi.fn().mockResolvedValue({ ok: false, error: "Server error" }),
    });
    await submitFormWithToken(args);
    expect(args.setFormError).toHaveBeenCalledWith("Server error");
    expect(args.setShowInvalidTokenModal).not.toHaveBeenCalled();
    expect(args.navigate).not.toHaveBeenCalled();
  });

  test("sets generic form error if submitFn fails with no error message", async () => {
    const args = makeArgs({
      submitFn: vi.fn().mockResolvedValue({ ok: false }),
    });
    await submitFormWithToken(args);
    expect(args.setFormError).toHaveBeenCalledWith("Failed to submit the form.");
    expect(args.setShowInvalidTokenModal).not.toHaveBeenCalled();
    expect(args.navigate).not.toHaveBeenCalled();
  });
});
