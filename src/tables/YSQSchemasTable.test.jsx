import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import YSQSchemasTable from "./YSQSchemasTable";

const mockOnHeaderClick = vi.fn();
const mockOnHeaderRightClick = vi.fn();

describe("YSQSchemasTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders table headers", () => {
    render(
      <YSQSchemasTable
        grayedOutCol={null}
        onHeaderClick={mockOnHeaderClick}
        onHeaderRightClick={mockOnHeaderRightClick}
      />
    );

    expect(screen.getByText("Schema")).toBeInTheDocument();
    expect(screen.getByText("Raw")).toBeInTheDocument();
    expect(screen.getByText("4/5/6")).toBeInTheDocument();
    expect(screen.getByText("Max")).toBeInTheDocument();
    expect(screen.getByText("Rating")).toBeInTheDocument();
  });

  test("calls onHeaderClick and onHeaderRightClick", () => {
    render(
      <YSQSchemasTable
        grayedOutCol={null}
        onHeaderClick={mockOnHeaderClick}
        onHeaderRightClick={mockOnHeaderRightClick}
      />
    );

    fireEvent.click(screen.getByText("Raw"));
    expect(mockOnHeaderClick).toHaveBeenCalledWith("raw");

    fireEvent.contextMenu(screen.getByText("4/5/6"));
    expect(mockOnHeaderRightClick).toHaveBeenCalled();
    expect(mockOnHeaderRightClick.mock.calls[0][1]).toBe("456");
  });

  test("renders submitted date if provided", () => {
    const date = "2025-08-24T12:00:00.000Z";
    render(
      <YSQSchemasTable
        grayedOutCol={null}
        onHeaderClick={mockOnHeaderClick}
        onHeaderRightClick={mockOnHeaderRightClick}
        ysqSubmittedAt={date}
      />
    );

    expect(screen.getByText(/\(24\/08\/2025\)/)).toBeInTheDocument();
  });

  test("applies gray class for grayedOutCol", () => {
    render(
      <YSQSchemasTable
        grayedOutCol="raw"
        onHeaderClick={mockOnHeaderClick}
        onHeaderRightClick={mockOnHeaderRightClick}
      />
    );

    expect(screen.getByText("Raw")).toHaveClass("text-gray-500");
    expect(screen.getByText("4/5/6")).toHaveClass("text-gray-900");
  });

  test("applies highlight class for ratings that should be highlighted", () => {
    const ysqScores = {
      ysq_ed_score: "25-Medium",
      ysq_ab_score: "40-High",
      ysq_ma_score: "10-Severe",
    };

    const ysq456Scores = {
      ysq_ed_456: "20-Low",
      ysq_ab_456: "35-Very High",
      ysq_ma_456: "5-Medium",
    };

    render(
      <YSQSchemasTable
        grayedOutCol="456"
        onHeaderClick={mockOnHeaderClick}
        onHeaderRightClick={mockOnHeaderRightClick}
        ysqScores={ysqScores}
        ysq456Scores={ysq456Scores}
      />
    );

    const ratingCells = screen.getAllByRole("cell", { name: /./ });

    ratingCells.forEach((cell) => {
      if (cell.classList.contains("rating-cell")) {
        const rating = cell.getAttribute("data-rating") || "";
        const isHighlighted = ["high", "very high", "severe"].some((r) =>
          rating.toLowerCase().includes(r)
        );
        if (isHighlighted) {
          expect(cell).toHaveClass("bg-yellow-200");
          expect(cell).toHaveClass("border-yellow-400");
        } else {
          expect(cell).not.toHaveClass("bg-yellow-200");
          expect(cell).not.toHaveClass("border-yellow-400");
        }
      }
    });
  });
});
