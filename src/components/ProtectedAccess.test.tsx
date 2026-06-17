import { render, fireEvent, act } from "@testing-library/react";
import { describe, vi, beforeEach, test, afterEach, expect } from "vitest";
import ProtectedAccess, { MODAL_CLOSE_DURATION_MS } from "./ProtectedAccess";

vi.mock("../api/authFrontend", () => ({
  login: vi.fn().mockResolvedValue({ ok: false, error: "Invalid credentials" }),
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

  test("shows live countdown message when rate-limited (429)", async () => {
    const { login } = await import("../api/authFrontend");
    vi.mocked(login).mockResolvedValueOnce({
      ok: false,
      error: "Too many incorrect attempts",
      retryAfter: 3,
    });

    const { getByRole, getByText } = render(
      <ProtectedAccess>
        <div>Child</div>
      </ProtectedAccess>
    );

    await act(async () => {
      fireEvent.click(getByRole("button", { name: /login/i }));
    });

    expect(getByText(/please wait 3 seconds/i)).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(1000); });
    expect(getByText(/please wait 2 seconds/i)).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(1000); });
    expect(getByText(/please wait 1 seconds/i)).toBeInTheDocument();
  });

  test("clears fade timers from a prior 401 when a 429 arrives", async () => {
    const { login } = await import("../api/authFrontend");
    vi.mocked(login)
      .mockResolvedValueOnce({ ok: false, error: "Invalid credentials" })
      .mockResolvedValueOnce({ ok: false, error: "Too many incorrect attempts", retryAfter: 5 });

    const clearSpy = vi.spyOn(window, "clearTimeout");

    const { getByRole, getByText } = render(
      <ProtectedAccess>
        <div>Child</div>
      </ProtectedAccess>
    );

    const loginBtn = getByRole("button", { name: /login/i });

    await act(async () => { fireEvent.click(loginBtn); });
    // fade timers are now set — don't advance time
    await act(async () => { fireEvent.click(loginBtn); });

    expect(clearSpy).toHaveBeenCalled();
    expect(getByText(/please wait 5 seconds/i)).toBeInTheDocument();
    clearSpy.mockRestore();
  });

  test("clears existing countdown interval when a second 429 arrives", async () => {
    const { login } = await import("../api/authFrontend");
    vi.mocked(login)
      .mockResolvedValueOnce({ ok: false, error: "Too many incorrect attempts", retryAfter: 60 })
      .mockResolvedValueOnce({ ok: false, error: "Too many incorrect attempts", retryAfter: 60 });

    const clearIntervalSpy = vi.spyOn(window, "clearInterval");

    const { getByRole } = render(
      <ProtectedAccess>
        <div>Child</div>
      </ProtectedAccess>
    );

    const loginBtn = getByRole("button", { name: /login/i });

    await act(async () => { fireEvent.click(loginBtn); });
    // countdown is now running
    await act(async () => { fireEvent.click(loginBtn); });

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  test("clears error and stops countdown when timer reaches zero", async () => {
    const { login } = await import("../api/authFrontend");
    vi.mocked(login).mockResolvedValueOnce({
      ok: false,
      error: "Too many incorrect attempts",
      retryAfter: 2,
    });

    const { getByRole, queryByText } = render(
      <ProtectedAccess>
        <div>Child</div>
      </ProtectedAccess>
    );

    await act(async () => {
      fireEvent.click(getByRole("button", { name: /login/i }));
    });

    act(() => { vi.advanceTimersByTime(2000); });

    expect(queryByText(/please wait/i)).not.toBeInTheDocument();
    expect(queryByText(/too many/i)).not.toBeInTheDocument();
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
