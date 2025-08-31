import { render, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import BECKS from "./BECKS";
import * as useValidateTokenModule from "../hooks/useValidateToken";
import * as useBecksFormModule from "../hooks/useBECKSForm";
import * as becksBurnsHelpers from "../utils/becksBurnsHelpers";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("../components/QuestionnaireForm", () => ({
  default: (props) => (
    <div data-testid="questionnaire-form">
      <button data-testid="submit-btn" onClick={props.onSubmit}></button>
      {props.children}
    </div>
  ),
}));

vi.mock("../components/modals/FormResetModal", () => ({
  default: (props) => (
    <div data-testid="reset-modal">
      <button data-testid="confirm-btn" onClick={props.onConfirm}></button>
      <button data-testid="cancel-btn" onClick={props.onCancel}></button>
    </div>
  ),
}));

vi.mock("../components/modals/InvalidTokenModal", () => ({
  default: () => <div data-testid="invalid-token-modal" />,
}));

describe("BECKS component", () => {
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
        <BECKS />
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
        <BECKS />
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

    vi.spyOn(useBecksFormModule, "default").mockReturnValue({
      answers: { q1: 1 },
      formError: null,
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

    const { getByTestId, getByText } = render(
      <MemoryRouter>
        <BECKS />
      </MemoryRouter>
    );

    expect(getByTestId("questionnaire-form")).toBeTruthy();
    expect(getByText("Submit")).toBeTruthy();
    expect(getByText("Reset")).toBeTruthy();
  });

  test("renders formError message", () => {
    vi.spyOn(useValidateTokenModule, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    vi.spyOn(useBecksFormModule, "default").mockReturnValue({
      answers: {},
      formError: "Error message",
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
        <BECKS />
      </MemoryRouter>
    );

    expect(getByText("Error message")).toBeTruthy();
  });

  test("renders reset modal and calls confirm/cancel", () => {
    const mockConfirm = vi.fn();
    const mockCancel = vi.fn();

    vi.spyOn(useValidateTokenModule, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    vi.spyOn(useBecksFormModule, "default").mockReturnValue({
      answers: {},
      formError: null,
      resetModalOpen: true,
      resetModalClosing: false,
      handleChange: vi.fn(),
      handleSubmit: (fn) => fn,
      handleResetClick: vi.fn(),
      confirmReset: mockConfirm,
      cancelReset: mockCancel,
      handleModalCloseFinished: vi.fn(),
      setFormError: vi.fn(),
      missingIds: [],
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <BECKS />
      </MemoryRouter>
    );

    fireEvent.click(getByTestId("confirm-btn"));
    fireEvent.click(getByTestId("cancel-btn"));

    expect(mockConfirm).toHaveBeenCalled();
    expect(mockCancel).toHaveBeenCalled();
  });

  test("calls submitFormWithToken on valid submit", () => {
    vi.spyOn(useValidateTokenModule, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: mockSetShowInvalidTokenModal,
    });

    vi.spyOn(useBecksFormModule, "default").mockReturnValue({
      answers: { q1: 2, q2: 3 },
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
      <MemoryRouter initialEntries={["/becks/abc123"]}>
        <Routes>
          <Route path="/becks/:token" element={<BECKS />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(getByTestId("submit-btn"));
    expect(mockSubmitFn).toHaveBeenCalled();
  });
});
