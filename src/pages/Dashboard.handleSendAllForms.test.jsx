import {
  describe,
  test,
  expect,
  vi,
  beforeAll,
  afterAll,
  beforeEach,
} from "vitest";
import {
  render,
  fireEvent,
  waitFor,
  renderHook,
  act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";
import userEvent from "@testing-library/user-event";
import * as ClientContextModule from "../context/ClientContext";
import * as formsApi from "../api/formsFrontend";
import * as clientsApi from "../api/clientsFrontend";
import { FORM_TYPES } from "../constants/formTypes";
import truncateEmail from "../utils/truncateEmail";

vi.mock("../context/ClientContext", () => ({
  useClientContext: vi.fn(),
}));

vi.mock("../api/formsFrontend", () => ({
  sendMultipleFormTokens: vi.fn(),
}));

vi.mock("../api/clientsFrontend", () => ({
  fetchClientStatus: vi.fn(),
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

describe("Dashboard - handleSendAllForms", () => {
  const setEmailMock = vi.fn();
  const setClientFormsStatusMock = vi.fn();
  const setErrorMock = vi.fn();
  const setSuccessMessageMock = vi.fn();
  const setFormActionLoadingMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    ClientContextModule.useClientContext.mockReturnValue({
      email: "",
      setEmail: setEmailMock,
      clientFormsStatus: null,
      setClientFormsStatus: setClientFormsStatusMock,
      successMessage: "",
      setSuccessMessage: setSuccessMessageMock,
      error: "",
      setError: setErrorMock,
    });
  });

  test("button does nothing if confirmedEmail is missing", async () => {
    const { findByText } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const sendAllButton = await findByText("Send all");
    await userEvent.click(sendAllButton);

    expect(formsApi.sendMultipleFormTokens).not.toHaveBeenCalled();
  });

  test("send all button does nothing if clientFormsStatus is missing", async () => {
    ClientContextModule.useClientContext.mockReturnValue({
      email: "test@example.com",
      setEmail: setEmailMock,
      clientFormsStatus: null,
      setClientFormsStatus: setClientFormsStatusMock,
      successMessage: "",
      setSuccessMessage: setSuccessMessageMock,
      error: "",
      setError: setErrorMock,
    });

    const { findByText } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const sendAllButton = await findByText("Send all");
    await userEvent.click(sendAllButton);

    expect(formsApi.sendMultipleFormTokens).not.toHaveBeenCalled();
  });

  test("calls sendMultipleFormTokens with normalized email and prevents double-send", async () => {
    const mockEmail = "TEST@Example.com";
    const normalizedEmail = mockEmail.toLowerCase();

    const mockClientStatus = {
      exists: true,
      inactive: false,
      formsCompleted: 1,
      forms: {
        YSQ: { activeToken: false, revokedAt: null, submitted: false },
        SMI: { activeToken: false, revokedAt: null, submitted: false },
        BECKS: { activeToken: false, revokedAt: null, submitted: false },
        BURNS: { activeToken: false, revokedAt: null, submitted: false },
      },
    };

    clientsApi.fetchClientStatus.mockResolvedValue({
      ok: true,
      data: mockClientStatus,
    });

    formsApi.sendMultipleFormTokens.mockResolvedValue({ ok: true, data: {} });

    const setEmailMock = vi.fn();
    const setClientFormsStatusMock = vi.fn();
    ClientContextModule.useClientContext.mockReturnValue({
      email: "",
      clientFormsStatus: null,
      setEmail: setEmailMock,
      setClientFormsStatus: setClientFormsStatusMock,
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
      expect(clientsApi.fetchClientStatus).toHaveBeenCalledWith(
        normalizedEmail
      );

      const successMessage = getByTestId("success-message");
      expect(successMessage).toHaveTextContent(
        `Retrieved data successfully for ${truncateEmail(normalizedEmail)}`
      );
    });

    const sendAllButton = getByTestId("send-all-forms-button");
    fireEvent.click(sendAllButton);
    fireEvent.click(sendAllButton);

    await waitFor(() => {
      expect(formsApi.sendMultipleFormTokens).toHaveBeenCalledTimes(1);
      expect(formsApi.sendMultipleFormTokens).toHaveBeenCalledWith(
        normalizedEmail
      );
    });
  });

  test("displays error if sendMultipleFormTokens fails", async () => {
    const mockEmail = "TEST@Example.com";
    const normalizedEmail = mockEmail.toLowerCase();

    const mockClientStatus = {
      exists: true,
      inactive: false,
      formsCompleted: 1,
      forms: {
        YSQ: { activeToken: false, revokedAt: null, submitted: false },
        SMI: { activeToken: false, revokedAt: null, submitted: false },
        BECKS: { activeToken: false, revokedAt: null, submitted: false },
        BURNS: { activeToken: false, revokedAt: null, submitted: false },
      },
    };

    clientsApi.fetchClientStatus.mockResolvedValue({
      ok: true,
      data: mockClientStatus,
    });

    formsApi.sendMultipleFormTokens.mockResolvedValue({
      ok: false,
      data: { error: "Failed to send multiple forms" },
    });

    const setEmailMock = vi.fn();
    const setClientFormsStatusMock = vi.fn();
    ClientContextModule.useClientContext.mockReturnValue({
      email: "",
      clientFormsStatus: null,
      setEmail: setEmailMock,
      setClientFormsStatus: setClientFormsStatusMock,
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
      expect(clientsApi.fetchClientStatus).toHaveBeenCalledWith(
        normalizedEmail
      );
    });

    const sendAllButton = getByTestId("send-all-forms-button");
    fireEvent.click(sendAllButton);

    await waitFor(() => {
      const errorMessage = getByTestId("error-message");
      expect(errorMessage).toHaveTextContent("Failed to send multiple forms");
    });

    await waitFor(() => {
      expect(sendAllButton).not.toBeDisabled();
    });
  });

  test("displays unexpected error if sendMultipleFormTokens throws", async () => {
    const mockEmail = "TEST@Example.com";
    const normalizedEmail = mockEmail.toLowerCase();

    const mockClientStatus = {
      exists: true,
      inactive: false,
      formsCompleted: 0,
      forms: {
        YSQ: { activeToken: false, revokedAt: null, submitted: false },
        SMI: { activeToken: false, revokedAt: null, submitted: false },
        BECKS: { activeToken: false, revokedAt: null, submitted: false },
        BURNS: { activeToken: false, revokedAt: null, submitted: false },
      },
    };

    clientsApi.fetchClientStatus.mockResolvedValue({
      ok: true,
      data: mockClientStatus,
    });

    formsApi.sendMultipleFormTokens.mockImplementation(() => {
      throw new Error("Network failure");
    });

    const setEmailMock = vi.fn();
    const setClientFormsStatusMock = vi.fn();
    ClientContextModule.useClientContext.mockReturnValue({
      email: "",
      clientFormsStatus: null,
      setEmail: setEmailMock,
      setClientFormsStatus: setClientFormsStatusMock,
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
      expect(clientsApi.fetchClientStatus).toHaveBeenCalledWith(
        normalizedEmail
      );
    });

    const sendAllButton = getByTestId("send-all-forms-button");
    fireEvent.click(sendAllButton);

    await waitFor(() => {
      const errorMessage = getByTestId("error-message");
      expect(errorMessage).toHaveTextContent(
        "Unexpected error occurred while sending all forms"
      );
    });

    await waitFor(() => {
      expect(sendAllButton).not.toBeDisabled();
    });
  });

  test("displays fallback error if sendMultipleFormTokens returns ok: false without message", async () => {
    const mockEmail = "TEST@Example.com";
    const normalizedEmail = mockEmail.toLowerCase();

    const mockClientStatus = {
      exists: true,
      inactive: false,
      formsCompleted: 0,
      forms: {
        YSQ: { activeToken: false, revokedAt: null, submitted: false },
        SMI: { activeToken: false, revokedAt: null, submitted: false },
        BECKS: { activeToken: false, revokedAt: null, submitted: false },
        BURNS: { activeToken: false, revokedAt: null, submitted: false },
      },
    };

    clientsApi.fetchClientStatus.mockResolvedValue({
      ok: true,
      data: mockClientStatus,
    });

    formsApi.sendMultipleFormTokens.mockResolvedValue({ ok: false, data: {} });

    const setEmailMock = vi.fn();
    const setClientFormsStatusMock = vi.fn();
    ClientContextModule.useClientContext.mockReturnValue({
      email: "",
      clientFormsStatus: null,
      setEmail: setEmailMock,
      setClientFormsStatus: setClientFormsStatusMock,
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
      expect(clientsApi.fetchClientStatus).toHaveBeenCalledWith(
        normalizedEmail
      );
    });

    const sendAllButton = getByTestId("send-all-forms-button");
    fireEvent.click(sendAllButton);

    await waitFor(() => {
      const errorMessage = getByTestId("error-message");
      expect(errorMessage).toHaveTextContent("Failed to send multiple forms");
    });

    await waitFor(() => {
      expect(sendAllButton).not.toBeDisabled();
    });
  });
});
