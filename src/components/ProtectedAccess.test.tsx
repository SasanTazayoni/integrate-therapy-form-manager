import { render, fireEvent, act } from "@testing-library/react";
import { describe, vi, beforeEach, test, afterEach, expect } from "vitest";
import ProtectedAccess, { MODAL_CLOSE_DURATION_MS } from "./ProtectedAccess";

vi.mock("../api/authFrontend", () => ({
  login: vi.fn().mockResolvedValue({ ok: false, error: "Invalid credentials" }),
  TOKEN_KEY: "integrateTherapyToken",
}));

vi.mock("./modals/AdminLoginModal", () => ({
  default: ({
    username,
    password,
    error,
    onUsernameChange,
    onPasswordChange,
    onSubmit,
    onClear,
  }: {
    username: string;
    password: string;
    error: string;
    onUsernameChange: (val: string) => void;
    onPasswordChange: (val: string) => void;
    onSubmit: () => void;
    onClear: () => void;
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

  test("shows error with invalid credentials", async () => {
    const { getByRole, getByText } = render(
      <ProtectedAccess>
        <div>Child</div>
      </ProtectedAccess>
    );

    const submitButton = getByRole("button", { name: /login/i });

    await act(async () => {
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

  test("successful login hides the modal and saves session after animation", async () => {
    const { login } = await import("../api/authFrontend");
    vi.mocked(login)
      .mockResolvedValueOnce({ ok: false, error: "Invalid credentials" })
      .mockResolvedValueOnce({ ok: true });

    const { getByLabelText, getByRole, queryByRole } = render(
      <ProtectedAccess>
        <div>Child</div>
      </ProtectedAccess>
    );

    await act(async () => {
      fireEvent.change(getByLabelText(/username/i), {
        target: { value: "wrong" },
      });
      fireEvent.change(getByLabelText(/password/i), {
        target: { value: "wrong" },
      });
      fireEvent.click(getByRole("button", { name: /login/i }));
    });

    await act(async () => {
      fireEvent.change(getByLabelText(/username/i), {
        target: { value: "admin" },
      });
      fireEvent.change(getByLabelText(/password/i), {
        target: { value: "password" },
      });
      fireEvent.click(getByRole("button", { name: /login/i }));
    });

    act(() => {
      vi.advanceTimersByTime(MODAL_CLOSE_DURATION_MS);
    });

    expect(queryByRole("dialog")).not.toBeInTheDocument();
    expect(sessionStorage.getItem("integrateTherapyAuthenticated")).toBe("true");
  });

  test("second handleSubmit clears existing fadeOut and clearError timers", async () => {
    const { login } = await import("../api/authFrontend");
    vi.mocked(login)
      .mockResolvedValueOnce({ ok: false, error: "Invalid credentials" })
      .mockResolvedValueOnce({ ok: true });

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

    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: "wronguser" } });
      fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
      fireEvent.click(submitButton);
    });

    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: "admin" } });
      fireEvent.change(passwordInput, { target: { value: "password" } });
      fireEvent.click(submitButton);
    });

    expect(clearSpy).toHaveBeenCalled();

    clearSpy.mockRestore();
    vi.useRealTimers();
  });
});
