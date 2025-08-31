import {
  describe,
  test,
  expect,
  vi,
  beforeAll,
  afterAll,
  beforeEach,
} from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";
import * as ClientContextModule from "../context/ClientContext";
import * as formsApi from "../api/formsFrontend";
import * as clientsApi from "../api/clientsFrontend";
import truncateEmail from "../utils/truncateEmail";
import { FORM_TYPES } from "../constants/formTypes";

vi.mock("../context/ClientContext", () => ({
  useClientContext: vi.fn(),
}));

vi.mock("../api/formsFrontend", () => ({
  sendFormToken: vi.fn(),
  revokeFormToken: vi.fn(),
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

afterAll(() => {
  const modalRoot = document.getElementById("modal-root");
  if (modalRoot) document.body.removeChild(modalRoot);
});

describe("Dashboard - handleSendForm", () => {
  const setEmailMock = vi.fn();
  const setClientFormsStatusMock = vi.fn();
  const FORM_TYPE = FORM_TYPES[2];

  beforeEach(() => {
    vi.clearAllMocks();
    ClientContextModule.useClientContext.mockReturnValue({
      email: "",
      clientFormsStatus: null,
      setEmail: setEmailMock,
      setClientFormsStatus: setClientFormsStatusMock,
    });
  });

  test("button does nothing if clientFormsStatus is missing", async () => {
    ClientContextModule.useClientContext.mockReturnValue({
      email: "test@example.com",
      clientFormsStatus: null,
      setEmail: setEmailMock,
      setClientFormsStatus: setClientFormsStatusMock,
    });

    const { findByTestId } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const sendButton = await findByTestId(`send-${FORM_TYPE}-button`);
    await userEvent.click(sendButton);
    expect(formsApi.sendFormToken).not.toHaveBeenCalled();
  });

  test("button does nothing if confirmedEmail is missing", async () => {
    ClientContextModule.useClientContext.mockReturnValue({
      email: null,
      clientFormsStatus: { exists: true, forms: { [FORM_TYPE]: {} } },
      setEmail: setEmailMock,
      setClientFormsStatus: setClientFormsStatusMock,
    });

    const { findByTestId } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const sendButton = await findByTestId(`send-${FORM_TYPE}-button`);
    await userEvent.click(sendButton);
    expect(formsApi.sendFormToken).not.toHaveBeenCalled();
  });

  test("calls sendFormToken with normalized email and prevents double-send", async () => {
    const mockEmail = "TEST@Example.com";
    const normalizedEmail = mockEmail.toLowerCase();

    const mockClientStatus = {
      exists: true,
      inactive: false,
      formsCompleted: 1,
      forms: {
        [FORM_TYPE]: { activeToken: false, revokedAt: null },
      },
    };

    clientsApi.fetchClientStatus.mockResolvedValue({
      ok: true,
      data: mockClientStatus,
    });

    formsApi.sendFormToken.mockResolvedValue({ ok: true, data: {} });

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

    const sendButton = getByTestId(`send-${FORM_TYPE}-button`);
    fireEvent.click(sendButton);
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(formsApi.sendFormToken).toHaveBeenCalledTimes(1);
      expect(formsApi.sendFormToken).toHaveBeenCalledWith(
        normalizedEmail,
        FORM_TYPE
      );
    });
  });

  test("sets error and resets activeToken if sendFormToken fails", async () => {
    const mockEmail = "TEST@Example.com";
    const normalizedEmail = mockEmail.toLowerCase();

    const FORM_TYPE = FORM_TYPES[2];

    const mockClientStatus = {
      exists: true,
      inactive: false,
      formsCompleted: 1,
      forms: {
        [FORM_TYPE]: { activeToken: false, revokedAt: null },
      },
    };

    clientsApi.fetchClientStatus.mockResolvedValue({
      ok: true,
      data: mockClientStatus,
    });

    const errorMessage = "Network error";
    formsApi.sendFormToken.mockResolvedValue({
      ok: false,
      data: { error: errorMessage },
    });

    ClientContextModule.useClientContext.mockReturnValue({
      email: "",
      clientFormsStatus: null,
      setEmail: vi.fn(),
      setClientFormsStatus: vi.fn(),
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

    const sendButton = getByTestId(`send-${FORM_TYPE}-button`);
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(formsApi.sendFormToken).toHaveBeenCalledWith(
        normalizedEmail,
        FORM_TYPE
      );

      const errorMessageEl = getByTestId("error-message");
      expect(errorMessageEl).toHaveTextContent(errorMessage);
      const setClientFormsStatusCalls =
        ClientContextModule.useClientContext().setClientFormsStatus.mock.calls;
      const lastCall =
        setClientFormsStatusCalls[setClientFormsStatusCalls.length - 1];
      const updatedStatus = lastCall[0];
      expect(updatedStatus.forms[FORM_TYPE].activeToken).toBe(false);
    });
  });

  test("shows fallback error and resets activeToken if sendFormToken fails without error message", async () => {
    const mockEmail = "test@example.com";
    const FORM_TYPE = "YSQ";

    clientsApi.fetchClientStatus.mockResolvedValue({
      ok: true,
      data: {
        exists: true,
        inactive: false,
        formsCompleted: 2,
        forms: {
          [FORM_TYPE]: { submitted: false, activeToken: false },
        },
      },
    });

    formsApi.sendFormToken.mockResolvedValue({
      ok: false,
      data: {},
    });

    const { getByTestId, findByText } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    fireEvent.change(getByTestId("email-input"), {
      target: { value: mockEmail },
    });
    fireEvent.click(getByTestId("check-button"));

    await waitFor(() =>
      expect(clientsApi.fetchClientStatus).toHaveBeenCalledWith(mockEmail)
    );

    const sendButton = getByTestId(`send-${FORM_TYPE}-button`);
    fireEvent.click(sendButton);
    await findByText(`Failed to send ${FORM_TYPE} form`);
    expect(sendButton).not.toBeDisabled();
  });
});
