import { render, fireEvent } from "@testing-library/react";
import { describe, test, vi, beforeEach, expect } from "vitest";
import DeactivateClientModal from "./DeactivateClientModal";

beforeEach(() => {
  let modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);
  }
  modalRoot.innerHTML = "";
});

describe("DeactivateClientModal", () => {
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
    const { getByRole, getByText } = render(
      <DeactivateClientModal {...defaultProps} />
    );

    getByRole("dialog");

    expect(getByText("Confirm Deactivation")).toBeTruthy();

    expect(
      getByText(
        (content, element) =>
          element?.textContent ===
          "This client will be deactivated. They will no longer be able to log in or submit forms, but their data will remain in the system for 1 year. Are you sure you want to deactivate this client?"
      )
    ).toBeTruthy();
  });

  test("calls onConfirm when Deactivate button is clicked", () => {
    const { getByText } = render(<DeactivateClientModal {...defaultProps} />);
    fireEvent.click(getByText("Deactivate"));
    expect(onConfirm).toHaveBeenCalled();
  });

  test("calls onCancel when Cancel button is clicked", () => {
    const { getByText } = render(<DeactivateClientModal {...defaultProps} />);
    fireEvent.click(getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });

  test("calls onCancel when overlay is clicked", () => {
    const { getByRole } = render(<DeactivateClientModal {...defaultProps} />);
    const overlay = getByRole("dialog");
    fireEvent.click(overlay);
    expect(onCancel).toHaveBeenCalled();
  });
});
