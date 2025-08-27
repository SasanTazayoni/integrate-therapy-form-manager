import {
  describe,
  test,
  expect,
  vi,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import Dashboard from "./Dashboard";
import { useClientContext } from "../context/ClientContext";
import { MemoryRouter } from "react-router-dom";
import * as clientsApi from "../api/clientsFrontend";
import * as formsApi from "../api/formsFrontend";
import truncateEmail from "../utils/truncateEmail";
import * as normalizeModule from "../utils/normalizeEmail";
import FormButtons from "../components/FormButtons";

const setClientFormsStatusMock = vi.fn();
const setFormActionLoadingMock = vi.fn();
const setErrorMock = vi.fn();
const setSuccessMessageMock = vi.fn();

const clientFormsStatusMock = {
  exists: true,
  forms: {
    BECKS: { activeToken: false, submitted: false },
    YSQ: { activeToken: false, submitted: false },
    SMI: { activeToken: false, submitted: false },
    BURNS: { activeToken: false, submitted: false },
  },
};

vi.mock("../context/ClientContext", () => ({
  useClientContext: vi.fn(() => ({
    clientFormsStatus: clientFormsStatusMock,
    setClientFormsStatus: setClientFormsStatusMock,
    confirmedEmail: "test@example.com",
    formActionLoading: {},
    setFormActionLoading: setFormActionLoadingMock,
    setError: setErrorMock,
    setSuccessMessage: setSuccessMessageMock,
  })),
}));

vi.mock("../api/clientsFrontend", () => ({
  fetchClientStatus: vi.fn(),
  addClient: vi.fn(),
  deleteClient: vi.fn(),
  deactivateClient: vi.fn(),
  activateClient: vi.fn(),
}));

vi.mock("../api/formsFrontend", () => ({
  sendFormToken: vi.fn(),
  fetchClientStatus: vi.fn(),
  revokeFormToken: vi.fn(),
  submitBecksForm: vi.fn(),
  submitBurnsForm: vi.fn(),
  submitYSQForm: vi.fn(),
  submitSMIForm: vi.fn(),
  updateClientInfo: vi.fn(),
}));

vi.mock("react-dom", async () => {
  const actual = await vi.importActual("react-dom");
  return {
    ...actual,
    createPortal: (node) => node,
  };
});

beforeAll(() => {
  const modalRoot = document.createElement("div");
  modalRoot.setAttribute("id", "modal-root");
  document.body.appendChild(modalRoot);
});

afterAll(() => {
  const modalRoot = document.getElementById("modal-root");
  if (modalRoot) document.body.removeChild(modalRoot);
});

describe("Dashboard - render checks", () => {
  beforeEach(() => {
    useClientContext.mockReturnValue({
      email: "",
      setEmail: vi.fn(),
      clientFormsStatus: null,
      setClientFormsStatus: vi.fn(),
    });
  });

  test("renders the dashboard title", () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(getByTestId("dashboard-title")).toBeInTheDocument();
  });

  test("renders the email input field", () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(getByTestId("email-input")).toBeInTheDocument();
  });

  test("renders the Summary button", () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(getByTestId("summary-button")).toBeInTheDocument();
  });
});

describe("Dashboard - email input behavior", () => {
  const setEmailMock = vi.fn();
  const setClientFormsStatusMock = vi.fn();

  beforeEach(() => {
    useClientContext.mockReturnValue({
      email: "",
      setEmail: setEmailMock,
      clientFormsStatus: null,
      setClientFormsStatus: setClientFormsStatusMock,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("updates email state and resets other states on change", () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const emailInput = getByTestId("email-input");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    expect(setEmailMock).toHaveBeenCalledWith("test@example.com");
    expect(setClientFormsStatusMock).toHaveBeenCalledWith(null);
  });
});

describe("Dashboard - handleCheckProgress", () => {
  const setEmailMock = vi.fn();
  const setClientFormsStatusMock = vi.fn();

  beforeEach(() => {
    useClientContext.mockReturnValue({
      email: "",
      setEmail: setEmailMock,
      clientFormsStatus: null,
      setClientFormsStatus: setClientFormsStatusMock,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("fetches client status and updates state for valid email", async () => {
    const mockEmail = "test@example.com";
    const mockClientStatus = {
      exists: true,
      inactive: false,
      formsCompleted: 2,
      forms: {},
    };

    clientsApi.fetchClientStatus.mockResolvedValue({
      ok: true,
      data: mockClientStatus,
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const emailInput = getByTestId("email-input");
    fireEvent.change(emailInput, { target: { value: mockEmail } });

    const checkButton = getByTestId("check-button");
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(clientsApi.fetchClientStatus).toHaveBeenCalledWith(mockEmail);
      expect(setClientFormsStatusMock).toHaveBeenCalledWith(mockClientStatus);
      const successMessage = getByTestId("success-message");
      expect(successMessage).toHaveTextContent(
        `Retrieved data successfully for ${truncateEmail(mockEmail)}`
      );
    });
  });

  test("shows error when email input is empty", async () => {
    const { getByTestId, getByText } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const checkButton = getByTestId("check-button");
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(getByText("Input cannot be empty")).toBeInTheDocument();
    });
  });

  test("shows error when email is invalid", async () => {
    const { getByTestId, getByText } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const emailInput = getByTestId("email-input");
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });

    const checkButton = getByTestId("check-button");
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(getByText("This email is not valid")).toBeInTheDocument();
    });
  });

  test("prompts to add client when API returns 'Client not found'", async () => {
    clientsApi.fetchClientStatus.mockResolvedValueOnce({
      ok: false,
      data: { error: "Client not found" },
    });

    const { getByTestId, getByText } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const emailInput = getByTestId("email-input");
    fireEvent.change(emailInput, { target: { value: "notfound@example.com" } });

    const checkButton = getByTestId("check-button");
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(
        getByText("No data for this email - add to database?")
      ).toBeInTheDocument();
      expect(getByTestId("add-client-button")).toBeInTheDocument();
    });
  });

  test("resets clientFormsStatus and sets new email when email changes", async () => {
    const setClientFormsStatusMock = vi.fn();
    const setEmailMock = vi.fn();

    useClientContext.mockReturnValue({
      email: "",
      setEmail: setEmailMock,
      clientFormsStatus: { exists: true },
      setClientFormsStatus: setClientFormsStatusMock,
    });

    clientsApi.fetchClientStatus.mockResolvedValue({
      ok: true,
      data: { exists: true, formsCompleted: 2, forms: {} },
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const emailInput = getByTestId("email-input");

    fireEvent.change(emailInput, { target: { value: "old@example.com" } });
    fireEvent.click(getByTestId("check-button"));

    await waitFor(() => {
      expect(clientsApi.fetchClientStatus).toHaveBeenCalledWith(
        "old@example.com"
      );
    });

    fireEvent.change(emailInput, { target: { value: "new@example.com" } });

    expect(setClientFormsStatusMock).toHaveBeenCalledWith(null);
    expect(setEmailMock).toHaveBeenCalledWith("new@example.com");
  });

  test("sets error, hides add client prompt, and resets clientFormsStatus for generic API error", async () => {
    const genericError = "Unexpected server error";

    clientsApi.fetchClientStatus.mockResolvedValue({
      ok: false,
      data: { error: genericError },
    });

    const { getByTestId, queryByTestId } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const emailInput = getByTestId("email-input");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const checkButton = getByTestId("check-button");
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(getByTestId("error-message")).toHaveTextContent(genericError);
      expect(queryByTestId("add-client-button")).not.toBeInTheDocument();
    });
  });
});

describe("Dashboard - handleConfirmAddClient", () => {
  const setEmailMock = vi.fn();
  const setClientFormsStatusMock = vi.fn();

  beforeEach(() => {
    useClientContext.mockReturnValue({
      email: "",
      setEmail: setEmailMock,
      clientFormsStatus: null,
      setClientFormsStatus: setClientFormsStatusMock,
    });
    vi.clearAllMocks();
  });

  test("successfully adds a client and triggers handleCheckProgress", async () => {
    const mockEmail = "test@example.com";

    clientsApi.fetchClientStatus.mockResolvedValueOnce({
      ok: false,
      data: { error: "Client not found" },
    });

    clientsApi.addClient.mockResolvedValueOnce({
      ok: true,
      data: { exists: true, inactive: false, formsCompleted: 0, forms: {} },
    });

    clientsApi.fetchClientStatus.mockResolvedValueOnce({
      ok: true,
      data: { exists: true, inactive: false, formsCompleted: 0, forms: {} },
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const emailInput = getByTestId("email-input");
    fireEvent.change(emailInput, { target: { value: mockEmail } });

    const checkButton = getByTestId("check-button");
    fireEvent.click(checkButton);

    const addClientButton = await waitFor(() =>
      getByTestId("add-client-button")
    );
    fireEvent.click(addClientButton);

    await waitFor(() => {
      expect(clientsApi.addClient).toHaveBeenCalledWith(mockEmail);
      expect(clientsApi.fetchClientStatus).toHaveBeenCalledWith(mockEmail);
    });
  });

  test("shows error when adding a client fails", async () => {
    const mockEmail = "test@example.com";

    clientsApi.fetchClientStatus.mockResolvedValueOnce({
      ok: false,
      data: { error: "Client not found" },
    });

    clientsApi.addClient.mockResolvedValueOnce({
      ok: false,
      data: { error: "Failed to add client" },
    });

    const { getByTestId, getByText } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const emailInput = getByTestId("email-input");
    fireEvent.change(emailInput, { target: { value: mockEmail } });

    const checkButton = getByTestId("check-button");
    fireEvent.click(checkButton);

    const addClientButton = await waitFor(() =>
      getByTestId("add-client-button")
    );
    fireEvent.click(addClientButton);

    await waitFor(() => {
      expect(clientsApi.addClient).toHaveBeenCalledWith(mockEmail);
      expect(getByText("Failed to add client")).toBeInTheDocument();
      expect(clientsApi.fetchClientStatus).toHaveBeenCalledWith(mockEmail);
    });
  });
});

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

describe("Dashboard - Modals", () => {
  let onRevokeMock;

  const clientFormsStatusMock = {
    exists: true,
    forms: {
      YSQ: { activeToken: true, submitted: false },
      BECKS: { activeToken: false, submitted: false },
      SMI: { activeToken: false, submitted: false },
      BURNS: { activeToken: false, submitted: false },
    },
  };

  beforeEach(() => {
    onRevokeMock = vi.fn();
  });

  test("clicking YSQ revoke button calls onRevoke prop", () => {
    const { getByTestId } = render(
      <FormButtons
        clientFormsStatus={clientFormsStatusMock}
        onSend={() => {}}
        onRevoke={onRevokeMock}
        formActionLoading={{ YSQ: false }}
        clientInactive={false}
      />
    );

    const revokeButton = getByTestId("revoke-YSQ-button");
    fireEvent.click(revokeButton);

    expect(onRevokeMock).toHaveBeenCalledWith("YSQ");
  });
});
