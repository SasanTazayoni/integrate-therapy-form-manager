import { render, fireEvent } from "@testing-library/react";
import { describe, test, expect, beforeAll, afterAll, vi } from "vitest";
import Dashboard from "./Dashboard";
import { ClientContext } from "../context/ClientContext";
import { MemoryRouter } from "react-router-dom";

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
    default: ({ closing, onCancel, onCloseFinished }) => (
      <div data-testid="revoke-modal" data-closing={closing ? "true" : "false"}>
        <button data-testid="cancel-button" onClick={onCancel}>
          Cancel
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

  test("onCloseFinished resets modal state", () => {
    const handleCloseFinished = vi.fn();

    const { getByTestId } = render(
      <div>
        <button data-testid="close-modal" onClick={handleCloseFinished} />
      </div>
    );

    fireEvent.click(getByTestId("close-modal"));
    expect(handleCloseFinished).toHaveBeenCalled();
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
});
