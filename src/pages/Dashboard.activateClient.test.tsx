import { render, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, beforeAll, afterAll, vi } from "vitest";
import Dashboard from "./Dashboard";
import { ClientContext } from "../context/ClientContext";
import { MemoryRouter } from "react-router-dom";
import * as clientsApi from "../api/clientsFrontend";

beforeAll(() => {
  const modalRoot = document.createElement("div");
  modalRoot.setAttribute("id", "modal-root");
  document.body.appendChild(modalRoot);
});

afterAll(() => {
  const modalRoot = document.getElementById("modal-root");
  if (modalRoot) document.body.removeChild(modalRoot);
});

vi.mock("../components/ClientActions", () => ({
  default: ({ onActivateClient }: { onActivateClient: () => void }) => (
    <button data-testid="modal-button-activate" onClick={onActivateClient}>
      Activate
    </button>
  ),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...(actual as object), useNavigate: () => vi.fn() };
});

describe("Dashboard - activate client flow", () => {
  const mockClientFormsStatus = { exists: true, clientStatus: "inactive" as const, inactive: true, forms: {} as never };

  const contextValue = {
    email: "",
    setEmail: vi.fn(),
    clientFormsStatus: mockClientFormsStatus,
    setClientFormsStatus: vi.fn(),
    successMessage: "",
    setSuccessMessage: vi.fn(),
    error: "",
    setError: vi.fn(),
  };

  test("activates client successfully", async () => {
    vi.spyOn(clientsApi, "fetchClientStatus").mockResolvedValue({
      ok: true,
      data: mockClientFormsStatus,
    });

    const activateClientMock = vi
      .spyOn(clientsApi, "activateClient")
      .mockResolvedValue({
        ok: true,
        data: { message: "Activated successfully", client: { id: "", email: "", name: "", status: "", inactivated_at: null, delete_inactive: null } },
      });

    const { getByTestId, findByText } = render(
      <MemoryRouter>
        <ClientContext.Provider value={contextValue}>
          <Dashboard />
        </ClientContext.Provider>
      </MemoryRouter>
    );

    const emailInput = getByTestId("email-input");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(getByTestId("check-button"));

    await waitFor(() =>
      expect(contextValue.setClientFormsStatus).toHaveBeenCalledWith(
        expect.objectContaining({ exists: true })
      )
    );

    fireEvent.click(getByTestId("modal-button-activate"));

    await waitFor(() =>
      expect(activateClientMock).toHaveBeenCalledWith("test@example.com")
    );

    await findByText("Client test@example.com activated successfully");
  });

  test("shows error if activateClient API fails", async () => {
    vi.spyOn(clientsApi, "fetchClientStatus").mockResolvedValue({
      ok: true,
      data: mockClientFormsStatus,
    });

    vi.spyOn(clientsApi, "activateClient").mockResolvedValue({
      ok: false,
      data: { error: "Failed to activate client" },
    });

    const { getByTestId, findByText } = render(
      <MemoryRouter>
        <ClientContext.Provider value={contextValue}>
          <Dashboard />
        </ClientContext.Provider>
      </MemoryRouter>
    );

    const emailInput = getByTestId("email-input");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(getByTestId("check-button"));

    await waitFor(() =>
      expect(contextValue.setClientFormsStatus).toHaveBeenCalledWith(
        expect.objectContaining({ exists: true })
      )
    );

    fireEvent.click(getByTestId("modal-button-activate"));
    await findByText("Failed to activate client");
  });

  test("shows fallback error if activateClient API fails without error message", async () => {
    const mockEmail = "test@example.com";

    vi.spyOn(clientsApi, "fetchClientStatus").mockResolvedValue({
      ok: true,
      data: { exists: true, clientStatus: "active" as const, inactive: false, formsCompleted: 2, forms: {} as never },
    });

    vi.spyOn(clientsApi, "activateClient").mockResolvedValue({
      ok: false,
      data: { error: "" },
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

    fireEvent.click(getByTestId("modal-button-activate"));
    await findByText("Failed to activate client");
  });

  test("skips activation immediately if loading is true", async () => {
    const activateClientMock = vi
      .spyOn(clientsApi, "activateClient")
      .mockResolvedValue({ ok: true, data: { message: "", client: { id: "", email: "", name: "", status: "", inactivated_at: null, delete_inactive: null } } });

    const { getByTestId } = render(
      <MemoryRouter>
        <ClientContext.Provider value={contextValue}>
          <Dashboard />
        </ClientContext.Provider>
      </MemoryRouter>
    );

    fireEvent.click(getByTestId("modal-button-activate"));
    expect(activateClientMock).not.toHaveBeenCalled();
    expect(contextValue.setSuccessMessage).not.toHaveBeenCalled();
    expect(contextValue.setError).not.toHaveBeenCalled();
  });

  test("prevents a second activation while loading is true", async () => {
    const activateClientMock = vi
      .spyOn(clientsApi, "activateClient")
      .mockResolvedValue({ ok: true, data: { message: "", client: { id: "", email: "", name: "", status: "", inactivated_at: null, delete_inactive: null } } });

    const mockEmail = "test@example.com";
    const mockClientStatus = {
      exists: true,
      clientStatus: "active" as const,
      inactive: false,
      formsCompleted: 2,
      forms: {} as never,
    };
    vi.spyOn(clientsApi, "fetchClientStatus").mockResolvedValue({
      ok: true,
      data: mockClientStatus,
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <ClientContext.Provider value={contextValue}>
          <Dashboard />
        </ClientContext.Provider>
      </MemoryRouter>
    );

    const emailInput = getByTestId("email-input");
    fireEvent.change(emailInput, { target: { value: mockEmail } });
    fireEvent.click(getByTestId("check-button"));

    await waitFor(() => {
      expect(clientsApi.fetchClientStatus).toHaveBeenCalledWith(mockEmail);
    });

    fireEvent.click(getByTestId("modal-button-activate"));
    fireEvent.click(getByTestId("modal-button-activate"));

    await waitFor(() => {
      expect(activateClientMock).toHaveBeenCalledTimes(1);
    });
  });
});
