import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor, fireEvent } from "@testing-library/react";
import QuestionnaireForm, { reducer } from "./QuestionnaireForm";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import * as api from "../api/formsFrontend";

vi.spyOn(api, "validateFormToken").mockResolvedValue({
  ok: false,
  error: "Invalid token",
});

vi.mock("react-router-dom", async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    useActionData: () => ({ error: "Something went wrong" }),
  };
});

vi.mock("./modals/InvalidTokenModal", () => ({
  default: () => (
    <div data-testid="mock-invalid-token">
      <h2>Invalid Form</h2>
    </div>
  ),
}));

vi.mock("./modals/ClientInfoModal", () => ({
  default: ({ name, dob, error, onSubmit, onNameChange, onDobChange }) => (
    <div data-testid="client-info-modal">
      <input
        data-testid="modal-name"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />
      <input
        data-testid="modal-dob"
        value={dob}
        onChange={(e) => onDobChange(e.target.value)}
      />
      {error && <span data-testid="client-info-error">{error}</span>}
      <button onClick={onSubmit}>Submit</button>
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
  if (modalRoot) document.body.removeChild(modalRoot);
});

describe("QuestionnaireForm component", () => {
  const mockToken = "token-without-client-info";

  test("should return the same state for unknown actions", () => {
    const initialState = { status: "loading" };
    const action = { type: "UNKNOWN" };
    expect(reducer(initialState, action)).toEqual(initialState);
  });

  test("should handle INVALID action", () => {
    const initialState = { status: "loading" };
    const action = { type: "INVALID", payload: "Error message" };
    const expectedState = { status: "error", message: "Error message" };
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  test("should handle VALID action", () => {
    const initialState = { status: "loading" };
    const action = { type: "VALID" };
    const expectedState = { status: "valid" };
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  test("shows loader when state is loading", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: (
            <QuestionnaireForm
              title="Test Form"
              questionnaire="TEST_FORM"
              token="dummy-token"
            >
              <div>Child Content</div>
            </QuestionnaireForm>
          ),
        },
      ],
      { initialEntries: ["/"] }
    );

    const { container } = render(<RouterProvider router={router} />);

    const loader = container.querySelector(".animate-spin");
    expect(loader).not.toBeNull();

    const childDivs = Array.from(container.querySelectorAll("div"));
    const childContent = childDivs.find(
      (el) => el.textContent === "Child Content"
    );
    expect(childContent).toBeUndefined();
  });

  test("shows InvalidTokenModal when validateFormToken fails", async () => {
    vi.spyOn(api, "validateFormToken").mockResolvedValue({
      ok: false,
      error: "Invalid token",
    });

    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: (
            <QuestionnaireForm
              title="Test Form"
              questionnaire="TEST_FORM"
              token="bad-token"
            >
              <div>Child Content</div>
            </QuestionnaireForm>
          ),
        },
      ],
      { initialEntries: ["/"] }
    );

    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      const modal = container.querySelector("h2");
      expect(modal?.textContent).toBe("Invalid Form");
      const loader = container.querySelector(".animate-spin");
      expect(loader).toBeNull();
    });
  });

  test("renders children and does not show loader for valid token", async () => {
    vi.spyOn(api, "validateFormToken").mockResolvedValue({
      ok: true,
      data: {
        valid: true,
        questionnaire: "TEST_FORM",
        client: { name: "John Doe", dob: "1990-01-01" },
      },
    });

    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: (
            <QuestionnaireForm
              title="Test Form"
              questionnaire="TEST_FORM"
              token="valid-token"
            >
              <div data-testid="child-content">Child Content</div>
            </QuestionnaireForm>
          ),
        },
      ],
      { initialEntries: ["/"] }
    );

    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      const loader = container.querySelector(".animate-spin");
      expect(loader).toBeNull();
      const child = container.querySelector('[data-testid="child-content"]');
      expect(child).not.toBeNull();
      expect(child.textContent).toBe("Child Content");
    });
  });

  test("opens ClientInfoModal if client has no name or dob", async () => {
    vi.spyOn(api, "validateFormToken").mockResolvedValue({
      ok: true,
      data: {
        valid: true,
        questionnaire: "TEST_FORM",
        client: { name: "", dob: "" },
      },
    });

    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: (
            <QuestionnaireForm
              title="Test Form"
              questionnaire="TEST_FORM"
              token={mockToken}
            >
              <div>Child Content</div>
            </QuestionnaireForm>
          ),
        },
      ],
      { initialEntries: ["/"] }
    );

    const { getByTestId } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      const modal = getByTestId("client-info-modal");
      expect(modal).toBeTruthy();
      expect(getByTestId("modal-name").textContent).toBe("");
      expect(getByTestId("modal-dob").textContent).toBe("");
    });
  });

  test("updates client info modal state when typing name and dob", async () => {
    vi.spyOn(api, "validateFormToken").mockResolvedValue({
      ok: true,
      data: {
        valid: true,
        questionnaire: "TEST_FORM",
        client: { name: "", dob: "" }, // missing info triggers modal
      },
    });

    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: (
            <QuestionnaireForm
              title="Test Form"
              questionnaire="TEST_FORM"
              token="token-missing-info"
            >
              <div>Child Content</div>
            </QuestionnaireForm>
          ),
        },
      ],
      { initialEntries: ["/"] }
    );

    const { getByTestId } = render(<RouterProvider router={router} />);
    const modal = await waitFor(() => getByTestId("client-info-modal"));
    expect(modal).toBeTruthy();
    const nameInput = getByTestId("modal-name");
    const dobInput = getByTestId("modal-dob");
    fireEvent.change(nameInput, { target: { value: "Jane Doe" } });
    expect(nameInput.value).toBe("Jane Doe");
    fireEvent.change(dobInput, { target: { value: "2000-12-31" } });
    expect(dobInput.value).toBe("2000-12-31");
  });

  test("calls onError when actionData.error is present", () => {
    const onError = vi.fn();

    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: (
            <QuestionnaireForm
              title="Test Form"
              questionnaire="TEST_FORM"
              token="valid-token"
              onError={onError}
            >
              <div>Child Content</div>
            </QuestionnaireForm>
          ),
        },
      ],
      { initialEntries: ["/"] }
    );

    render(<RouterProvider router={router} />);
    expect(onError).toHaveBeenCalledWith("Something went wrong");
  });
});
