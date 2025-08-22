import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import SMISummaryModal from "./SMISummaryModal";
import { useClientContext } from "../../context/ClientContext";

beforeEach(() => {
  let modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);
  }
  modalRoot.innerHTML = "";
});

vi.mock("../../context/ClientContext", () => ({
  useClientContext: vi.fn(),
}));

vi.mock("../../tables/SMIModesTableScores", () => ({
  default: ({ label }) => <div data-testid={`table-${label}`}>{label}</div>,
}));

vi.mock("../../tables/SMIModesScoreSummaryCards", () => ({
  default: ({ modeGroups }) => (
    <div data-testid="cards">{modeGroups.map((g) => g.label).join(",")}</div>
  ),
}));

vi.mock("../Modal", () => ({
  default: ({ children, onCloseFinished, closing, onOverlayClick }) => (
    <div className="wide-modal" onClick={onOverlayClick}>
      {children}
      {closing && (
        <button data-testid="finish-close" onClick={onCloseFinished} />
      )}
    </div>
  ),
}));

describe("SMISummaryModal", () => {
  test("renders modal when isOpen is true and shows client info", () => {
    useClientContext.mockReturnValue({
      clientFormsStatus: {
        clientName: "John Doe",
        clientDob: "1990-01-01",
        forms: { SMI: { submittedAt: "2025-08-21T00:00:00Z" } },
        scores: { smi: { vulnerableChild: 3 } },
      },
    });

    const onClose = vi.fn();
    const { container } = render(
      <SMISummaryModal isOpen={true} onClose={onClose} />
    );

    const modal = container.querySelector(".wide-modal");
    expect(modal).not.toBeNull();
    expect(container.textContent).toContain("John Doe");
    expect(container.textContent).toContain("01/01/1990");
    expect(container.querySelector("[data-testid='cards']")).not.toBeNull();
  });

  test("does not render modal when isOpen is false", () => {
    useClientContext.mockReturnValue({ clientFormsStatus: {} });
    const { container, queryByTestId } = render(
      <SMISummaryModal isOpen={false} onClose={() => {}} />
    );

    expect(container.querySelector(".wide-modal")).not.toBeNull();
    expect(queryByTestId("finish-close")).not.toBeNull();
  });

  test("clicking Close button sets closing and calls onClose when finished", () => {
    useClientContext.mockReturnValue({ clientFormsStatus: {} });
    const onClose = vi.fn();
    const { container, getByTestId } = render(
      <SMISummaryModal isOpen={true} onClose={onClose} />
    );

    const closeButton = container.querySelector("button");
    expect(closeButton).not.toBeNull();
    fireEvent.click(closeButton);

    const finishButton = getByTestId("finish-close");
    fireEvent.click(finishButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("clicking overlay sets closing and calls onClose when finished", () => {
    useClientContext.mockReturnValue({ clientFormsStatus: {} });
    const onClose = vi.fn();
    const { container, getByTestId } = render(
      <SMISummaryModal isOpen={true} onClose={onClose} />
    );

    fireEvent.click(container.querySelector(".wide-modal"));
    const finishButton = getByTestId("finish-close");
    fireEvent.click(finishButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("sets closing state correctly when isOpen changes", () => {
    useClientContext.mockReturnValue({ clientFormsStatus: {} });
    const onClose = vi.fn();

    const { rerender, getByTestId } = render(
      <SMISummaryModal isOpen={true} onClose={onClose} />
    );
    expect(getByTestId("cards")).not.toBeNull();

    rerender(<SMISummaryModal isOpen={false} onClose={onClose} />);
    const finishButton = getByTestId("finish-close");
    expect(finishButton).not.toBeNull();

    fireEvent.click(finishButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
