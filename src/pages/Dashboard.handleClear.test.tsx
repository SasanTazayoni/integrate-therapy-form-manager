import { describe, test, expect, vi } from "vitest";

describe("Dashboard - handleClear", () => {
  test("resets all state", () => {
    const setEmail = vi.fn();
    const setClientFormsStatus = vi.fn();
    const setError = vi.fn();
    const setSuccessMessage = vi.fn();
    const setShowAddClientPrompt = vi.fn();
    const setFormActionLoading = vi.fn();
    const setConfirmedEmail = vi.fn();

    const handleClear = () => {
      setEmail("");
      setClientFormsStatus(null);
      setError("");
      setSuccessMessage("");
      setShowAddClientPrompt(false);
      setFormActionLoading({});
      setConfirmedEmail(null);
    };

    handleClear();

    expect(setEmail).toHaveBeenCalledWith("");
    expect(setClientFormsStatus).toHaveBeenCalledWith(null);
    expect(setError).toHaveBeenCalledWith("");
    expect(setSuccessMessage).toHaveBeenCalledWith("");
    expect(setShowAddClientPrompt).toHaveBeenCalledWith(false);
    expect(setFormActionLoading).toHaveBeenCalledWith({});
    expect(setConfirmedEmail).toHaveBeenCalledWith(null);
  });
});
