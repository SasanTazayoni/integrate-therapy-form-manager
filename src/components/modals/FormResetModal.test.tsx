import { render, fireEvent } from "@testing-library/react";
import { describe, test, vi, beforeEach, expect } from "vitest";
import FormResetModal from "./FormResetModal";

beforeEach(() => {
  let modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);
  }
  modalRoot.innerHTML = "";
});

describe("FormResetModal", () => {
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
      <FormResetModal {...defaultProps} />
    );

    getByRole("dialog");

    expect(getByText("Confirm Reset")).toBeTruthy();
    expect(
      getByText("Are you sure you want to reset your progress?")
    ).toBeTruthy();
  });

  test("calls onConfirm when Reset button is clicked", () => {
    const { getByText } = render(<FormResetModal {...defaultProps} />);
    fireEvent.click(getByText("Reset"));
    expect(onConfirm).toHaveBeenCalled();
  });

  test("calls onCancel when Cancel button is clicked", () => {
    const { getByText } = render(<FormResetModal {...defaultProps} />);
    fireEvent.click(getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });

  test("calls onCancel when overlay is clicked", () => {
    const { getByRole } = render(<FormResetModal {...defaultProps} />);
    const overlay = getByRole("dialog");
    fireEvent.click(overlay);
    expect(onCancel).toHaveBeenCalled();
  });
});
