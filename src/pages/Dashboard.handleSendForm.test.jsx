import { describe, test, expect, vi } from "vitest";
import * as formsApi from "../api/formsFrontend";
import * as normalizeModule from "../utils/normalizeEmail";

describe("Dashboard - handleSendForm", () => {
  test("handleSendForm updates clientFormsStatus after successful send", async () => {
    const formType = "BECKS";
    const clientFormsStatus = {
      exists: true,
      forms: { BECKS: { activeToken: false, submitted: false } },
    };
    const confirmedEmail = "TEST@Example.com";
    const formActionLoading = { BECKS: false };
    const setFormActionLoading = vi.fn();
    const setClientFormsStatus = vi.fn();

    vi.spyOn(normalizeModule, "default").mockImplementation((email) =>
      email.toLowerCase()
    );

    vi.spyOn(formsApi, "sendFormToken").mockResolvedValue({
      ok: true,
      data: {},
    });

    const updatedStatus = {
      exists: true,
      forms: { BECKS: { activeToken: true, submitted: false } },
    };

    vi.spyOn(formsApi, "fetchClientStatus").mockResolvedValue({
      ok: true,
      data: updatedStatus,
    });

    const handleSendForm = async (formType) => {
      if (!clientFormsStatus || !confirmedEmail) return;

      const normalizedEmail = normalizeModule.default(confirmedEmail);
      if (formActionLoading[formType]) return;

      setFormActionLoading((prev) => ({ ...prev, [formType]: true }));
      setClientFormsStatus((prev) => ({
        ...prev,
        forms: {
          ...prev.forms,
          [formType]: { ...prev.forms[formType], activeToken: true },
        },
      }));

      const { ok } = await formsApi.sendFormToken(normalizedEmail, formType);

      if (ok) {
        const { ok: fetchOk, data } = await formsApi.fetchClientStatus(
          normalizedEmail
        );
        if (fetchOk) setClientFormsStatus(data);
      }

      setFormActionLoading((prev) => ({ ...prev, [formType]: false }));
    };

    await handleSendForm(formType);

    expect(formsApi.sendFormToken).toHaveBeenCalledWith(
      "test@example.com",
      "BECKS"
    );
    expect(formsApi.fetchClientStatus).toHaveBeenCalledWith("test@example.com");
    expect(setClientFormsStatus).toHaveBeenCalledWith(updatedStatus);
    expect(setFormActionLoading.mock.calls[0][0]({ BECKS: false })).toEqual({
      BECKS: true,
    });
    expect(setFormActionLoading.mock.calls[1][0]({ BECKS: true })).toEqual({
      BECKS: false,
    });
  });

  test("covers form sending error logic", async () => {
    const formType = "BECKS";
    const clientFormsStatus = {
      exists: true,
      forms: { BECKS: { activeToken: false, submitted: false } },
    };
    const confirmedEmail = "TEST@Example.com";
    const formActionLoading = { BECKS: false };
    const setFormActionLoading = vi.fn();
    const setClientFormsStatus = vi.fn();
    const setError = vi.fn();
    const setSuccessMessage = vi.fn();

    vi.spyOn(normalizeModule, "default").mockImplementation((email) =>
      email.toLowerCase()
    );

    vi.spyOn(formsApi, "sendFormToken").mockResolvedValue({
      ok: false,
      data: { error: "Failed to send" },
    });

    const handleSendForm = async (formType) => {
      if (!clientFormsStatus || !confirmedEmail) return;

      const normalizedEmail = normalizeModule.default(confirmedEmail);
      if (formActionLoading[formType]) return;

      setFormActionLoading((prev) => ({ ...prev, [formType]: true }));
      setClientFormsStatus((prev) => ({
        ...prev,
        forms: {
          ...prev.forms,
          [formType]: { ...prev.forms[formType], activeToken: true },
        },
      }));

      const { ok, data } = await formsApi.sendFormToken(
        normalizedEmail,
        formType
      );

      if (!ok) {
        setClientFormsStatus((prev) => ({
          ...prev,
          forms: {
            ...prev.forms,
            [formType]: { ...prev.forms[formType], activeToken: false },
          },
        }));
        setError(data.error || `Failed to send ${formType} form`);
        setSuccessMessage("");
      }
    };

    await handleSendForm(formType);

    expect(formsApi.sendFormToken).toHaveBeenCalledWith(
      "test@example.com",
      "BECKS"
    );

    const statusUpdater = setClientFormsStatus.mock.calls[1][0];
    const newStatus = statusUpdater(clientFormsStatus);
    expect(newStatus.forms.BECKS.activeToken).toBe(false);

    expect(setError).toHaveBeenCalledWith("Failed to send");
    expect(setSuccessMessage).toHaveBeenCalledWith("");
  });
});
