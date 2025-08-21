import { render, fireEvent } from "@testing-library/react";
import { describe, test, vi, beforeEach, expect } from "vitest";
import ActivateClientModal from "./ActivateClientModal";

beforeEach(() => {
  let modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);
  }
  modalRoot.innerHTML = "";
});

describe("ActivateClientModal", () => {
  const onCancel = vi.fn();
  const onConfirm = vi.fn();
  const onCloseFinished = vi.fn();

  const defaultProps = {
    closing: false,
    onCancel,
    onConfirm,
    onCloseFinished,
  };

  test("renders the modal with title and message", () => {
    render(<ActivateClientModal {...defaultProps} />);

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();

    const title = document.getElementById("activate-client-title");
    expect(title).toBeTruthy();
    expect(title?.textContent).toBe("Confirm Activation");

    const message = dialog?.querySelector("p");
    expect(message).toBeTruthy();
    expect(message?.textContent).toMatch(
      /This client will be activated\. They will regain access to forms and will no longer be pending deletion\. Are you sure you want to activate this client\?/
    );
  });

  test("calls onConfirm when Activate button is clicked", () => {
    const { getByText } = render(<ActivateClientModal {...defaultProps} />);
    fireEvent.click(getByText("Activate"));
    expect(onConfirm).toHaveBeenCalled();
  });

  test("calls onCancel when Cancel button is clicked", () => {
    const { getByText } = render(<ActivateClientModal {...defaultProps} />);
    fireEvent.click(getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });

  test("calls onCancel when overlay is clicked", () => {
    const { getByRole } = render(<ActivateClientModal {...defaultProps} />);
    const overlay = getByRole("dialog"); // modal container
    fireEvent.click(overlay);
    expect(onCancel).toHaveBeenCalled();
  });
});
