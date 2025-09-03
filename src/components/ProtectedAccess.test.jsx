import { render, fireEvent, act, waitFor } from "@testing-library/react";
import { describe, vi, beforeEach, test, afterEach, expect } from "vitest";
import ProtectedAccess from "./ProtectedAccess";

vi.mock("./modals/AdminLoginModal", () => ({
  default: ({
    username,
    password,
    error,
    onUsernameChange,
    onPasswordChange,
    onSubmit,
    onClear,
  }) => (
    <div role="dialog">
      <input
        aria-label="username"
        value={username}
        onChange={(e) => onUsernameChange(e.target.value)}
      />
      <input
        aria-label="password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
      />
      <div>{error}</div>
      <button type="submit" onClick={onSubmit}>
        Login
      </button>
      <button type="button" onClick={onClear}>
        Clear
      </button>
    </div>
  ),
}));

beforeEach(() => {
  const modalRoot = document.createElement("div");
  modalRoot.setAttribute("id", "modal-root");
  document.body.appendChild(modalRoot);

  vi.stubEnv("VITE_THERAPIST_USERNAME", "admin");
  vi.stubEnv("VITE_THERAPIST_PASSWORD", "password");
});

afterEach(() => {
  const modalRoot = document.getElementById("modal-root");
  modalRoot?.remove();
  sessionStorage.clear();
  vi.useRealTimers();
});

describe("ProtectedAccess", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  test("renders children when already authenticated in sessionStorage", () => {
    sessionStorage.setItem("integrateTherapyAuthenticated", "true");
    const { getByTestId, queryByText } = render(
      <ProtectedAccess>
        <div data-testid="protected-child">Hello</div>
      </ProtectedAccess>
    );

    expect(getByTestId("protected-child")).toBeInTheDocument();
    expect(queryByText(/invalid/i)).not.toBeInTheDocument();
  });

  test("renders login modal when not authenticated", () => {
    const { getByRole, getByTestId } = render(
      <ProtectedAccess>
        <div data-testid="protected-child">Hello</div>
      </ProtectedAccess>
    );

    expect(getByTestId("protected-child")).toBeInTheDocument();
    expect(getByRole("dialog")).toBeInTheDocument();
  });

  test("handles username/password input changes", () => {
    const { getByLabelText } = render(
      <ProtectedAccess>
        <div>Child</div>
      </ProtectedAccess>
    );

    const usernameInput = getByLabelText(/username/i);
    const passwordInput = getByLabelText(/password/i);

    fireEvent.change(usernameInput, { target: { value: "newuser" } });
    fireEvent.change(passwordInput, { target: { value: "newpass" } });

    expect(usernameInput).toHaveValue("newuser");
    expect(passwordInput).toHaveValue("newpass");
  });

  test("shows error with invalid credentials", () => {
    const { getByRole, getByText } = render(
      <ProtectedAccess>
        <div>Child</div>
      </ProtectedAccess>
    );

    const submitButton = getByRole("button", { name: /login/i });

    act(() => {
      fireEvent.click(submitButton);
    });

    expect(getByText(/invalid credentials/i)).toBeInTheDocument();
  });

  test("clears the form when clicking clear", () => {
    const { getByLabelText, getByRole } = render(
      <ProtectedAccess>
        <div>Child</div>
      </ProtectedAccess>
    );

    const usernameInput = getByLabelText(/username/i);
    const passwordInput = getByLabelText(/password/i);
    const clearButton = getByRole("button", { name: /clear/i });

    fireEvent.change(usernameInput, { target: { value: "foo" } });
    fireEvent.change(passwordInput, { target: { value: "bar" } });

    act(() => {
      fireEvent.click(clearButton);
    });

    expect(usernameInput).toHaveValue("");
    expect(passwordInput).toHaveValue("");
  });

  test("second handleSubmit clears existing fadeOut and clearError timers", () => {
    vi.useFakeTimers();
    const clearSpy = vi.spyOn(window, "clearTimeout");

    const { getByRole, getByLabelText } = render(
      <ProtectedAccess>
        <div>Child</div>
      </ProtectedAccess>
    );

    const usernameInput = getByLabelText(/username/i);
    const passwordInput = getByLabelText(/password/i);
    const submitButton = getByRole("button", { name: /login/i });

    act(() => {
      fireEvent.change(usernameInput, { target: { value: "wronguser" } });
      fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
      fireEvent.click(submitButton);
    });

    act(() => {
      fireEvent.change(usernameInput, { target: { value: "admin" } });
      fireEvent.change(passwordInput, { target: { value: "password" } });
      fireEvent.click(submitButton);
    });

    expect(clearSpy).toHaveBeenCalled();

    clearSpy.mockRestore();
    vi.useRealTimers();
  });
});
