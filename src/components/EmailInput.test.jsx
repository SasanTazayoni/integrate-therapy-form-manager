import { render, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import EmailInput from "./EmailInput";

describe("EmailInput", () => {
  const setEmailMock = vi.fn();
  const setErrorMock = vi.fn();
  const setShowAddClientPromptMock = vi.fn();
  const onConfirmAddClientMock = vi.fn();

  const defaultProps = {
    email: "",
    setEmail: setEmailMock,
    error: "",
    setError: setErrorMock,
    showAddClientPrompt: false,
    setShowAddClientPrompt: setShowAddClientPromptMock,
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the input with the correct value", () => {
    const { getByTestId } = render(<EmailInput {...defaultProps} />);
    const input = getByTestId("email-input");
    expect(input.value).toBe("");
  });

  test("calls setEmail, setError, and setShowAddClientPrompt on input change", () => {
    const { getByTestId } = render(<EmailInput {...defaultProps} />);
    const input = getByTestId("email-input");
    fireEvent.change(input, { target: { value: "test@example.com" } });
    expect(setEmailMock).toHaveBeenCalledWith("test@example.com");
    expect(setErrorMock).toHaveBeenCalledWith("");
    expect(setShowAddClientPromptMock).toHaveBeenCalledWith(false);
  });

  test("renders loading indicator when loading is true and no error or success", () => {
    const { getByText } = render(
      <EmailInput {...defaultProps} loading={true} />
    );
    expect(getByText("Loading...")).toBeInTheDocument();
  });

  test("renders error message when error prop is set", () => {
    const { getByTestId } = render(
      <EmailInput {...defaultProps} error="Invalid email" />
    );
    const errorMsg = getByTestId("error-message");
    expect(errorMsg).toBeInTheDocument();
    expect(errorMsg).toHaveTextContent("Invalid email");
  });

  test("renders success message when successMessage is set and no error", () => {
    const { getByTestId } = render(
      <EmailInput {...defaultProps} successMessage="Added successfully" />
    );
    const successMsg = getByTestId("success-message");
    expect(successMsg).toBeInTheDocument();
    expect(successMsg).toHaveTextContent("Added successfully");
  });

  test("renders add client button when showAddClientPrompt and onConfirmAddClient are set and not loading", () => {
    const { getByTestId } = render(
      <EmailInput
        {...defaultProps}
        showAddClientPrompt={true}
        onConfirmAddClient={onConfirmAddClientMock}
      />
    );
    const button = getByTestId("add-client-button");
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onConfirmAddClientMock).toHaveBeenCalled();
  });

  test("does not render add client button if loading is true", () => {
    const { queryByTestId } = render(
      <EmailInput
        {...defaultProps}
        loading={true}
        showAddClientPrompt={true}
        onConfirmAddClient={onConfirmAddClientMock}
      />
    );
    expect(queryByTestId("add-client-button")).toBeNull();
  });

  test("applies 'missing' class when error exists and email is empty", () => {
    const { getByTestId } = render(
      <EmailInput {...defaultProps} email="" error="Invalid" />
    );
    const input = getByTestId("email-input");
    expect(input.className).toContain("missing");
  });

  test("does not apply 'missing' class when email is not empty", () => {
    const { getByTestId } = render(
      <EmailInput {...defaultProps} email="test@example.com" error="Invalid" />
    );
    const input = getByTestId("email-input");
    expect(input.className).not.toContain("missing");
  });
});
