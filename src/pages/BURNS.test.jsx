import { render, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import BURNS from "./BURNS";
import * as useValidateTokenModule from "../hooks/useValidateToken";
import * as useBurnsFormModule from "../hooks/useBURNSForm";
import * as becksBurnsHelpers from "../utils/becksBurnsHelpers";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("../components/QuestionnaireForm", () => {
  return {
    default: (props) => (
      <div data-testid="questionnaire-form">
        <button data-testid="submit-btn" onClick={props.onSubmit}></button>
        {props.children}
      </div>
    ),
  };
});

vi.mock("../components/modals/FormResetModal", () => {
  return {
    default: (props) => (
      <div
        data-testid="reset-modal"
        data-closing={props.closing ? "true" : "false"}
      >
        <button data-testid="confirm-btn" onClick={props.onConfirm}></button>
        <button data-testid="cancel-btn" onClick={props.onCancel}></button>
        <button
          data-testid="close-btn"
          onClick={props.onCloseFinished}
        ></button>
      </div>
    ),
  };
});

vi.mock("../components/modals/InvalidTokenModal", () => {
  return {
    default: () => <div data-testid="invalid-token-modal" />,
  };
});

describe("BURNS component", () => {
  let mockSubmitFn;
  let mockSetFormError;
  let mockSetShowInvalidTokenModal;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSubmitFn = vi.fn();
    mockSetFormError = vi.fn();
    mockSetShowInvalidTokenModal = vi.fn();

    vi.spyOn(becksBurnsHelpers, "submitFormWithToken").mockImplementation(
      mockSubmitFn
    );
  });

  test("renders loader when isValid is null", () => {
    vi.spyOn(useValidateTokenModule, "default").mockReturnValue({
      isValid: null,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    const { container } = render(
      <MemoryRouter>
        <BURNS />
      </MemoryRouter>
    );

    expect(container.querySelector("[aria-busy]")).toBeTruthy();
  });

  test("renders InvalidTokenModal when showInvalidTokenModal is true", () => {
    vi.spyOn(useValidateTokenModule, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: true,
      setShowInvalidTokenModal: vi.fn(),
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <BURNS />
      </MemoryRouter>
    );

    expect(getByTestId("invalid-token-modal")).toBeTruthy();
  });

  test("renders QuestionnaireForm and buttons", () => {
    vi.spyOn(useValidateTokenModule, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    vi.spyOn(useBurnsFormModule, "default").mockReturnValue({
      answers: {},
      total: 5,
      formError: null,
      resetModalOpen: false,
      resetModalClosing: true,
      handleChange: vi.fn(),
      handleSubmit: (fn) => fn,
      handleResetClick: vi.fn(),
      confirmReset: vi.fn(),
      cancelReset: vi.fn(),
      handleModalCloseFinished: vi.fn(),
      setFormError: vi.fn(),
      missingIds: [],
    });

    const { getByTestId, getByText } = render(
      <MemoryRouter>
        <BURNS />
      </MemoryRouter>
    );

    expect(getByTestId("questionnaire-form")).toBeTruthy();
    expect(getByText("Submit")).toBeTruthy();
    expect(getByText("Reset")).toBeTruthy();
  });

  test("calls submitFormWithToken on valid submit", () => {
    vi.spyOn(useValidateTokenModule, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: mockSetShowInvalidTokenModal,
    });

    vi.spyOn(useBurnsFormModule, "default").mockReturnValue({
      answers: {},
      total: 5,
      formError: null,
      resetModalOpen: false,
      resetModalClosing: false,
      handleChange: vi.fn(),
      handleSubmit: (fn) => fn,
      handleResetClick: vi.fn(),
      confirmReset: vi.fn(),
      cancelReset: vi.fn(),
      handleModalCloseFinished: vi.fn(),
      setFormError: mockSetFormError,
      missingIds: [],
    });

    const { getByTestId } = render(
      <MemoryRouter initialEntries={["/burns/abc123"]}>
        <Routes>
          <Route path="/burns/:token" element={<BURNS />} />
        </Routes>
      </MemoryRouter>
    );

    const submitBtn = getByTestId("submit-btn");
    fireEvent.click(submitBtn);

    expect(mockSubmitFn).toHaveBeenCalled();
  });

  test("renders FormResetModal and triggers handlers", () => {
    const confirmReset = vi.fn();
    const cancelReset = vi.fn();
    const handleModalCloseFinished = vi.fn();

    vi.spyOn(useValidateTokenModule, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    vi.spyOn(useBurnsFormModule, "default").mockReturnValue({
      answers: {},
      total: 0,
      formError: null,
      resetModalOpen: true,
      resetModalClosing: true,
      handleChange: vi.fn(),
      handleSubmit: (fn) => fn,
      handleResetClick: vi.fn(),
      confirmReset,
      cancelReset,
      handleModalCloseFinished,
      setFormError: vi.fn(),
      missingIds: [],
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <BURNS />
      </MemoryRouter>
    );

    const modal = getByTestId("reset-modal");
    expect(modal).toBeTruthy();
    expect(modal).toHaveAttribute("data-closing", "true");

    fireEvent.click(getByTestId("confirm-btn"));
    fireEvent.click(getByTestId("cancel-btn"));
    fireEvent.click(getByTestId("close-btn"));

    expect(confirmReset).toHaveBeenCalled();
    expect(cancelReset).toHaveBeenCalled();
    expect(handleModalCloseFinished).toHaveBeenCalled();
  });

  test("renders formError message when formError is set", () => {
    vi.spyOn(useValidateTokenModule, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    vi.spyOn(useBurnsFormModule, "default").mockReturnValue({
      answers: {},
      total: 0,
      formError: "Test error message",
      resetModalOpen: false,
      resetModalClosing: false,
      handleChange: vi.fn(),
      handleSubmit: (fn) => fn,
      handleResetClick: vi.fn(),
      confirmReset: vi.fn(),
      cancelReset: vi.fn(),
      handleModalCloseFinished: vi.fn(),
      setFormError: vi.fn(),
      missingIds: [],
    });

    const { getByText } = render(
      <MemoryRouter>
        <BURNS />
      </MemoryRouter>
    );

    expect(getByText("Test error message")).toBeTruthy();
  });
});
