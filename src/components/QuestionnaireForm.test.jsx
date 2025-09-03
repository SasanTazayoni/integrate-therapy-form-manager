import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor, fireEvent } from "@testing-library/react";
import QuestionnaireForm, { reducer } from "./QuestionnaireForm";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import * as api from "../api/formsFrontend";
import { createRef } from "react";
import setErrorTimers from "../utils/startErrorFadeTimers";

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

  test("dispatches fadeOutAction then clearAction at the right times", async () => {
    const dispatch = vi.fn();
    const fadeRef = createRef();
    const clearRef = createRef();

    setErrorTimers(
      dispatch,
      "BEGIN_ERROR_FADE_OUT",
      "CLEAR_ERROR",
      50,
      100,
      fadeRef,
      clearRef
    );

    expect(dispatch).not.toHaveBeenCalled();
    await new Promise((r) => setTimeout(r, 60));
    expect(dispatch).toHaveBeenCalledWith({ type: "BEGIN_ERROR_FADE_OUT" });
    await new Promise((r) => setTimeout(r, 50));
    expect(dispatch).toHaveBeenCalledWith({ type: "CLEAR_ERROR" });
  });

  test("error fades then clears in ClientInfoModal", async () => {
    vi.spyOn(api, "validateFormToken").mockResolvedValue({
      ok: true,
      data: {
        valid: true,
        questionnaire: "TEST_FORM",
        client: { name: "", dob: "" },
      },
    });
    vi.spyOn(api, "updateClientInfo").mockResolvedValue({ ok: true });

    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: (
            <QuestionnaireForm
              title="Test"
              questionnaire="TEST_FORM"
              token="token"
            >
              <div>Child</div>
            </QuestionnaireForm>
          ),
        },
      ],
      { initialEntries: ["/"] }
    );

    const { getByTestId, queryByTestId } = render(
      <RouterProvider router={router} />
    );

    const modal = await waitFor(() => getByTestId("client-info-modal"));
    fireEvent.click(modal.querySelector("button"));
    const errorEl = await waitFor(() => getByTestId("client-info-error"));
    expect(errorEl.textContent).toBe("Inputs cannot be empty");
    await new Promise((r) => setTimeout(r, 2600));
    expect(getByTestId("client-info-error")).toBeTruthy();
    await new Promise((r) => setTimeout(r, 500));

    await waitFor(() => {
      expect(queryByTestId("client-info-error")).toBeNull();
    });
  });

  test("shows error modal when validateFormToken returns mismatched questionnaire", async () => {
    vi.spyOn(api, "validateFormToken").mockResolvedValue({
      ok: true,
      data: {
        valid: false,
        questionnaire: "OTHER_FORM",
        client: { name: "John Doe", dob: "1990-01-01" },
        message: "Form mismatch error",
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
              token="some-token"
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

  test("shows correct validation errors in ClientInfoModal", async () => {
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
              token="token"
            >
              <div>Child</div>
            </QuestionnaireForm>
          ),
        },
      ],
      { initialEntries: ["/"] }
    );

    const { getByTestId } = render(<RouterProvider router={router} />);
    const modal = await waitFor(() => getByTestId("client-info-modal"));
    const nameInput = getByTestId("modal-name");
    const dobInput = getByTestId("modal-dob");
    const submitBtn = modal.querySelector("button");

    fireEvent.change(nameInput, { target: { value: "" } });
    fireEvent.change(dobInput, { target: { value: "" } });
    fireEvent.click(submitBtn);
    let errorEl = await waitFor(() => getByTestId("client-info-error"));
    expect(errorEl.textContent).toBe("Inputs cannot be empty");

    fireEvent.change(nameInput, { target: { value: "" } });
    fireEvent.change(dobInput, { target: { value: "2000-01-01" } });
    fireEvent.click(submitBtn);
    errorEl = await waitFor(() => getByTestId("client-info-error"));
    expect(errorEl.textContent).toBe("Please enter your full name");

    fireEvent.change(nameInput, { target: { value: "Jane Doe" } });
    fireEvent.change(dobInput, { target: { value: "" } });
    fireEvent.click(submitBtn);
    errorEl = await waitFor(() => getByTestId("client-info-error"));
    expect(errorEl.textContent).toBe("Please enter your date of birth");
  });

  test("shows API error if updateClientInfo fails", async () => {
    vi.spyOn(api, "validateFormToken").mockResolvedValue({
      ok: true,
      data: {
        valid: true,
        questionnaire: "TEST_FORM",
        client: { name: "", dob: "" },
      },
    });

    vi.spyOn(api, "updateClientInfo").mockResolvedValue({
      ok: false,
      error: "Server rejected update",
    });

    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: (
            <QuestionnaireForm
              title="Test"
              questionnaire="TEST_FORM"
              token="token"
            >
              <div>Child</div>
            </QuestionnaireForm>
          ),
        },
      ],
      { initialEntries: ["/"] }
    );

    const { getByTestId } = render(<RouterProvider router={router} />);
    const modal = await waitFor(() => getByTestId("client-info-modal"));

    fireEvent.change(getByTestId("modal-name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(getByTestId("modal-dob"), {
      target: { value: "1990-01-01" },
    });

    fireEvent.click(modal.querySelector("button"));
    const errorEl = await waitFor(() => getByTestId("client-info-error"));
    expect(errorEl.textContent).toBe("Server rejected update");
  });

  test("shows fallback error if updateClientInfo fails without error message", async () => {
    vi.spyOn(api, "validateFormToken").mockResolvedValue({
      ok: true,
      data: {
        valid: true,
        questionnaire: "TEST_FORM",
        client: { name: "", dob: "" },
      },
    });

    vi.spyOn(api, "updateClientInfo").mockResolvedValue({
      ok: false,
      error: undefined,
    });

    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: (
            <QuestionnaireForm
              title="Test"
              questionnaire="TEST_FORM"
              token="token"
            >
              <div>Child</div>
            </QuestionnaireForm>
          ),
        },
      ],
      { initialEntries: ["/"] }
    );

    const { getByTestId } = render(<RouterProvider router={router} />);
    const modal = await waitFor(() => getByTestId("client-info-modal"));

    fireEvent.change(getByTestId("modal-name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(getByTestId("modal-dob"), {
      target: { value: "1990-01-01" },
    });

    fireEvent.click(modal.querySelector("button"));
    const errorEl = await waitFor(() => getByTestId("client-info-error"));
    expect(errorEl.textContent).toBe("Failed to update info");
  });

  test("closes modal after successful client info submission", async () => {
    vi.spyOn(api, "validateFormToken").mockResolvedValue({
      ok: true,
      data: {
        valid: true,
        questionnaire: "TEST_FORM",
        client: { name: "", dob: "" },
      },
    });

    vi.spyOn(api, "updateClientInfo").mockResolvedValue({ ok: true });

    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: (
            <QuestionnaireForm
              title="Test"
              questionnaire="TEST_FORM"
              token="token"
            >
              <div>Child</div>
            </QuestionnaireForm>
          ),
        },
      ],
      { initialEntries: ["/"] }
    );

    const { getByTestId, queryByTestId } = render(
      <RouterProvider router={router} />
    );
    const modal = await waitFor(() => getByTestId("client-info-modal"));
    fireEvent.change(getByTestId("modal-name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(getByTestId("modal-dob"), {
      target: { value: "1990-01-01" },
    });
    fireEvent.click(modal.querySelector("button"));
    await new Promise((r) => setTimeout(r, 600));
    expect(queryByTestId("client-info-modal")).toBeNull();
  });

  test("dispatches INVALID immediately if no token is provided", async () => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: (
            <QuestionnaireForm title="No Token Form" questionnaire="TEST_FORM">
              <div>Child Content</div>
            </QuestionnaireForm>
          ),
        },
      ],
      { initialEntries: ["/"] }
    );

    const { getByText, container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(container.querySelector("h2")?.textContent).toBe("Invalid Form");
    });

    expect(() => getByText("Child Content")).toThrow();
  });

  test("uses DEFAULT_INVALID_MSG when validateFormToken returns !ok and no error", async () => {
    vi.spyOn(api, "validateFormToken").mockResolvedValue({
      ok: false,
      error: undefined,
    });

    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: (
            <QuestionnaireForm
              title="Fallback Test Form"
              questionnaire="TEST_FORM"
              token="token-fallback-ok"
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
    });
  });

  test("uses DEFAULT_INVALID_MSG when validateFormToken returns mismatched questionnaire with no message", async () => {
    vi.spyOn(api, "validateFormToken").mockResolvedValue({
      ok: true,
      data: {
        valid: false,
        questionnaire: "OTHER_FORM",
        client: { name: "John Doe", dob: "1990-01-01" },
        message: undefined,
      },
    });

    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: (
            <QuestionnaireForm
              title="Fallback Msg Test"
              questionnaire="TEST_FORM"
              token="token-fallback-mismatch"
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
    });
  });

  test("uses DEFAULT_INVALID_MSG in catch block when thrown object has no message", async () => {
    vi.spyOn(api, "validateFormToken").mockImplementation(() =>
      Promise.reject({})
    );

    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: (
            <QuestionnaireForm
              title="Fallback Catch Test"
              questionnaire="TEST_FORM"
              token="token-fallback-catch"
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
    });
  });
});
