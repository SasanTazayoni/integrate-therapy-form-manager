import { render, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import YSQSchemasTable, {
  headerTextClass,
  cellTextClass,
  getSchemaRowScores,
} from "./YSQSchemasTable";

const mockOnHeaderClick = vi.fn();
const mockOnHeaderRightClick = vi.fn();

describe("YSQSchemasTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("headerTextClass returns correct classes", () => {
    expect(headerTextClass("raw", "raw")).toBe("text-gray-900");
    expect(headerTextClass("raw", "456")).toBe("text-gray-500");
    expect(headerTextClass("raw", null)).toBe("text-gray-500");
  });

  test("cellTextClass returns correct classes", () => {
    expect(cellTextClass("456", "456")).toBe("text-gray-900");
    expect(cellTextClass("456", "raw")).toBe("text-gray-300");
    expect(cellTextClass("456", null)).toBe("text-gray-300");
  });

  test("getSchemaRowScores returns correct values for raw grayedOutCol", () => {
    const schema = { name: "Test", code: "TS", max: 50 };
    const ysqScores = { ysq_ts_score: "10-High" };
    const ysq456Scores = { ysq_ts_456: "5-Low" };

    const result = getSchemaRowScores(schema, "raw", ysqScores, ysq456Scores);
    expect(result.rawScore).toBe("10");
    expect(result.score456).toBe("5");
    expect(result.rating).toBe("Low");
    expect(result.highlightLevel).toBe("none");
  });

  test("getSchemaRowScores returns correct values for 456 grayedOutCol", () => {
    const schema = { name: "Test", code: "TS", max: 50 };
    const ysqScores = { ysq_ts_score: "10-Severe" };
    const ysq456Scores = { ysq_ts_456: "5-Low" };

    const result = getSchemaRowScores(schema, "456", ysqScores, ysq456Scores);
    expect(result.rawScore).toBe("10");
    expect(result.score456).toBe("5");
    expect(result.rating).toBe("Severe");
    expect(result.highlightLevel).toBe("severe");
  });

  test("getSchemaRowScores handles empty scores gracefully", () => {
    const schema = { name: "Test", code: "TS", max: 50 };
    const result = getSchemaRowScores(schema, "raw", {}, {});
    expect(result.rawScore).toBe("");
    expect(result.score456).toBe("");
    expect(result.rating).toBe("");
    expect(result.highlightLevel).toBe("none");
  });

  test("renders table headers", () => {
    const { getByText } = render(
      <YSQSchemasTable
        grayedOutCol={null}
        onHeaderClick={mockOnHeaderClick}
        onHeaderRightClick={mockOnHeaderRightClick}
      />
    );
    ["Schema", "Raw", "4/5/6", "Max", "Rating"].forEach((text) => {
      expect(getByText(text)).toBeInTheDocument();
    });
  });

  test("calls onHeaderClick and onHeaderRightClick only for Raw and 4/5/6 headers", () => {
    const { getByText } = render(
      <YSQSchemasTable
        grayedOutCol={null}
        onHeaderClick={mockOnHeaderClick}
        onHeaderRightClick={mockOnHeaderRightClick}
      />
    );

    const rawHeader = getByText("Raw");
    const h456 = getByText("4/5/6");
    fireEvent.click(rawHeader);
    fireEvent.contextMenu(rawHeader);
    fireEvent.click(h456);
    fireEvent.contextMenu(h456);
    expect(mockOnHeaderClick).toHaveBeenCalledTimes(2);
    expect(mockOnHeaderClick).toHaveBeenCalledWith("raw");
    expect(mockOnHeaderClick).toHaveBeenCalledWith("456");
    expect(mockOnHeaderRightClick).toHaveBeenCalledTimes(2);
    expect(mockOnHeaderRightClick.mock.calls[0][1]).toBe("raw");
    expect(mockOnHeaderRightClick.mock.calls[1][1]).toBe("456");

    const maxHeader = getByText("Max");
    const ratingHeader = getByText("Rating");
    fireEvent.click(maxHeader);
    fireEvent.contextMenu(maxHeader);
    fireEvent.click(ratingHeader);
    fireEvent.contextMenu(ratingHeader);
    expect(mockOnHeaderClick).toHaveBeenCalledTimes(2);
    expect(mockOnHeaderRightClick).toHaveBeenCalledTimes(2);
  });

  test("renders submitted date if provided", () => {
    const date = new Date("2025-08-24T12:00:00.000Z");
    const formattedDate = `(${date.toLocaleDateString()})`;

    const { getByText } = render(
      <YSQSchemasTable
        grayedOutCol={null}
        onHeaderClick={mockOnHeaderClick}
        onHeaderRightClick={mockOnHeaderRightClick}
        ysqSubmittedAt={date.toISOString()}
      />
    );

    expect(getByText(formattedDate)).toBeInTheDocument();
  });

  test("does not render submitted date if ysqSubmittedAt is undefined", () => {
    const { queryByText } = render(
      <YSQSchemasTable
        grayedOutCol={null}
        onHeaderClick={mockOnHeaderClick}
        onHeaderRightClick={mockOnHeaderRightClick}
      />
    );
    expect(queryByText(/\(\d{1,2}\/\d{1,2}\/\d{4}\)/)).toBeNull();
  });

  test("applies correct gray classes for headers and cells based on grayedOutCol", () => {
    const ysqScores = { ysq_ed_score: "12-High" };
    const ysq456Scores = { ysq_ed_456: "8-Low" };

    const { getByText } = render(
      <YSQSchemasTable
        grayedOutCol="raw"
        onHeaderClick={mockOnHeaderClick}
        onHeaderRightClick={mockOnHeaderRightClick}
        ysqScores={ysqScores}
        ysq456Scores={ysq456Scores}
      />
    );

    expect(getByText("Raw")).toHaveClass("text-gray-900");
    expect(getByText("4/5/6")).toHaveClass("text-gray-500");
    const rawCell = getByText("12");
    const score456Cell = getByText("8");
    expect(rawCell).toHaveClass("text-gray-900");
    expect(score456Cell).toHaveClass("text-gray-300");
  });

  test("applies correct classes for ratings based on highlightLevel", () => {
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

    const { getAllByRole } = render(
      <YSQSchemasTable
        grayedOutCol="456"
        onHeaderClick={mockOnHeaderClick}
        onHeaderRightClick={mockOnHeaderRightClick}
        ysqScores={ysqScores}
        ysq456Scores={ysq456Scores}
      />
    );

    const ratingCells = getAllByRole("cell").filter((cell) =>
      cell.classList.contains("rating-cell")
    );

    ratingCells.forEach((cell) => {
      const rating = cell.getAttribute("data-rating") || "";
      if (rating.toLowerCase().includes("severe")) {
        expect(cell).toHaveClass("bg-red-300");
        expect(cell).toHaveClass("border-red-500");
      } else if (
        ["high", "very high"].some((r) => rating.toLowerCase().includes(r))
      ) {
        expect(cell).toHaveClass("bg-yellow-200");
        expect(cell).toHaveClass("border-yellow-400");
      } else {
        expect(cell).not.toHaveClass("bg-yellow-200");
        expect(cell).not.toHaveClass("border-yellow-400");
        expect(cell).not.toHaveClass("bg-red-300");
        expect(cell).not.toHaveClass("border-red-500");
      }
    });
  });
});
