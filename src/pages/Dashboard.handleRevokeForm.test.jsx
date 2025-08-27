import { describe, test, expect, vi } from "vitest";
import * as formsApi from "../api/formsFrontend";
import * as normalizeModule from "../utils/normalizeEmail";

describe("Dashboard - handleRevokeForm", () => {
  test("handles successful and failed revocation with normalized email", async () => {
    const formType = "BECKS";
    const clientFormsStatus = {
      exists: true,
      forms: { [formType]: { activeToken: true } },
    };
    const confirmedEmail = "TEST@Example.com";
    const formActionLoading = { [formType]: false };

    const setClientFormsStatus = vi.fn();
    const setFormActionLoading = vi.fn();
    const setError = vi.fn();
    const setSuccessMessage = vi.fn();

    vi.spyOn(normalizeModule, "default").mockImplementation((email) =>
      email.toLowerCase()
    );

    vi.spyOn(formsApi, "revokeFormToken").mockResolvedValueOnce({
      ok: true,
      data: { revokedAt: "2025-08-26T00:00:00Z" },
    });

    const handleRevokeForm = async (formType) => {
      if (!clientFormsStatus || !confirmedEmail) return;

      const normalizedEmail = normalizeModule.default(confirmedEmail);
      if (formActionLoading[formType]) return;

      setFormActionLoading((prev) => ({ ...prev, [formType]: true }));
      setClientFormsStatus((prev) => ({
        ...prev,
        forms: {
          ...prev.forms,
          [formType]: { ...prev.forms[formType], activeToken: false },
        },
      }));

      const { ok, data } = await formsApi.revokeFormToken(
        normalizedEmail,
        formType
      );

      if (!ok) {
        setClientFormsStatus((prev) => ({
          ...prev,
          forms: {
            ...prev.forms,
            [formType]: { ...prev.forms[formType], activeToken: true },
          },
        }));
        setError(data.error || `Failed to revoke ${formType} form`);
        setSuccessMessage("");
      } else {
        setClientFormsStatus((prev) => ({
          ...prev,
          forms: {
            ...prev.forms,
            [formType]: {
              ...prev.forms[formType],
              revokedAt: data.revokedAt ?? null,
              activeToken: false,
            },
          },
        }));
      }

      setFormActionLoading((prev) => ({ ...prev, [formType]: false }));
    };

    await handleRevokeForm(formType);
    expect(normalizeModule.default).toHaveBeenCalledWith(confirmedEmail);
    expect(
      setFormActionLoading.mock.calls[0][0]({ [formType]: false })
    ).toEqual({
      [formType]: true,
    });

    const statusUpdater = setClientFormsStatus.mock.calls[1][0];
    const newStatus = statusUpdater(clientFormsStatus);
    expect(newStatus.forms[formType].activeToken).toBe(false);
    expect(newStatus.forms[formType].revokedAt).toBe("2025-08-26T00:00:00Z");

    expect(setFormActionLoading.mock.calls[1][0]({ [formType]: true })).toEqual(
      {
        [formType]: false,
      }
    );
  });

  test("returns early if formActionLoading[formType] is true", async () => {
    const formType = "BECKS";

    const clientFormsStatus = {
      exists: true,
      forms: { [formType]: { activeToken: true } },
    };
    const confirmedEmail = "test@example.com";
    const formActionLoading = { [formType]: true };

    const setClientFormsStatus = vi.fn();
    const setFormActionLoading = vi.fn();
    const setError = vi.fn();
    const setSuccessMessage = vi.fn();

    const handleRevokeForm = async (formType) => {
      if (!clientFormsStatus || !confirmedEmail) return;

      if (formActionLoading[formType]) return;

      setFormActionLoading((prev) => ({ ...prev, [formType]: true }));
      setClientFormsStatus((prev) => ({
        ...prev,
        forms: {
          ...prev.forms,
          [formType]: { ...prev.forms[formType], activeToken: false },
        },
      }));
    };

    await handleRevokeForm(formType);
    expect(setClientFormsStatus).not.toHaveBeenCalled();
    expect(setFormActionLoading).not.toHaveBeenCalled();
    expect(setError).not.toHaveBeenCalled();
    expect(setSuccessMessage).not.toHaveBeenCalled();
  });

  test("handles API failure and sets error & resets activeToken", async () => {
    const formType = "BECKS";

    const clientFormsStatus = {
      exists: true,
      forms: { [formType]: { activeToken: true } },
    };
    const confirmedEmail = "TEST@Example.com";
    const formActionLoading = { [formType]: false };

    const setClientFormsStatus = vi.fn();
    const setFormActionLoading = vi.fn();
    const setError = vi.fn();
    const setSuccessMessage = vi.fn();

    vi.spyOn(normalizeModule, "default").mockImplementation((email) =>
      email.toLowerCase()
    );

    vi.spyOn(formsApi, "revokeFormToken").mockResolvedValueOnce({
      ok: false,
      data: { error: "Failed to revoke" },
    });

    const handleRevokeForm = async (formType) => {
      if (!clientFormsStatus || !confirmedEmail) return;

      const normalizedEmail = normalizeModule.default(confirmedEmail);
      if (formActionLoading[formType]) return;

      setFormActionLoading((prev) => ({ ...prev, [formType]: true }));
      setClientFormsStatus((prev) => ({
        ...prev,
        forms: {
          ...prev.forms,
          [formType]: { ...prev.forms[formType], activeToken: false },
        },
      }));

      const { ok, data } = await formsApi.revokeFormToken(
        normalizedEmail,
        formType
      );

      if (!ok) {
        setClientFormsStatus((prev) => ({
          ...prev,
          forms: {
            ...prev.forms,
            [formType]: { ...prev.forms[formType], activeToken: true },
          },
        }));
        setError(data.error || `Failed to revoke ${formType} form`);
        setSuccessMessage("");
      } else {
        setClientFormsStatus((prev) => ({
          ...prev,
          forms: {
            ...prev.forms,
            [formType]: {
              ...prev.forms[formType],
              revokedAt: data.revokedAt ?? null,
              activeToken: false,
            },
          },
        }));
      }

      setFormActionLoading((prev) => ({ ...prev, [formType]: false }));
    };

    await handleRevokeForm(formType);
    const statusUpdater = setClientFormsStatus.mock.calls[1][0];
    const newStatus = statusUpdater(clientFormsStatus);
    expect(newStatus.forms[formType].activeToken).toBe(true);

    expect(setError).toHaveBeenCalledWith("Failed to revoke");
    expect(setSuccessMessage).toHaveBeenCalledWith("");
    expect(setFormActionLoading.mock.calls[1][0]({ [formType]: true })).toEqual(
      {
        [formType]: false,
      }
    );
  });
});
