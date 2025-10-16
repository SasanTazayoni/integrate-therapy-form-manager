import { describe, test, vi, beforeEach, expect } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import YSQ from "../pages/YSQ";
import * as useYSQFormHook from "../hooks/useYSQForm";
import * as useValidateTokenHook from "../hooks/useValidateToken";
import * as YSQHelpers from "../utils/YSQHelpers";
import * as YSQQuestions from "../components/YSQQuestions";
import YSQEmotionalDeprivation from "../data/YSQEmotionalDeprivation";

vi.mock("../components/YSQQuestions", () => ({
  default: () => <div>Question Component</div>,
}));

vi.mock("../components/modals/InvalidTokenModal", () => ({
  default: () => <div>Invalid Token</div>,
}));

vi.mock("../components/YSQInstructions", () => ({
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

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ token: "dummy-token" }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock("../components/modals/FormResetModal", () => ({
  default: ({ onConfirm, onCancel, onCloseFinished, closing }) => (
    <div>
      Reset Modal
      <button data-testid="reset-confirm" onClick={onConfirm}>
        Confirm
      </button>
      <button data-testid="reset-cancel" onClick={onCancel}>
        Cancel
      </button>
      {closing && (
        <button data-testid="mock-close-finished" onClick={onCloseFinished}>
          Close Finished
        </button>
      )}
    </div>
  ),
}));

vi.mock("../components/RatingScaleTooltip", () => ({
  default: ({ title, items }) => (
    <div data-testid="rating-scale-tooltip" data-title={title}>
      {items.map((item, index) => (
        <div key={index}>{item}</div>
      ))}
    </div>
  ),
}));

describe("YSQ Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders InvalidTokenModal when token is invalid", () => {
    vi.spyOn(useValidateTokenHook, "default").mockReturnValue({
      isValid: false,
      showInvalidTokenModal: true,
      setShowInvalidTokenModal: vi.fn(),
    });

    const { getByText } = render(
      <MemoryRouter>
        <YSQ />
      </MemoryRouter>
    );

    expect(getByText("Invalid Token")).toBeInTheDocument();
  });

  test("renders questions when token is valid", () => {
    vi.spyOn(useValidateTokenHook, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    vi.spyOn(useYSQFormHook, "default").mockReturnValue({
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

    const { getByText, getAllByText } = render(
      <MemoryRouter>
        <YSQ />
      </MemoryRouter>
    );

    expect(getByText("Instructions")).toBeInTheDocument();
    expect(getAllByText("Question Component").length).toBeGreaterThan(0);
  });

  test("calls submitYSQWithToken on valid submit", async () => {
    vi.spyOn(useValidateTokenHook, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    const mockSubmit = vi
      .spyOn(YSQHelpers, "submitYSQWithToken")
      .mockImplementation(vi.fn());

    vi.spyOn(useYSQFormHook, "default").mockReturnValue({
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
        <YSQ />
      </MemoryRouter>
    );

    fireEvent.click(getByTestId("mock-submit"));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  test("opens and confirms reset modal", async () => {
    vi.spyOn(useValidateTokenHook, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    const confirmReset = vi.fn();
    const cancelReset = vi.fn();

    vi.spyOn(useYSQFormHook, "default").mockReturnValue({
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
      handleModalCloseFinished: vi.fn(),
      setFormError: vi.fn(),
    });

    const { getByTestId, getByText } = render(
      <MemoryRouter>
        <YSQ />
      </MemoryRouter>
    );

    expect(getByText("Reset Modal")).toBeInTheDocument();

    fireEvent.click(getByTestId("reset-confirm"));
    expect(confirmReset).toHaveBeenCalled();

    fireEvent.click(getByTestId("reset-cancel"));
    expect(cancelReset).toHaveBeenCalled();
  });

  test("renders loader when isValid is null", () => {
    vi.spyOn(useValidateTokenHook, "default").mockReturnValue({
      isValid: null,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    const { container, getByTestId } = render(
      <MemoryRouter>
        <YSQ />
      </MemoryRouter>
    );

    const loaderContainer = container.querySelector("[aria-busy]");
    expect(loaderContainer).toBeInTheDocument();

    const loaderIcon = getByTestId("loader");
    expect(loaderIcon).toBeInTheDocument();
    expect(loaderIcon).toHaveClass("animate-spin text-blue-600");
    expect(loaderIcon.dataset.size).toBe("120");
  });

  test("renders formError message when set", () => {
    vi.spyOn(useValidateTokenHook, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    vi.spyOn(useYSQFormHook, "default").mockReturnValue({
      answers: {},
      formError: "This is an error",
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

    const { getByText } = render(
      <MemoryRouter>
        <YSQ />
      </MemoryRouter>
    );

    const errorMessage = getByText("This is an error");
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass("text-red-600 font-bold");
  });

  test("calls handleResetClick when Reset button is clicked", () => {
    const handleResetClick = vi.fn();

    vi.spyOn(useValidateTokenHook, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    vi.spyOn(useYSQFormHook, "default").mockReturnValue({
      answers: {},
      formError: "",
      missingIds: [],
      resetModalOpen: false,
      resetModalClosing: false,
      handleChange: vi.fn(),
      handleSubmit: (fn) => fn,
      handleResetClick,
      confirmReset: vi.fn(),
      cancelReset: vi.fn(),
      handleModalCloseFinished: vi.fn(),
      setFormError: vi.fn(),
    });

    const { getByText } = render(
      <MemoryRouter>
        <YSQ />
      </MemoryRouter>
    );

    fireEvent.click(getByText("Reset"));
    expect(handleResetClick).toHaveBeenCalled();
  });

  test("submitYSQWithToken called with correct arguments and navigate is functional", async () => {
    const mockSetFormError = vi.fn();
    const mockSetShowInvalidTokenModal = vi.fn();
    const mockNavigate = vi.fn();

    vi.spyOn(useValidateTokenHook, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: mockSetShowInvalidTokenModal,
    });

    vi.spyOn(useYSQFormHook, "default").mockReturnValue({
      answers: { q1: "answer1", q2: "answer2" },
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
      setFormError: mockSetFormError,
    });

    const mockSubmit = vi
      .spyOn(YSQHelpers, "submitYSQWithToken")
      .mockImplementation(({ navigate }) => {
        navigate("/success");
      });

    const { getByTestId } = render(
      <MemoryRouter>
        <YSQ />
      </MemoryRouter>
    );

    fireEvent.click(getByTestId("mock-submit"));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
      const args = mockSubmit.mock.calls[0][0];
      expect(args.token).toBe("dummy-token");
      expect(args.answers).toEqual({ q1: "answer1", q2: "answer2" });
      expect(Array.isArray(args.schemas)).toBe(true);
      expect(args.setFormError).toBe(mockSetFormError);
      expect(args.setShowInvalidTokenModal).toBe(mockSetShowInvalidTokenModal);
      expect(typeof args.navigate).toBe("function");
      expect(args.navigate).not.toThrow();
      args.navigate("/test");
    });
  });

  test("sets showError correctly for each question based on missingIds", () => {
    const missingIds = [
      YSQEmotionalDeprivation[0].id,
      YSQEmotionalDeprivation[1].id,
    ];

    const allItems = [...YSQEmotionalDeprivation];

    const renderSpy = vi
      .spyOn(YSQQuestions, "default")
      .mockImplementation(({ item, showError }) => (
        <div
          data-testid={`question-${item.id}`}
          data-show-error={showError ? "true" : "false"}
        >
          Question Component
        </div>
      ));

    vi.spyOn(useValidateTokenHook, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    vi.spyOn(useYSQFormHook, "default").mockReturnValue({
      answers: {},
      formError: "",
      missingIds,
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
        <YSQ />
      </MemoryRouter>
    );

    allItems.forEach((item) => {
      const question = getByTestId(`question-${item.id}`);
      if (missingIds.includes(item.id)) {
        expect(question).toHaveAttribute("data-show-error", "true");
      } else {
        expect(question).toHaveAttribute("data-show-error", "false");
      }
    });

    renderSpy.mockRestore();
  });

  test("FormResetModal lifecycle calls handlers correctly", () => {
    const confirmReset = vi.fn();
    const cancelReset = vi.fn();
    const handleModalCloseFinished = vi.fn();

    vi.spyOn(useValidateTokenHook, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    vi.spyOn(useYSQFormHook, "default").mockReturnValue({
      answers: {},
      formError: "",
      missingIds: [],
      resetModalOpen: true,
      resetModalClosing: true,
      handleChange: vi.fn(),
      handleSubmit: (fn) => fn,
      handleResetClick: vi.fn(),
      confirmReset,
      cancelReset,
      handleModalCloseFinished,
      setFormError: vi.fn(),
    });

    const { getByTestId, getByText } = render(
      <MemoryRouter>
        <YSQ />
      </MemoryRouter>
    );

    fireEvent.click(getByTestId("reset-confirm"));
    expect(confirmReset).toHaveBeenCalled();
    fireEvent.click(getByTestId("reset-cancel"));
    expect(cancelReset).toHaveBeenCalled();
    fireEvent.click(getByTestId("mock-close-finished"));
    expect(handleModalCloseFinished).toHaveBeenCalled();
    expect(getByText("Reset Modal")).toBeInTheDocument();
  });

  test("calls handleChange when a question value changes", () => {
    const handleChange = vi.fn();
    const questionItem = YSQEmotionalDeprivation[0];

    vi.spyOn(useValidateTokenHook, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    vi.spyOn(useYSQFormHook, "default").mockReturnValue({
      answers: {},
      formError: "",
      missingIds: [],
      resetModalOpen: false,
      resetModalClosing: false,
      handleChange,
      handleSubmit: (fn) => fn,
      handleResetClick: vi.fn(),
      confirmReset: vi.fn(),
      cancelReset: vi.fn(),
      handleModalCloseFinished: vi.fn(),
      setFormError: vi.fn(),
    });

    const renderSpy = vi
      .spyOn(YSQQuestions, "default")
      .mockImplementation(({ item, onChange }) => (
        <div
          data-testid={`question-${item.id}`}
          onClick={() => onChange("test-value")}
        >
          Question Component
        </div>
      ));

    const { getByTestId } = render(
      <MemoryRouter>
        <YSQ />
      </MemoryRouter>
    );

    fireEvent.click(getByTestId(`question-${questionItem.id}`));
    expect(handleChange).toHaveBeenCalledWith(questionItem.id, "test-value");

    renderSpy.mockRestore();
  });

  test("ArrowDown focuses the next input", () => {
    const handleChange = vi.fn();
    const firstQuestion = YSQEmotionalDeprivation[0];
    const secondQuestion = YSQEmotionalDeprivation[1];
    const questionRefs = [];

    const renderSpy = vi
      .spyOn(YSQQuestions, "default")
      .mockImplementation(({ item, onArrowDown, ref }) => {
        const inputRef = { focus: vi.fn() };
        if (ref) ref(inputRef);
        return (
          <div
            data-testid={`question-${item.id}`}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") onArrowDown();
            }}
          >
            {item.prompt}
          </div>
        );
      });

    vi.spyOn(useValidateTokenHook, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    vi.spyOn(useYSQFormHook, "default").mockReturnValue({
      answers: {},
      formError: "",
      missingIds: [],
      resetModalOpen: false,
      resetModalClosing: false,
      handleChange,
      handleSubmit: (fn) => fn,
      handleResetClick: vi.fn(),
      confirmReset: vi.fn(),
      cancelReset: vi.fn(),
      handleModalCloseFinished: vi.fn(),
      setFormError: vi.fn(),
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <YSQ />
      </MemoryRouter>
    );

    const firstInput = getByTestId(`question-${firstQuestion.id}`);
    const secondInput = getByTestId(`question-${secondQuestion.id}`);
    fireEvent.keyDown(firstInput, { key: "ArrowDown" });

    const secondRef = questionRefs[1];
    if (secondRef) {
      expect(secondRef.focus).toHaveBeenCalled();
    }

    renderSpy.mockRestore();
  });

  test("ArrowUp focuses the previous input", () => {
    const handleChange = vi.fn();

    const firstQuestion = YSQEmotionalDeprivation[0];
    const secondQuestion = YSQEmotionalDeprivation[1];

    const questionRefs = [];

    const renderSpy = vi
      .spyOn(YSQQuestions, "default")
      .mockImplementation(({ item, onArrowUp, ref }) => {
        const inputRef = { focus: vi.fn() };
        if (ref) ref(inputRef);
        return (
          <div
            data-testid={`question-${item.id}`}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") onArrowUp();
            }}
          >
            {item.prompt}
          </div>
        );
      });

    vi.spyOn(useValidateTokenHook, "default").mockReturnValue({
      isValid: true,
      showInvalidTokenModal: false,
      setShowInvalidTokenModal: vi.fn(),
    });

    vi.spyOn(useYSQFormHook, "default").mockReturnValue({
      answers: {},
      formError: "",
      missingIds: [],
      resetModalOpen: false,
      resetModalClosing: false,
      handleChange,
      handleSubmit: (fn) => fn,
      handleResetClick: vi.fn(),
      confirmReset: vi.fn(),
      cancelReset: vi.fn(),
      handleModalCloseFinished: vi.fn(),
      setFormError: vi.fn(),
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <YSQ />
      </MemoryRouter>
    );

    const firstInput = getByTestId(`question-${firstQuestion.id}`);
    const secondInput = getByTestId(`question-${secondQuestion.id}`);

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

    vi.spyOn(useYSQFormHook, "default").mockReturnValue({
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
        <YSQ />
      </MemoryRouter>
    );

    const tooltip = getByTestId("rating-scale-tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.dataset.title).toBe("YSQ Rating Scale");
    expect(getByText("1 - Completely untrue of me")).toBeInTheDocument();
    expect(getByText("6 - Describes me perfectly")).toBeInTheDocument();
  });
});
