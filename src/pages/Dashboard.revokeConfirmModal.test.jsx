import { render, fireEvent, waitFor } from "@testing-library/react";
import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  vi,
  afterEach,
  beforeEach,
} from "vitest";
import Dashboard from "./Dashboard";
import { ClientContext } from "../context/ClientContext";
import { MemoryRouter } from "react-router-dom";
import * as clientsApi from "../api/clientsFrontend";
import * as formsApi from "../api/formsFrontend";

vi.mock("../api/clientsFrontend", () => ({
  fetchClientStatus: vi.fn(),
  addClient: vi.fn(),
  deleteClient: vi.fn(),
  deleteClientByEmail: vi.fn(),
  deactivateClient: vi.fn(),
  activateClient: vi.fn(),
}));

vi.mock("../api/formsFrontend", () => ({
  revokeFormToken: vi.fn(),
}));

beforeAll(() => {
  const modalRoot = document.createElement("div");
  modalRoot.setAttribute("id", "modal-root");
  document.body.appendChild(modalRoot);
});

afterAll(() => {
  const modalRoot = document.getElementById("modal-root");
  if (modalRoot) document.body.removeChild(modalRoot);
});

vi.mock("../components/modals/RevokeConfirmModal", () => {
  return {
    default: ({ closing, onCancel, onCloseFinished, onConfirm }) => (
      <div data-testid="revoke-modal" data-closing={closing ? "true" : "false"}>
        <button data-testid="cancel-button" onClick={onCancel}>
          Cancel
        </button>
        <button data-testid="revoke-confirm-button" onClick={onConfirm}>
          Revoke
        </button>
        <button data-testid="close-modal" onClick={onCloseFinished}>
          Close
        </button>
      </div>
    ),
  };
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

describe("Dashboard - RevokeConfirmModal", () => {
  let resolveRevoke;

  const mockClientFormsStatus = {
    exists: true,
    clientStatus: "active",
    forms: {
      YSQ: { submitted: false, activeToken: true },
      SMI: { submitted: false, activeToken: false },
      BECKS: { submitted: false, activeToken: false },
      BURNS: { submitted: false, activeToken: false },
    },
  };

  const contextValue = {
    email: "mock@example.com",
    setEmail: vi.fn(),
    clientFormsStatus: mockClientFormsStatus,
    setClientFormsStatus: vi.fn(),
    successMessage: "",
    setSuccessMessage: vi.fn(),
    error: "",
    setError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resolveRevoke = null;

    formsApi.revokeFormToken.mockImplementation(
      () =>
        new Promise((res) => {
          resolveRevoke = res;
        })
    );

    clientsApi.fetchClientStatus.mockResolvedValue({
      ok: true,
      data: {
        exists: true,
        inactive: false,
        formsCompleted: 0,
        forms: {
          YSQ: { activeToken: false, submitted: false },
          SMI: { activeToken: true, submitted: false },
          BECKS: { activeToken: false, submitted: false },
          BURNS: { activeToken: false, submitted: false },
        },
      },
    });
  });

  afterEach(() => {
    resolveRevoke = null;
    vi.resetAllMocks();
  });

  test("modal does NOT appear when revokeFormType is null", () => {
    const { queryByTestId } = render(
      <MemoryRouter>
        <ClientContext.Provider value={contextValue}>
          <Dashboard />
        </ClientContext.Provider>
      </MemoryRouter>
    );

    expect(queryByTestId("revoke-modal")).toBeNull();
  });

  test("modal appears when showRevokeModal and revokeFormType are set", () => {
    const { getByTestId, queryByTestId } = render(
      <MemoryRouter>
        <ClientContext.Provider value={contextValue}>
          <Dashboard />
        </ClientContext.Provider>
      </MemoryRouter>
    );

    const revokeButton = getByTestId("revoke-YSQ-button");
    fireEvent.click(revokeButton);

    expect(queryByTestId("revoke-modal")).toBeTruthy();
  });

  test("modal disappears after handleCloseFinished", () => {
    const { getByTestId, queryByTestId } = render(
      <MemoryRouter>
        <ClientContext.Provider value={contextValue}>
          <Dashboard />
        </ClientContext.Provider>
      </MemoryRouter>
    );

    const revokeButton = getByTestId("revoke-YSQ-button");
    fireEvent.click(revokeButton);
    expect(queryByTestId("revoke-modal")).toBeTruthy();
    const closeButton = getByTestId("close-modal");
    fireEvent.click(closeButton);
    expect(queryByTestId("revoke-modal")).toBeNull();
  });

  test("onCancel triggers closeRevokeModal", () => {
    const closeRevokeModal = vi.fn();

    const { getByTestId } = render(
      <div>
        <button data-testid="cancel-btn" onClick={closeRevokeModal} />
      </div>
    );

    fireEvent.click(getByTestId("cancel-btn"));
    expect(closeRevokeModal).toHaveBeenCalled();
  });

  test("closeRevokeModal sets closingRevokeModal to true", () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <ClientContext.Provider value={contextValue}>
          <Dashboard />
        </ClientContext.Provider>
      </MemoryRouter>
    );

    fireEvent.click(getByTestId("revoke-YSQ-button"));
    const modal = getByTestId("revoke-modal");
    expect(modal).toBeTruthy();
    fireEvent.click(getByTestId("cancel-button"));
    expect(modal).toHaveAttribute("data-closing", "true");
  });

  test("clicking revoke confirm calls revokeFormToken", async () => {
    const mockEmail = "TEST@Example.com";
    const normalizedEmail = mockEmail.toLowerCase();

    clientsApi.fetchClientStatus.mockResolvedValue({
      ok: true,
      data: {
        exists: true,
        clientStatus: "active",
        forms: {
          YSQ: { submitted: false, activeToken: true },
        },
      },
    });

    const revokeSpy = formsApi.revokeFormToken.mockResolvedValue({
      ok: true,
      data: { revokedAt: new Date().toISOString() },
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <ClientContext.Provider
          value={{
            email: mockEmail,
            setEmail: vi.fn(),
            clientFormsStatus: null,
            setClientFormsStatus: vi.fn(),
            successMessage: "",
            setSuccessMessage: vi.fn(),
            error: "",
            setError: vi.fn(),
          }}
        >
          <Dashboard />
        </ClientContext.Provider>
      </MemoryRouter>
    );

    fireEvent.change(getByTestId("email-input"), {
      target: { value: mockEmail },
    });
    fireEvent.click(getByTestId("check-button"));

    await waitFor(() => {
      expect(clientsApi.fetchClientStatus).toHaveBeenCalledWith(
        normalizedEmail
      );
    });

    fireEvent.click(getByTestId("revoke-YSQ-button"));
    fireEvent.click(getByTestId("revoke-confirm-button"));

    await waitFor(() => {
      expect(revokeSpy).toHaveBeenCalledWith(normalizedEmail, "YSQ");
    });
  });

  test("clicking revoke confirm handles failure", async () => {
    const mockEmail = "FAIL@Example.com";
    const normalizedEmail = mockEmail.toLowerCase();

    clientsApi.fetchClientStatus.mockResolvedValue({
      ok: true,
      data: {
        exists: true,
        clientStatus: "active",
        forms: {
          YSQ: { submitted: false, activeToken: true },
        },
      },
    });

    const revokeSpy = formsApi.revokeFormToken.mockResolvedValue({
      ok: false,
      data: { error: "Network error" },
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <ClientContext.Provider
          value={{
            email: mockEmail,
            setEmail: vi.fn(),
            clientFormsStatus: null,
            setClientFormsStatus: vi.fn(),
            successMessage: "",
            setSuccessMessage: vi.fn(),
            error: "",
            setError: vi.fn(),
          }}
        >
          <Dashboard />
        </ClientContext.Provider>
      </MemoryRouter>
    );

    fireEvent.change(getByTestId("email-input"), {
      target: { value: mockEmail },
    });
    fireEvent.click(getByTestId("check-button"));

    await waitFor(() => {
      expect(clientsApi.fetchClientStatus).toHaveBeenCalledWith(
        normalizedEmail
      );
    });

    fireEvent.click(getByTestId("revoke-YSQ-button"));
    fireEvent.click(getByTestId("revoke-confirm-button"));

    await waitFor(() => {
      expect(revokeSpy).toHaveBeenCalledWith(normalizedEmail, "YSQ");
    });
  });

  test("shows fallback error if revokeFormToken API fails without error message", async () => {
    const mockEmail = "test@example.com";

    vi.spyOn(clientsApi, "fetchClientStatus").mockResolvedValue({
      ok: true,
      data: {
        exists: true,
        inactive: false,
        formsCompleted: 2,
        forms: { YSQ: { submitted: false, activeToken: true } },
      },
    });

    vi.spyOn(formsApi, "revokeFormToken").mockResolvedValue({
      ok: false,
      data: {},
    });

    const { getByTestId, findByText } = render(
      <MemoryRouter>
        <ClientContext.Provider value={contextValue}>
          <Dashboard />
        </ClientContext.Provider>
      </MemoryRouter>
    );

    fireEvent.change(getByTestId("email-input"), {
      target: { value: mockEmail },
    });
    fireEvent.click(getByTestId("check-button"));

    await waitFor(() =>
      expect(clientsApi.fetchClientStatus).toHaveBeenCalledWith(mockEmail)
    );

    fireEvent.click(getByTestId("revoke-YSQ-button"));
    fireEvent.click(getByTestId("revoke-confirm-button"));
    await findByText("Failed to revoke YSQ form");
  });

  test("sets revokedAt to null if revokeFormToken returns undefined", async () => {
    const mockEmail = "TEST@Example.com";
    const normalizedEmail = mockEmail.toLowerCase();

    const mockClientFormsStatus = {
      exists: true,
      forms: {
        YSQ: {
          submitted: false,
          activeToken: true,
          revokedAt: "2025-01-01T00:00:00.000Z",
        },
      },
    };

    const setClientFormsStatus = vi.fn();
    const setFormActionLoading = vi.fn();
    const setError = vi.fn();
    const setSuccessMessage = vi.fn();

    clientsApi.fetchClientStatus.mockResolvedValue({
      ok: true,
      data: mockClientFormsStatus,
    });

    formsApi.revokeFormToken.mockResolvedValue({
      ok: true,
      data: {},
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <ClientContext.Provider
          value={{
            email: mockEmail,
            setEmail: vi.fn(),
            clientFormsStatus: mockClientFormsStatus,
            setClientFormsStatus,
            formActionLoading: { YSQ: false },
            setFormActionLoading,
            error: "",
            setError,
            successMessage: "",
            setSuccessMessage,
          }}
        >
          <Dashboard />
        </ClientContext.Provider>
      </MemoryRouter>
    );

    fireEvent.change(getByTestId("email-input"), {
      target: { value: mockEmail },
    });
    fireEvent.click(getByTestId("check-button"));

    await waitFor(() => {
      expect(clientsApi.fetchClientStatus).toHaveBeenCalledWith(
        normalizedEmail
      );
    });

    fireEvent.click(getByTestId("revoke-YSQ-button"));
    fireEvent.click(getByTestId("revoke-confirm-button"));

    await waitFor(() => {
      expect(formsApi.revokeFormToken).toHaveBeenCalledWith(
        normalizedEmail,
        "YSQ"
      );

      const lastCall =
        setClientFormsStatus.mock.calls[
          setClientFormsStatus.mock.calls.length - 1
        ][0];
      expect(lastCall.forms.YSQ.revokedAt).toBeNull();
      expect(lastCall.forms.YSQ.activeToken).toBe(false);
    });
  });

  test("does not call revokeFormToken again if already loading", async () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <ClientContext.Provider value={contextValue}>
          <Dashboard />
        </ClientContext.Provider>
      </MemoryRouter>
    );

    const emailInput = getByTestId("email-input");
    fireEvent.change(emailInput, { target: { value: "TEST@Example.com" } });

    fireEvent.click(getByTestId("check-button"));

    await waitFor(() => {
      expect(clientsApi.fetchClientStatus).toHaveBeenCalled();
      expect(getByTestId("revoke-SMI-button")).toBeTruthy();
    });

    fireEvent.click(getByTestId("revoke-SMI-button"));
    const confirmButton = getByTestId("revoke-confirm-button");
    fireEvent.click(confirmButton);
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(formsApi.revokeFormToken).toHaveBeenCalledTimes(1);
    });

    resolveRevoke({ ok: true, data: { revokedAt: new Date().toISOString() } });

    await waitFor(() => {
      expect(formsApi.revokeFormToken).toHaveBeenCalledTimes(1);
    });
  });
});
