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
  default: ({ onDeleteClient }) => (
    <button data-testid="modal-button-remove" onClick={onDeleteClient}>
      Delete
    </button>
  ),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

describe("Dashboard - delete client flow", () => {
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

  test("Delete button calls deleteClient after typing email and checking progress", async () => {
    vi.spyOn(clientsApi, "fetchClientStatus").mockResolvedValue({
      ok: true,
      data: mockClientFormsStatus,
    });

    const deleteClientMock = vi
      .spyOn(clientsApi, "deleteClient")
      .mockResolvedValue({
        ok: true,
        data: { message: "Deleted successfully" },
      });

    const { getByTestId } = render(
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

    fireEvent.click(getByTestId("modal-button-remove"));

    await waitFor(() =>
      expect(deleteClientMock).toHaveBeenCalledWith("test@example.com")
    );
  });
});
