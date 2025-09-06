import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import SMISummaryModal from "./SMISummaryModal";

beforeEach(() => {
  let modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);
  }
  modalRoot.innerHTML = "";
});

vi.mock("../../tables/SMIModesTableScores", () => ({
  default: ({ label }) => <div data-testid={`table-${label}`}>{label}</div>,
}));

vi.mock("../../tables/SMIModesScoreSummaryCards", () => ({
  default: ({ modeGroups }) => (
    <div data-testid="cards">{modeGroups.map((g) => g.label).join(",")}</div>
  ),
}));

vi.mock("../Modal", () => ({
  default: ({ children, onCloseFinished, closing, onOverlayClick }) => {
    return (
      <div className="wide-modal" onClick={onOverlayClick}>
        {children}
        {closing && (
          <button data-testid="finish-close" onClick={onCloseFinished} />
        )}
        <button data-testid="close-button" onClick={onOverlayClick}>
          Close
        </button>
      </div>
    );
  },
}));

describe("SMISummaryModal", () => {
  const mockSmiScores = { vulnerableChild: "3" };
  const mockSubmittedAt = "2025-08-21T00:00:00Z";
  const mockClientName = "John Doe";
  const mockClientDob = "1990-01-01";

  test("renders modal when isOpen is true and shows client info", () => {
    const onClose = vi.fn();
    const { container } = render(
      <SMISummaryModal
        isOpen={true}
        onClose={onClose}
        smiScores={mockSmiScores}
        submittedAt={mockSubmittedAt}
        clientName={mockClientName}
        clientDob={mockClientDob}
      />
    );

    const modal = container.querySelector(".wide-modal");
    expect(modal).not.toBeNull();
    expect(container.textContent).toContain(mockClientName);
    expect(container.textContent).toContain("1990");
    expect(container.querySelector("[data-testid='cards']")).not.toBeNull();
  });

  test("does not render modal when isOpen is false", () => {
    const { container } = render(
      <SMISummaryModal isOpen={false} onClose={() => {}} smiScores={{}} />
    );
    expect(container.querySelector(".wide-modal")).toBeNull();
  });

  test("clicking Close button sets closing and calls onClose when finished", () => {
    const onClose = vi.fn();
    const { getByTestId } = render(
      <SMISummaryModal isOpen={true} onClose={onClose} smiScores={{}} />
    );

    fireEvent.click(getByTestId("close-button"));
    fireEvent.click(getByTestId("finish-close"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("clicking overlay sets closing and calls onClose when finished", () => {
    const onClose = vi.fn();
    const { container, getByTestId } = render(
      <SMISummaryModal isOpen={true} onClose={onClose} smiScores={{}} />
    );

    fireEvent.click(container.querySelector(".wide-modal"));
    fireEvent.click(getByTestId("finish-close"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("sets closing state correctly when isOpen changes", () => {
    const onClose = vi.fn();
    const { rerender, getByTestId } = render(
      <SMISummaryModal isOpen={true} onClose={onClose} smiScores={{}} />
    );

    fireEvent.click(getByTestId("close-button"));
    fireEvent.click(getByTestId("finish-close"));

    rerender(
      <SMISummaryModal isOpen={false} onClose={onClose} smiScores={{}} />
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("handleCloseButtonClick sets closing and calls onClose after finishing", () => {
    const onClose = vi.fn();
    const { getByTestId } = render(
      <SMISummaryModal isOpen={true} onClose={onClose} smiScores={{}} />
    );

    fireEvent.click(getByTestId("internal-close-button"));
    const finishCloseButton = getByTestId("finish-close");
    expect(finishCloseButton).toBeInTheDocument();
    fireEvent.click(finishCloseButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
