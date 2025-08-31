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
import truncateEmail from "../utils/truncateEmail";

vi.mock("../context/ClientContext", () => ({
  useClientContext: vi.fn(),
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

  test("resets confirmedEmail and updates successMessage when checking a different email", async () => {
    const setClientFormsStatusMock = vi.fn();
    const setEmailMock = vi.fn();

    useClientContext.mockReturnValue({
      email: "",
      setEmail: setEmailMock,
      clientFormsStatus: { exists: true },
      setClientFormsStatus: setClientFormsStatusMock,
    });

    const firstClientStatus = {
      exists: true,
      inactive: false,
      formsCompleted: 1,
      forms: {},
    };
    const secondClientStatus = {
      exists: true,
      inactive: false,
      formsCompleted: 2,
      forms: {},
    };

    clientsApi.fetchClientStatus
      .mockResolvedValueOnce({ ok: true, data: firstClientStatus })
      .mockResolvedValueOnce({ ok: true, data: secondClientStatus });

    const { getByTestId } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const emailInput = getByTestId("email-input");
    const checkButton = getByTestId("check-button");
    fireEvent.change(emailInput, { target: { value: "first@example.com" } });
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(setClientFormsStatusMock).toHaveBeenCalledWith(firstClientStatus);
    });

    fireEvent.change(emailInput, { target: { value: "second@example.com" } });
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(setClientFormsStatusMock).toHaveBeenCalledWith(secondClientStatus);
      const successMessage = getByTestId("success-message");
      expect(successMessage).toHaveTextContent(
        `Retrieved data successfully for ${truncateEmail("second@example.com")}`
      );
    });
  });

  test("shows fallback error if fetchClientStatus fails without error message", async () => {
    const mockEmail = "test@example.com";

    clientsApi.fetchClientStatus.mockResolvedValue({
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
    await findByText("Failed to fetch progress");
  });
});
