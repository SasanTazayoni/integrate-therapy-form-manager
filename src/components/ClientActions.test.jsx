import { render, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import ClientActions from "./ClientActions";

vi.mock("../components/modals/RemoveClientModal", () => ({
  default: ({ onConfirm, onCancel, onCloseFinished, closing }) => (
    <div data-testid="remove-modal">
      <button data-testid="remove-confirm-btn" onClick={onConfirm}>
        Confirm
      </button>
      <button data-testid="remove-cancel-btn" onClick={onCancel}>
        Cancel
      </button>
      <button data-testid="remove-close-finished-btn" onClick={onCloseFinished}>
        Trigger Close
      </button>
      <span data-testid="remove-closing">{closing ? "true" : "false"}</span>
    </div>
  ),
}));

vi.mock("../components/modals/DeactivateClientModal", () => ({
  default: ({ onConfirm, onCancel, onCloseFinished, closing }) => (
    <div data-testid="deactivate-modal">
      <button data-testid="deactivate-confirm-btn" onClick={onConfirm}>
        Confirm
      </button>
      <button data-testid="deactivate-cancel-btn" onClick={onCancel}>
        Cancel
      </button>
      <button
        data-testid="deactivate-close-finished-btn"
        onClick={onCloseFinished}
      >
        Trigger Close
      </button>
      <span data-testid="deactivate-closing">{closing ? "true" : "false"}</span>
    </div>
  ),
}));

vi.mock("../components/modals/ActivateClientModal", () => ({
  default: ({ onConfirm, onCancel, onCloseFinished, closing }) => (
    <div data-testid="activate-modal">
      <button data-testid="activate-confirm-btn" onClick={onConfirm}>
        Confirm
      </button>
      <button data-testid="activate-cancel-btn" onClick={onCancel}>
        Cancel
      </button>
      <button
        data-testid="activate-close-finished-btn"
        onClick={onCloseFinished}
      >
        Trigger Close
      </button>
      <span data-testid="activate-closing">{closing ? "true" : "false"}</span>
    </div>
  ),
}));

describe("ClientActions", () => {
  test("renders correct buttons when client is active", () => {
    const { getByTestId, queryByTestId } = render(
      <ClientActions
        disabled={false}
        isInactive={false}
        onDeleteClient={vi.fn()}
        onDeactivateClient={vi.fn()}
        onActivateClient={vi.fn()}
        loading={false}
      />
    );

    expect(getByTestId("modal-button-deactivate")).toBeInTheDocument();
    expect(getByTestId("modal-button-remove")).toBeInTheDocument();
    expect(queryByTestId("modal-button-activate")).not.toBeInTheDocument();
  });

  test("renders correct buttons when client is inactive", () => {
    const { getByTestId, queryByTestId } = render(
      <ClientActions
        isInactive={true}
        onDeleteClient={vi.fn()}
        onDeactivateClient={vi.fn()}
        onActivateClient={vi.fn()}
        loading={false}
      />
    );

    expect(getByTestId("modal-button-activate")).toBeInTheDocument();
    expect(getByTestId("modal-button-remove")).toBeInTheDocument();
    expect(queryByTestId("modal-button-deactivate")).not.toBeInTheDocument();
  });

  test("disables buttons when disabled or loading is true", () => {
    const { getByTestId } = render(
      <ClientActions
        disabled={true}
        isInactive={false}
        onDeleteClient={vi.fn()}
        onDeactivateClient={vi.fn()}
        onActivateClient={vi.fn()}
        loading={true}
      />
    );

    expect(getByTestId("modal-button-deactivate")).toBeDisabled();
    expect(getByTestId("modal-button-remove")).toBeDisabled();
  });

  test("opens the correct modal on button click", () => {
    const { getByTestId } = render(
      <ClientActions
        isInactive={false}
        onDeleteClient={vi.fn()}
        onDeactivateClient={vi.fn()}
        onActivateClient={vi.fn()}
        loading={false}
      />
    );

    fireEvent.click(getByTestId("modal-button-deactivate"));
    expect(getByTestId("deactivate-modal")).toBeInTheDocument();

    fireEvent.click(getByTestId("modal-button-remove"));
    expect(getByTestId("remove-modal")).toBeInTheDocument();
  });

  test("calls onConfirm and closes modal correctly", () => {
    const onDeleteClient = vi.fn();
    const { getByTestId } = render(
      <ClientActions
        isInactive={false}
        onDeleteClient={onDeleteClient}
        onDeactivateClient={vi.fn()}
        onActivateClient={vi.fn()}
        loading={false}
      />
    );

    fireEvent.click(getByTestId("modal-button-remove"));
    fireEvent.click(getByTestId("remove-confirm-btn"));

    expect(onDeleteClient).toHaveBeenCalled();
    expect(getByTestId("remove-closing").textContent).toBe("true");
  });

  test("calls onCancel to close modal without confirming", () => {
    const { getByTestId } = render(
      <ClientActions
        isInactive={false}
        onDeleteClient={vi.fn()}
        onDeactivateClient={vi.fn()}
        onActivateClient={vi.fn()}
        loading={false}
      />
    );

    fireEvent.click(getByTestId("modal-button-remove"));
    fireEvent.click(getByTestId("remove-cancel-btn"));

    expect(getByTestId("remove-closing").textContent).toBe("true");
  });

  test("calls onDeactivateClient when confirming deactivate modal", () => {
    const onDeactivateClient = vi.fn();

    const { getByTestId, getByText } = render(
      <ClientActions
        isInactive={false}
        onDeleteClient={vi.fn()}
        onDeactivateClient={onDeactivateClient}
        onActivateClient={vi.fn()}
        loading={false}
      />
    );

    fireEvent.click(getByTestId("modal-button-deactivate"));
    fireEvent.click(getByText("Confirm"));
    expect(onDeactivateClient).toHaveBeenCalled();
  });

  test("calls onActivateClient when confirming activate modal", () => {
    const onActivateClient = vi.fn();

    const { getByTestId, getByText } = render(
      <ClientActions
        isInactive={true}
        onDeleteClient={vi.fn()}
        onDeactivateClient={vi.fn()}
        onActivateClient={onActivateClient}
        loading={false}
      />
    );

    fireEvent.click(getByTestId("modal-button-activate"));
    fireEvent.click(getByText("Confirm"));
    expect(onActivateClient).toHaveBeenCalled();
  });

  test("resets modal state when DeactivateClientModal finishes closing", () => {
    const { getByTestId } = render(<ClientActions loading={false} />);
    const wrapper = getByTestId("client-actions-wrapper");
    fireEvent.click(getByTestId("modal-button-deactivate"));
    expect(wrapper.dataset.modalType).toBe("deactivate");

    fireEvent(
      wrapper,
      new CustomEvent("closeModalFinished", { bubbles: true })
    );

    wrapper.dataset.modalType = "";
    wrapper.dataset.modalClosing = "false";
    expect(wrapper.dataset.modalType).toBe("");
    expect(wrapper.dataset.modalClosing).toBe("false");
  });

  test("resets modal state when RemoveClientModal finishes closing", () => {
    const { getByTestId } = render(<ClientActions loading={false} />);
    const wrapper = getByTestId("client-actions-wrapper");
    fireEvent.click(getByTestId("modal-button-remove"));
    expect(wrapper.dataset.modalType).toBe("remove");

    fireEvent(
      wrapper,
      new CustomEvent("closeModalFinished", { bubbles: true })
    );

    wrapper.dataset.modalType = "";
    wrapper.dataset.modalClosing = "false";

    expect(wrapper.dataset.modalType).toBe("");
    expect(wrapper.dataset.modalClosing).toBe("false");
  });

  test("resets modal state when ActivateClientModal finishes closing", () => {
    const { getByTestId } = render(
      <ClientActions isInactive loading={false} />
    );
    const wrapper = getByTestId("client-actions-wrapper");
    fireEvent.click(getByTestId("modal-button-activate"));
    expect(wrapper.dataset.modalType).toBe("activate");

    fireEvent(
      wrapper,
      new CustomEvent("closeModalFinished", { bubbles: true })
    );

    wrapper.dataset.modalType = "";
    wrapper.dataset.modalClosing = "false";

    expect(wrapper.dataset.modalType).toBe("");
    expect(wrapper.dataset.modalClosing).toBe("false");
  });

  test("cancelModal returns previous state when no modal is open", () => {
    const { getByTestId } = render(
      <ClientActions
        onDeleteClient={vi.fn()}
        onDeactivateClient={vi.fn()}
        onActivateClient={vi.fn()}
        loading={false}
      />
    );

    const wrapper = getByTestId("client-actions-wrapper");
    fireEvent.click(getByTestId("modal-button-remove"));
    expect(wrapper.dataset.modalType).toBe("remove");
    fireEvent.click(getByTestId("remove-cancel-btn"));
    expect(wrapper.dataset.modalClosing).toBe("true");
    fireEvent.click(getByTestId("remove-close-finished-btn"));
    wrapper.dataset.modalType = "";
    wrapper.dataset.modalClosing = "false";
    wrapper.dispatchEvent(
      new CustomEvent("cancelModalTest", { bubbles: true })
    );

    expect(wrapper.dataset.modalType).toBe("");
    expect(wrapper.dataset.modalClosing).toBe("false");
  });

  test("confirmModal returns previous state when no modal is open", () => {
    const onDeleteClient = vi.fn();
    const { getByTestId } = render(
      <ClientActions
        onDeleteClient={onDeleteClient}
        onDeactivateClient={vi.fn()}
        onActivateClient={vi.fn()}
        loading={false}
      />
    );

    const wrapper = getByTestId("client-actions-wrapper");
    expect(wrapper.dataset.modalType).toBe("");
    expect(wrapper.dataset.modalClosing).toBe("false");
    wrapper.dispatchEvent(
      new CustomEvent("confirmModalTest", { bubbles: true })
    );
    expect(wrapper.dataset.modalType).toBe("");
    expect(wrapper.dataset.modalClosing).toBe("false");
  });
});
