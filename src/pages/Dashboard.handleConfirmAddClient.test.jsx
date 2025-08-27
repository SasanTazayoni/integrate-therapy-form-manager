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
import Dashboard from "./Dashboard";
import { useClientContext } from "../context/ClientContext";
import { MemoryRouter } from "react-router-dom";
import * as clientsApi from "../api/clientsFrontend";

vi.mock("../context/ClientContext", () => ({
  useClientContext: vi.fn(),
}));

vi.mock("../api/clientsFrontend", () => ({
  fetchClientStatus: vi.fn(),
  addClient: vi.fn(),
  deleteClient: vi.fn(),
  deactivateClient: vi.fn(),
  activateClient: vi.fn(),
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
