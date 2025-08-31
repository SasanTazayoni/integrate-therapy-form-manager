import { describe, test, expect, vi } from "vitest";
import { submitFormWithToken } from "./becksBurnsHelpers";

describe("beckBurnsHelpers", () => {
  test("sets form error if token is missing", async () => {
    const setFormError = vi.fn();
    const setShowInvalidTokenModal = vi.fn();
    const navigate = vi.fn();
    const submitFn = vi.fn();

    await submitFormWithToken({
      token: undefined,
      result: "some result",
      submitFn,
      setFormError,
      setShowInvalidTokenModal,
      navigate,
    });

    expect(setFormError).toHaveBeenCalledWith("Token missing");
    expect(submitFn).not.toHaveBeenCalled();
    expect(setShowInvalidTokenModal).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  test("calls submitFn with token and result", async () => {
    const setFormError = vi.fn();
    const setShowInvalidTokenModal = vi.fn();
    const navigate = vi.fn();
    const submitFn = vi.fn().mockResolvedValue({ ok: true });

    await submitFormWithToken({
      token: "abc123",
      result: 42,
      submitFn,
      setFormError,
      setShowInvalidTokenModal,
      navigate,
    });

    expect(submitFn).toHaveBeenCalledWith({ token: "abc123", result: 42 });
    expect(setFormError).toHaveBeenCalledWith("");
  });

  test("navigates to /submitted if submitFn returns ok", async () => {
    const setFormError = vi.fn();
    const setShowInvalidTokenModal = vi.fn();
    const navigate = vi.fn();
    const submitFn = vi.fn().mockResolvedValue({ ok: true });

    await submitFormWithToken({
      token: "token",
      result: "result",
      submitFn,
      setFormError,
      setShowInvalidTokenModal,
      navigate,
    });

    expect(navigate).toHaveBeenCalledWith("/submitted");
  });

  test("shows invalid token modal if submitFn returns code INVALID_TOKEN", async () => {
    const setFormError = vi.fn();
    const setShowInvalidTokenModal = vi.fn();
    const navigate = vi.fn();
    const submitFn = vi
      .fn()
      .mockResolvedValue({ ok: false, code: "INVALID_TOKEN" });

    await submitFormWithToken({
      token: "token",
      result: "result",
      submitFn,
      setFormError,
      setShowInvalidTokenModal,
      navigate,
    });

    expect(setShowInvalidTokenModal).toHaveBeenCalledWith(true);
    expect(setFormError).toHaveBeenCalledWith("");
    expect(navigate).not.toHaveBeenCalled();
  });

  test("sets form error if submitFn fails with generic error", async () => {
    const setFormError = vi.fn();
    const setShowInvalidTokenModal = vi.fn();
    const navigate = vi.fn();
    const submitFn = vi
      .fn()
      .mockResolvedValue({ ok: false, error: "Server error" });

    await submitFormWithToken({
      token: "token",
      result: "result",
      submitFn,
      setFormError,
      setShowInvalidTokenModal,
      navigate,
    });

    expect(setFormError).toHaveBeenCalledWith("Server error");
    expect(setShowInvalidTokenModal).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  test("sets generic form error if submitFn fails with no error message", async () => {
    const setFormError = vi.fn();
    const setShowInvalidTokenModal = vi.fn();
    const navigate = vi.fn();
    const submitFn = vi.fn().mockResolvedValue({ ok: false });

    await submitFormWithToken({
      token: "token",
      result: "result",
      submitFn,
      setFormError,
      setShowInvalidTokenModal,
      navigate,
    });

    expect(setFormError).toHaveBeenCalledWith("Failed to submit the form.");
    expect(setShowInvalidTokenModal).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
