import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import ClientInfoModal from "./ClientInfoModal";

beforeEach(() => {
  let modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    const div = document.createElement("div");
    div.setAttribute("id", "modal-root");
    document.body.appendChild(div);
  }
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("ClientInfoModal", () => {
  const defaultProps = {
    name: "John Doe",
    dob: "2000-01-01",
    error: "",
    errorFading: false,
    closing: false,
    onNameChange: vi.fn(),
    onDobChange: vi.fn(),
    onSubmit: vi.fn(),
    onClear: vi.fn(),
    onCloseFinished: vi.fn(),
  };

  test("renders modal with title, inputs, and buttons", () => {
    const { getByText, getByLabelText, getByRole } = render(
      <ClientInfoModal {...defaultProps} />
    );

    expect(getByText("Your information")).toBeInTheDocument();

    const nameInput = getByLabelText("Full Name");
    const dobInput = getByLabelText("Date of Birth");

    expect(nameInput.value).toBe("John Doe");
    expect(dobInput.value).toBe("2000-01-01");

    getByText("Submit");
    getByText("Clear");

    expect(getByRole("dialog")).toBeInTheDocument();
  });

  test("calls onNameChange and onDobChange when inputs change", () => {
    const { getByLabelText } = render(<ClientInfoModal {...defaultProps} />);

    const nameInput = getByLabelText("Full Name");
    const dobInput = getByLabelText("Date of Birth");

    fireEvent.change(nameInput, { target: { value: "Jane Smith" } });
    expect(defaultProps.onNameChange).toHaveBeenCalledWith("Jane Smith");

    fireEvent.change(dobInput, { target: { value: "1999-12-31" } });
    expect(defaultProps.onDobChange).toHaveBeenCalledWith("1999-12-31");
  });

  test("calls onSubmit when Submit button is clicked", () => {
    const { getByText } = render(<ClientInfoModal {...defaultProps} />);
    fireEvent.click(getByText("Submit"));
    expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  test("calls onClear when Clear button is clicked", () => {
    const { getByText } = render(<ClientInfoModal {...defaultProps} />);
    fireEvent.click(getByText("Clear"));
    expect(defaultProps.onClear).toHaveBeenCalledTimes(1);
  });

  test("displays error message correctly", () => {
    const { getByText, rerender } = render(
      <ClientInfoModal {...defaultProps} error="Name is required" />
    );

    const errorMsg = getByText("Name is required");
    expect(errorMsg).toBeInTheDocument();
    expect(errorMsg).toHaveStyle("opacity: 1");

    rerender(
      <ClientInfoModal {...defaultProps} error="Name is required" errorFading />
    );
    expect(getByText("Name is required")).toHaveStyle("opacity: 0");
  });

  test("resets inputs if onClear is not provided", () => {
    const { getByText, getByLabelText } = render(
      <ClientInfoModal {...defaultProps} onClear={undefined} />
    );

    const nameInput = getByLabelText("Full Name");
    const dobInput = getByLabelText("Date of Birth");

    fireEvent.change(nameInput, { target: { value: "Changed Name" } });
    fireEvent.change(dobInput, { target: { value: "1990-01-01" } });

    fireEvent.click(getByText("Clear"));

    expect(defaultProps.onNameChange).toHaveBeenCalledWith("");
    expect(defaultProps.onDobChange).toHaveBeenCalledWith("");
  });
});
