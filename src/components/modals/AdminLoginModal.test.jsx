import { render, screen, fireEvent } from "@testing-library/react";
import { vi, test, describe, beforeEach, expect } from "vitest";
import AdminLoginModal from "./AdminLoginModal";

beforeEach(() => {
  let modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);
  }
  modalRoot.innerHTML = "";
});

describe("AdminLoginModal", () => {
  const setup = (props = {}) => {
    const defaults = {
      username: "",
      password: "",
      error: "",
      closing: false,
      errorFading: false,
      onUsernameChange: vi.fn(),
      onPasswordChange: vi.fn(),
      onSubmit: vi.fn(),
      onClear: vi.fn(),
    };
    return render(<AdminLoginModal {...defaults} {...props} />);
  };

  test("renders correctly", () => {
    const { getByRole, getByPlaceholderText } = setup();

    expect(getByRole("dialog")).toBeInTheDocument();
    expect(getByRole("heading", { name: /admin login/i })).toBeInTheDocument();
    expect(getByPlaceholderText("Username")).toBeInTheDocument();
    expect(getByPlaceholderText("Password")).toBeInTheDocument();
    expect(getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(getByRole("button", { name: /clear/i })).toBeInTheDocument();
  });

  test("calls onUsernameChange and onPasswordChange", () => {
    const onUsernameChange = vi.fn();
    const onPasswordChange = vi.fn();
    const { getByPlaceholderText } = setup({
      onUsernameChange,
      onPasswordChange,
    });

    fireEvent.change(getByPlaceholderText("Username"), {
      target: { value: "admin" },
    });
    fireEvent.change(getByPlaceholderText("Password"), {
      target: { value: "secret" },
    });

    expect(onUsernameChange).toHaveBeenCalledWith("admin");
    expect(onPasswordChange).toHaveBeenCalledWith("secret");
  });

  test("calls onSubmit when form is submitted", () => {
    const onSubmit = vi.fn();
    const { getByRole } = setup({ onSubmit });

    fireEvent.click(getByRole("button", { name: /login/i }));

    expect(onSubmit).toHaveBeenCalled();
  });

  test("calls onClear when Clear button clicked", () => {
    const onClear = vi.fn();
    const { getByRole } = setup({ onClear });

    fireEvent.click(getByRole("button", { name: /clear/i }));
    expect(onClear).toHaveBeenCalled();
  });

  test("shows error message", () => {
    const { getByText } = setup({ error: "Invalid credentials" });
    expect(getByText("Invalid credentials")).toBeInTheDocument();
  });
});
