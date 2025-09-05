import { describe, test, vi, beforeEach, expect } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SMI from "../pages/SMI";
import * as useSMIFormHook from "../hooks/useSMIForm";
import * as useValidateTokenHook from "../hooks/useValidateToken";
import * as SMIHelpers from "../utils/SMIHelpers";
import * as SMIQuestions from "../components/SMIQuestions";
import SMIItems from "../data/SMIItems";
import * as API from "../api/formsFrontend";

vi.mock("../components/SMIQuestions", () => ({
  default: ({ item, value, onChange, showError = false }) => {
    const handleChange = (e) => {
      const val = e.target.value;
      if (val === "") {
        onChange(undefined);
      } else {
        const num = parseInt(val, 10);
        if (!Number.isNaN(num) && num >= 1 && num <= 6) {
          onChange(num);
        }
      }
    };

    return (
      <div data-testid={`question-wrapper-${String(item.id)}`}>
        <div>{item.id}</div>
        <input
          data-testid={`input-${String(item.id)}`}
          type="number"
          min={1}
          max={6}
          value={value ?? ""}
          onChange={handleChange}
          className={showError ? "error" : ""}
        />
        <div>{item.prompt}</div>
      </div>
    );
  },
}));

vi.mock("../components/modals/InvalidTokenModal", () => ({
  default: () => <div>Invalid Token</div>,
}));

vi.mock("../components/modals/FormResetModal", () => ({
  default: ({ onConfirm, onCancel, onCloseFinished }) => (
    <div>
      Reset Modal
      <button data-testid="reset-confirm" onClick={onConfirm}>
        Confirm
      </button>
      <button data-testid="reset-cancel" onClick={onCancel}>
        Cancel
      </button>
      <button data-testid="reset-close-finished" onClick={onCloseFinished}>
        Close Finished
      </button>
    </div>
  ),
}));

vi.mock("../components/SMIInstructions", () => ({
  default: () => <div>Instructions</div>,
}));

vi.mock("../components/ui/Button", () => ({
  default: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

vi.mock("lucide-react", () => ({
  Loader2: ({ className, size }) => (
    <div data-testid="loader" className={className} data-size={size}></div>
  ),
}));

vi.mock("../components/QuestionnaireForm", () => ({
  default: ({ onSubmit, children }) => (
    <div>
      {children}
      <button data-testid="mock-submit" onClick={onSubmit}>
        Submit
      </button>
    </div>
  ),
}));

let mockedUseParams = vi.fn(() => ({ token: "dummy-token" }));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => mockedUseParams(),
    useNavigate: () => vi.fn(),
  };
});

vi.mock("../components/RatingScaleTooltip", () => ({
  default: ({ title, items }) => (
    <div data-testid="rating-scale-tooltip" data-title={title}>
      {items.map((item, index) => (
        <div key={index}>{item}</div>
      ))}
    </div>
  ),
}));

describe("SMI Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseParams = vi.fn(() => ({ token: "dummy-token" }));
  });

  test("renders loader when isValid is null", () => {
    vi.spyOn(useValidateTokenHook, "default").mockReturnValue({
      isValid: null,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    const { getByTestId, container } = render(
      <MemoryRouter>
        <SMI />
      </MemoryRouter>
    );

    expect(container.querySelector("[aria-busy]")).toBeInTheDocument();
    expect(getByTestId("loader")).toBeInTheDocument();
  });

  test("renders InvalidTokenModal when token is invalid", () => {
    vi.spyOn(useValidateTokenHook, "default").mockReturnValue({
      isValid: false,
      showInvalidTokenModal: true,
      setShowInvalidTokenModal: vi.fn(),
    });

    const { getByText } = render(
      <MemoryRouter>
        <SMI />
      </MemoryRouter>
    );

    expect(getByText("Invalid Token")).toBeInTheDocument();
  });

  test("renders questions and instructions when token is valid", () => {
    vi.spyOn(useValidateTokenHook, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    vi.spyOn(useSMIFormHook, "default").mockReturnValue({
      answers: {},
      formError: "",
      missingIds: [],
      resetModalOpen: false,
      resetModalClosing: false,
      handleChange: vi.fn(),
      handleSubmit: (fn) => fn,
      handleResetClick: vi.fn(),
      confirmReset: vi.fn(),
      cancelReset: vi.fn(),
      handleModalCloseFinished: vi.fn(),
      setFormError: vi.fn(),
    });

    const { getByText, getAllByTestId } = render(
      <MemoryRouter>
        <SMI />
      </MemoryRouter>
    );

    expect(getByText("Instructions")).toBeInTheDocument();
    expect(getAllByTestId(/^question-wrapper-/).length).toBeGreaterThan(0);
  });

  test("calls onValidSubmit and handles success", async () => {
    vi.spyOn(SMIHelpers, "computeSMIScores").mockReturnValue({ foo: "bar" });
    const submitSMIForm = vi
      .spyOn(API, "submitSMIForm")
      .mockResolvedValue({ ok: true });

    vi.spyOn(useValidateTokenHook, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    vi.spyOn(useSMIFormHook, "default").mockReturnValue({
      answers: {},
      formError: "",
      missingIds: [],
      resetModalOpen: false,
      resetModalClosing: false,
      handleChange: vi.fn(),
      handleSubmit: (fn) => fn,
      handleResetClick: vi.fn(),
      confirmReset: vi.fn(),
      cancelReset: vi.fn(),
      handleModalCloseFinished: vi.fn(),
      setFormError: vi.fn(),
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <SMI />
      </MemoryRouter>
    );

    fireEvent.click(getByTestId("mock-submit"));

    await waitFor(() => {
      expect(submitSMIForm).toHaveBeenCalledWith({
        token: "dummy-token",
        results: { foo: "bar" },
      });
    });
  });

  test("opens and confirms reset modal", () => {
    const confirmReset = vi.fn();
    const cancelReset = vi.fn();
    const handleModalCloseFinished = vi.fn();

    vi.spyOn(useValidateTokenHook, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    vi.spyOn(useSMIFormHook, "default").mockReturnValue({
      answers: {},
      formError: "",
      missingIds: [],
      resetModalOpen: true,
      resetModalClosing: false,
      handleChange: vi.fn(),
      handleSubmit: (fn) => fn,
      handleResetClick: vi.fn(),
      confirmReset,
      cancelReset,
      handleModalCloseFinished,
      setFormError: vi.fn(),
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <SMI />
      </MemoryRouter>
    );

    fireEvent.click(getByTestId("reset-confirm"));
    expect(confirmReset).toHaveBeenCalled();

    fireEvent.click(getByTestId("reset-cancel"));
    expect(cancelReset).toHaveBeenCalled();

    fireEvent.click(getByTestId("reset-close-finished"));
    expect(handleModalCloseFinished).toHaveBeenCalled();
  });

  test("onValidSubmit sets form error when token is missing", async () => {
    mockedUseParams = vi.fn(() => ({ token: undefined }));

    const setFormError = vi.fn();

    vi.spyOn(useValidateTokenHook, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    vi.spyOn(useSMIFormHook, "default").mockReturnValue({
      answers: {},
      formError: "",
      missingIds: [],
      resetModalOpen: false,
      resetModalClosing: false,
      handleChange: vi.fn(),
      handleSubmit: (fn) => fn,
      handleResetClick: vi.fn(),
      confirmReset: vi.fn(),
      cancelReset: vi.fn(),
      handleModalCloseFinished: vi.fn(),
      setFormError,
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <SMI />
      </MemoryRouter>
    );

    fireEvent.click(getByTestId("mock-submit"));

    await waitFor(() => {
      expect(setFormError).toHaveBeenCalledWith("Token missing");
    });
  });

  test("onValidSubmit handles submission errors", async () => {
    const setFormError = vi.fn();
    const setShowInvalidTokenModal = vi.fn();

    mockedUseParams = vi.fn(() => ({ token: "dummy-token" }));

    vi.spyOn(useValidateTokenHook, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal,
    });

    vi.spyOn(useSMIFormHook, "default").mockReturnValue({
      answers: {},
      formError: "",
      missingIds: [],
      resetModalOpen: false,
      resetModalClosing: false,
      handleChange: vi.fn(),
      handleSubmit: (fn) => fn,
      handleResetClick: vi.fn(),
      confirmReset: vi.fn(),
      cancelReset: vi.fn(),
      handleModalCloseFinished: vi.fn(),
      setFormError,
    });

    vi.spyOn(SMIHelpers, "computeSMIScores").mockReturnValue({ foo: "bar" });

    vi.spyOn(API, "submitSMIForm").mockResolvedValue({
      ok: false,
      code: "INVALID_TOKEN",
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <SMI />
      </MemoryRouter>
    );

    fireEvent.click(getByTestId("mock-submit"));

    await waitFor(() => {
      expect(setShowInvalidTokenModal).toHaveBeenCalledWith(true);
      expect(setFormError).not.toHaveBeenCalled();
    });

    setShowInvalidTokenModal.mockClear();
    setFormError.mockClear();

    vi.spyOn(API, "submitSMIForm").mockResolvedValue({
      ok: false,
      code: "SOME_OTHER_ERROR",
      error: "Something went wrong",
    });

    fireEvent.click(getByTestId("mock-submit"));

    await waitFor(() => {
      expect(setFormError).toHaveBeenCalledWith("Something went wrong");
      expect(setShowInvalidTokenModal).not.toHaveBeenCalled();
    });

    setFormError.mockClear();

    vi.spyOn(API, "submitSMIForm").mockResolvedValue({
      ok: false,
      code: "SOME_OTHER_ERROR",
      error: undefined,
    });

    fireEvent.click(getByTestId("mock-submit"));

    await waitFor(() => {
      expect(setFormError).toHaveBeenCalledWith(
        "Failed to submit the SMI form."
      );
    });
  });

  test("renders formError message when formError is set", () => {
    vi.spyOn(useValidateTokenHook, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    vi.spyOn(useSMIFormHook, "default").mockReturnValue({
      answers: {},
      formError: "Test error message",
      missingIds: [],
      resetModalOpen: false,
      resetModalClosing: false,
      handleChange: vi.fn(),
      handleSubmit: vi.fn(),
      handleResetClick: vi.fn(),
      confirmReset: vi.fn(),
      cancelReset: vi.fn(),
      handleModalCloseFinished: vi.fn(),
      setFormError: vi.fn(),
    });

    const { getByText } = render(
      <MemoryRouter>
        <SMI />
      </MemoryRouter>
    );

    expect(getByText("Test error message")).toBeInTheDocument();
    expect(getByText("Test error message")).toHaveClass(
      "text-red-600 font-bold"
    );
  });

  test("calls handleChange when SMIQuestion input changes", () => {
    const handleChange = vi.fn();

    vi.spyOn(useValidateTokenHook, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    vi.spyOn(useSMIFormHook, "default").mockReturnValue({
      answers: {},
      formError: "",
      missingIds: [],
      resetModalOpen: false,
      resetModalClosing: false,
      handleChange,
      handleSubmit: vi.fn(),
      handleResetClick: vi.fn(),
      confirmReset: vi.fn(),
      cancelReset: vi.fn(),
      handleModalCloseFinished: vi.fn(),
      setFormError: vi.fn(),
    });

    const { getAllByRole } = render(
      <MemoryRouter>
        <SMI />
      </MemoryRouter>
    );

    const inputs = getAllByRole("spinbutton");
    expect(inputs.length).toBeGreaterThan(0);
    const firstInput = inputs[0];
    fireEvent.change(firstInput, { target: { value: "3" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(expect.anything(), 3);
  });

  test("ArrowDown focuses the next SMI question input", () => {
    const handleChange = vi.fn();
    const questionRefs = [];

    const renderSpy = vi
      .spyOn(SMIQuestions, "default")
      .mockImplementation(({ item, onArrowDown, ref }) => {
        const inputRef = { focus: vi.fn() };
        if (ref) ref(inputRef);
        questionRefs.push(inputRef);

        return (
          <div
            data-testid={`question-${item.id}`}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") onArrowDown?.();
            }}
          >
            {item.prompt}
          </div>
        );
      });

    const { getByTestId } = render(
      <MemoryRouter>
        <SMI />
      </MemoryRouter>
    );

    const firstInput = getByTestId(`question-${SMIItems[0].id}`);
    fireEvent.keyDown(firstInput, { key: "ArrowDown" });

    const secondRef = questionRefs[1];
    if (secondRef) {
      expect(secondRef.focus).toHaveBeenCalled();
    }

    renderSpy.mockRestore();
  });

  test("ArrowUp focuses the previous SMI question input", () => {
    const handleChange = vi.fn();
    const questionRefs = [];

    const renderSpy = vi
      .spyOn(SMIQuestions, "default")
      .mockImplementation(({ item, onArrowUp, ref }) => {
        const inputRef = { focus: vi.fn() };
        if (ref) ref(inputRef);
        questionRefs.push(inputRef);

        return (
          <div
            data-testid={`question-${item.id}`}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") onArrowUp?.();
            }}
          >
            {item.prompt}
          </div>
        );
      });

    const { getByTestId } = render(
      <MemoryRouter>
        <SMI />
      </MemoryRouter>
    );

    const secondInput = getByTestId(`question-${SMIItems[1].id}`);
    fireEvent.keyDown(secondInput, { key: "ArrowUp" });

    const firstRef = questionRefs[0];
    if (firstRef) {
      expect(firstRef.focus).toHaveBeenCalled();
    }

    renderSpy.mockRestore();
  });

  test("renders RatingScaleTooltip with correct items", () => {
    vi.spyOn(useValidateTokenHook, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    vi.spyOn(useSMIFormHook, "default").mockReturnValue({
      answers: {},
      formError: "",
      missingIds: [],
      resetModalOpen: false,
      resetModalClosing: false,
      handleChange: vi.fn(),
      handleSubmit: (fn) => fn,
      handleResetClick: vi.fn(),
      confirmReset: vi.fn(),
      cancelReset: vi.fn(),
      handleModalCloseFinished: vi.fn(),
      setFormError: vi.fn(),
    });

    const { getByTestId, getByText } = render(
      <MemoryRouter>
        <SMI />
      </MemoryRouter>
    );

    const tooltip = getByTestId("rating-scale-tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.dataset.title).toBe("SMI Frequency Scale");
    expect(getByText("1 = Never or Almost Never")).toBeInTheDocument();
    expect(getByText("6 = All of the time")).toBeInTheDocument();
  });
});
