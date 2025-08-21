import { render, fireEvent } from "@testing-library/react";
import { describe, test, vi, beforeEach, expect } from "vitest";
import RemoveClientModal from "./RemoveClientModal";

beforeEach(() => {
  let modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);
  }
  modalRoot.innerHTML = "";
});

describe("RemoveClientModal", () => {
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
    render(<RemoveClientModal {...defaultProps} />);

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();

    const title = document.querySelector("#remove-client-title");
    expect(title).toBeTruthy();
    expect(title?.textContent).toBe("Confirm Deletion");

    const message = document.querySelector("p");
    expect(message).toBeTruthy();
    expect(message?.textContent).toMatch(
      /This client and all their details will be permanently removed. Are you absolutely sure you want to delete the data\?/
    );
  });

  test("calls onConfirm when Confirm button is clicked", () => {
    const { getByText } = render(<RemoveClientModal {...defaultProps} />);
    fireEvent.click(getByText("Confirm"));
    expect(onConfirm).toHaveBeenCalled();
  });

  test("calls onCancel when Cancel button is clicked", () => {
    const { getByText } = render(<RemoveClientModal {...defaultProps} />);
    fireEvent.click(getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });

  test("calls onCancel when overlay is clicked", () => {
    const { getByRole } = render(<RemoveClientModal {...defaultProps} />);
    const overlay = getByRole("dialog");
    fireEvent.click(overlay);
    expect(onCancel).toHaveBeenCalled();
  });
});
