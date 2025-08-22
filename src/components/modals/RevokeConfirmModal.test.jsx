import { render, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, afterEach, beforeEach } from "vitest";
import RevokeConfirmModal from "./RevokeConfirmModal";

beforeEach(() => {
  let modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);
  }
  modalRoot.innerHTML = "";
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("RevokeConfirmModal", () => {
  const defaultProps = {
    closing: false,
    onCancel: vi.fn(),
    onCloseFinished: vi.fn(),
    onConfirm: vi.fn(),
  };

  test("renders the modal with title and message", () => {
    const { container } = render(<RevokeConfirmModal {...defaultProps} />, {
      container: document.getElementById("modal-root"),
    });

    const modal = container.querySelector('[role="dialog"]');
    expect(modal).toBeTruthy();

    const title = container.querySelector("#revoke-title");
    expect(title).toBeTruthy();
    expect(title.textContent).toBe("Confirm Revoke");

    const message = Array.from(container.querySelectorAll("p")).find((p) =>
      p.textContent?.startsWith(
        "This action will deactivate the form sent to the client"
      )
    );
    expect(message).toBeTruthy();
  });

  test("calls onConfirm when Revoke button is clicked", () => {
    const { container } = render(<RevokeConfirmModal {...defaultProps} />, {
      container: document.getElementById("modal-root"),
    });

    const revokeBtn = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.textContent === "Revoke"
    );
    expect(revokeBtn).toBeTruthy();
    fireEvent.click(revokeBtn);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  test("calls onCancel when Cancel button is clicked", () => {
    const { container } = render(<RevokeConfirmModal {...defaultProps} />, {
      container: document.getElementById("modal-root"),
    });

    const cancelBtn = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.textContent === "Cancel"
    );
    expect(cancelBtn).toBeTruthy();
    fireEvent.click(cancelBtn);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  test("calls onCancel when overlay is clicked", () => {
    const { container } = render(<RevokeConfirmModal {...defaultProps} />, {
      container: document.getElementById("modal-root"),
    });

    const modal = container.querySelector('[role="dialog"]');
    expect(modal).toBeTruthy();
    fireEvent.click(modal.parentElement);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });
});
