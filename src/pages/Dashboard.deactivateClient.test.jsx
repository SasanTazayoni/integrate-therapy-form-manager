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
  default: ({ onDeactivateClient }) => (
    <button data-testid="modal-button-deactivate" onClick={onDeactivateClient}>
      Deactivate
    </button>
  ),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

describe("Dashboard - deactivate client flow", () => {
  const mockClientFormsStatus = { exists: true, inactive: false };

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

  test("deactivates client successfully", async () => {
    vi.spyOn(clientsApi, "fetchClientStatus").mockResolvedValue({
      ok: true,
      data: mockClientFormsStatus,
    });

    const deactivateClientMock = vi
      .spyOn(clientsApi, "deactivateClient")
      .mockResolvedValue({
        ok: true,
        data: { message: "Deactivated successfully" },
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

    fireEvent.click(getByTestId("modal-button-deactivate"));

    await waitFor(() =>
      expect(deactivateClientMock).toHaveBeenCalledWith("test@example.com")
    );

    await findByText("Client test@example.com deactivated successfully");
  });

  test("shows error if deactivateClient API fails", async () => {
    vi.spyOn(clientsApi, "fetchClientStatus").mockResolvedValue({
      ok: true,
      data: mockClientFormsStatus,
    });

    vi.spyOn(clientsApi, "deactivateClient").mockResolvedValue({
      ok: false,
      data: { error: "Failed to deactivate client" },
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

    fireEvent.click(getByTestId("modal-button-deactivate"));
    await findByText("Failed to deactivate client");
  });

  test("shows fallback error if deactivateClient API fails without error message", async () => {
    const mockEmail = "test@example.com";

    vi.spyOn(clientsApi, "fetchClientStatus").mockResolvedValue({
      ok: true,
      data: { exists: true, inactive: true, formsCompleted: 2, forms: {} },
    });

    vi.spyOn(clientsApi, "deactivateClient").mockResolvedValue({
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

    fireEvent.click(getByTestId("modal-button-deactivate"));
    await findByText("Failed to deactivate client");
  });

  test("skips deactivation immediately if loading is true", async () => {
    const deactivateClientMock = vi
      .spyOn(clientsApi, "deactivateClient")
      .mockResolvedValue({ ok: true, data: {} });

    const { getByTestId } = render(
      <MemoryRouter>
        <ClientContext.Provider value={contextValue}>
          <Dashboard />
        </ClientContext.Provider>
      </MemoryRouter>
    );

    contextValue.loading = true;
    fireEvent.click(getByTestId("modal-button-deactivate"));

    expect(deactivateClientMock).not.toHaveBeenCalled();
    expect(contextValue.setSuccessMessage).not.toHaveBeenCalled();
    expect(contextValue.setError).not.toHaveBeenCalled();
  });

  test("prevents a second deactivation while loading is true", async () => {
    const deactivateClientMock = vi
      .spyOn(clientsApi, "deactivateClient")
      .mockResolvedValue({ ok: true, data: {} });

    const mockEmail = "test@example.com";
    const mockClientStatus = {
      exists: true,
      inactive: true,
      formsCompleted: 2,
      forms: {},
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

    fireEvent.click(getByTestId("modal-button-deactivate"));
    fireEvent.click(getByTestId("modal-button-deactivate"));

    await waitFor(() => {
      expect(deactivateClientMock).toHaveBeenCalledTimes(1);
    });
  });
});
