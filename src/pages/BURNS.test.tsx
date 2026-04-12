import { render, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import React from "react";
import BURNS from "./BURNS";
import * as useValidateTokenModule from "../hooks/useValidateToken";
import * as useBurnsFormModule from "../hooks/useBURNSForm";
import * as becksBurnsHelpers from "../utils/becksBurnsHelpers";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("../components/QuestionnaireForm", () => ({
  default: (props: { onSubmit: () => void; children: React.ReactNode }) => (
    <div data-testid="questionnaire-form">
      <button data-testid="submit-btn" onClick={props.onSubmit}></button>
      {props.children}
    </div>
  ),
}));

vi.mock("../components/modals/FormResetModal", () => ({
  default: (props: {
    closing: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    onCloseFinished: () => void;
  }) => (
    <div
      data-testid="reset-modal"
      data-closing={props.closing ? "true" : "false"}
    >
      <button data-testid="confirm-btn" onClick={props.onConfirm}></button>
      <button data-testid="cancel-btn" onClick={props.onCancel}></button>
      <button data-testid="close-btn" onClick={props.onCloseFinished}></button>
    </div>
  ),
}));

vi.mock("../components/modals/InvalidTokenModal", () => ({
  default: () => <div data-testid="invalid-token-modal" />,
}));

type ValidateTokenReturn = ReturnType<typeof useValidateTokenModule.default>;
type BurnsFormReturn = ReturnType<typeof useBurnsFormModule.default>;

const baseValidateToken: ValidateTokenReturn = {
  isValid: true,
  showInvalidTokenModal: false,
  setShowInvalidTokenModal: vi.fn(),
};

const baseBurnsForm: BurnsFormReturn = {
  answers: {},
  total: 5,
  formError: null,
  resetModalOpen: false,
  resetModalClosing: false,
  handleChange: vi.fn(),
  handleSubmit: (fn) => fn as unknown as (e: React.FormEvent) => void,
  handleResetClick: vi.fn(),
  confirmReset: vi.fn(),
  cancelReset: vi.fn(),
  handleModalCloseFinished: vi.fn(),
  setFormError: vi.fn(),
  missingIds: [],
};

describe("BURNS component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useValidateTokenModule, "default").mockReturnValue(baseValidateToken);
    vi.spyOn(useBurnsFormModule, "default").mockReturnValue(baseBurnsForm);
  });

  test("renders loader when isValid is null", () => {
    vi.spyOn(useValidateTokenModule, "default").mockReturnValue({
      ...baseValidateToken,
      isValid: null,
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
      ...baseValidateToken,
      showInvalidTokenModal: true,
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <BURNS />
      </MemoryRouter>
    );

    expect(getByTestId("invalid-token-modal")).toBeTruthy();
  });

  test("renders QuestionnaireForm and buttons", () => {
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
    const mockSubmitFn = vi.fn();
    vi.spyOn(becksBurnsHelpers, "submitFormWithToken").mockImplementation(mockSubmitFn);

    const { getByTestId } = render(
      <MemoryRouter initialEntries={["/burns/abc123"]}>
        <Routes>
          <Route path="/burns/:token" element={<BURNS />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(getByTestId("submit-btn"));
    expect(mockSubmitFn).toHaveBeenCalled();
  });

  test("renders FormResetModal and triggers handlers", () => {
    const confirmReset = vi.fn();
    const cancelReset = vi.fn();
    const handleModalCloseFinished = vi.fn();

    vi.spyOn(useBurnsFormModule, "default").mockReturnValue({
      ...baseBurnsForm,
      resetModalOpen: true,
      resetModalClosing: true,
      confirmReset,
      cancelReset,
      handleModalCloseFinished,
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
    vi.spyOn(useBurnsFormModule, "default").mockReturnValue({
      ...baseBurnsForm,
      formError: "Test error message",
    });

    const { getByText } = render(
      <MemoryRouter>
        <BURNS />
      </MemoryRouter>
    );

    expect(getByText("Test error message")).toBeTruthy();
  });
});
