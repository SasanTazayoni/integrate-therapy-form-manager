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
    expect(headerTextClass("raw", "raw")).toBe("text-gray-500");
    expect(headerTextClass("raw", "456")).toBe("text-gray-900");
    expect(headerTextClass("raw", null)).toBe("text-gray-900");
  });

  test("cellTextClass returns correct classes", () => {
    expect(cellTextClass("456", "456")).toBe("text-gray-300");
    expect(cellTextClass("456", "raw")).toBe("text-gray-900");
    expect(cellTextClass("456", null)).toBe("text-gray-900");
  });

  test("getSchemaRowScores returns correct values for raw grayedOutCol", () => {
    const schema = { name: "Test", code: "TS", max: 50 };
    const ysqScores = { ysq_ts_score: "10-High" };
    const ysq456Scores = { ysq_ts_456: "5-Low" };

    const result = getSchemaRowScores(schema, "raw", ysqScores, ysq456Scores);
    expect(result.rawScore).toBe("10");
    expect(result.score456).toBe("5");
    expect(result.rating).toBe("Low");
    expect(result.highlight).toBe(false);
  });

  test("getSchemaRowScores returns correct values for 456 grayedOutCol", () => {
    const schema = { name: "Test", code: "TS", max: 50 };
    const ysqScores = { ysq_ts_score: "10-Severe" };
    const ysq456Scores = { ysq_ts_456: "5-Low" };

    const result = getSchemaRowScores(schema, "456", ysqScores, ysq456Scores);
    expect(result.rawScore).toBe("10");
    expect(result.score456).toBe("5");
    expect(result.rating).toBe("Severe");
    expect(result.highlight).toBe(true);
  });

  test("getSchemaRowScores handles empty scores gracefully", () => {
    const schema = { name: "Test", code: "TS", max: 50 };
    const result = getSchemaRowScores(schema, "raw", {}, {});
    expect(result.rawScore).toBe("");
    expect(result.score456).toBe("");
    expect(result.rating).toBe("");
    expect(result.highlight).toBe(false);
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

    expect(getByText("Raw")).toHaveClass("text-gray-500");
    expect(getByText("4/5/6")).toHaveClass("text-gray-900");
    const rawCell = getByText("12");
    const score456Cell = getByText("8");
    expect(rawCell).toHaveClass("text-gray-300");
    expect(score456Cell).toHaveClass("text-gray-900");
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

    const { getAllByRole } = render(
      <YSQSchemasTable
        grayedOutCol="456"
        onHeaderClick={mockOnHeaderClick}
        onHeaderRightClick={mockOnHeaderRightClick}
        ysqScores={ysqScores}
        ysq456Scores={ysq456Scores}
      />
    );

    const ratingCells = getAllByRole("cell", { name: /./ }).filter((cell) =>
      cell.classList.contains("rating-cell")
    );

    ratingCells.forEach((cell) => {
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
    });
  });

  test("renders rating-cell without highlight classes when rating is not severe/high", () => {
    const ysqScores = { ysq_ed_score: "10-Low" };
    const ysq456Scores = { ysq_ed_456: "5-Low" };

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

    expect(ratingCells.length).toBeGreaterThan(0);

    ratingCells.forEach((cell) => {
      expect(cell).not.toHaveClass("bg-yellow-200");
      expect(cell).not.toHaveClass("border-yellow-400");
    });
  });

  test("renders all schema rows with correct names, codes, and scores", () => {
    const ysqScores = {
      ysq_ed_score: "12-High",
      ysq_ab_score: "8-Low",
      ysq_ma_score: "20-Medium",
      ysq_si_score: "15-Low",
      ysq_ds_score: "18-Medium",
      ysq_fa_score: "7-Low",
      ysq_di_score: "22-High",
      ysq_vu_score: "10-Low",
      ysq_eu_score: "14-Medium",
      ysq_sb_score: "8-Low",
      ysq_ss_score: "30-High",
      ysq_ei_score: "5-Low",
      ysq_us_score: "25-Medium",
      ysq_et_score: "12-Low",
      ysq_is_score: "20-High",
      ysq_as_score: "16-Medium",
      ysq_np_score: "14-Low",
      ysq_pu_score: "18-High",
    };

    const ysq456Scores = {
      ysq_ed_456: "5-Low",
      ysq_ab_456: "10-Medium",
      ysq_ma_456: "15-High",
      ysq_si_456: "8-Low",
      ysq_ds_456: "12-Medium",
      ysq_fa_456: "3-Low",
      ysq_di_456: "10-High",
      ysq_vu_456: "6-Low",
      ysq_eu_456: "7-Medium",
      ysq_sb_456: "5-Low",
      ysq_ss_456: "20-High",
      ysq_ei_456: "2-Low",
      ysq_us_456: "18-Medium",
      ysq_et_456: "5-Low",
      ysq_is_456: "15-High",
      ysq_as_456: "10-Medium",
      ysq_np_456: "7-Low",
      ysq_pu_456: "12-High",
    };

    const { getByText, container } = render(
      <YSQSchemasTable
        grayedOutCol={null}
        onHeaderClick={mockOnHeaderClick}
        onHeaderRightClick={mockOnHeaderRightClick}
        ysqScores={ysqScores}
        ysq456Scores={ysq456Scores}
      />
    );

    const schemas = [
      { name: "Emotional Deprivation", code: "ED" },
      { name: "Abandonment", code: "AB" },
      { name: "Mistrust/Abuse", code: "MA" },
      { name: "Social Isolation", code: "SI" },
      { name: "Defectiveness/Shame", code: "DS" },
      { name: "Failure", code: "FA" },
      { name: "Dependence/Incompetence", code: "DI" },
      { name: "Vulnerability to Harm", code: "VU" },
      { name: "Enmeshment/Under-Developed Self", code: "EU" },
      { name: "Subjugation", code: "SB" },
      { name: "Self-Sacrifice", code: "SS" },
      { name: "Emotional Inhibition", code: "EI" },
      { name: "Unrelenting Standards", code: "US" },
      { name: "Entitlement/Grandiosity", code: "ET" },
      { name: "Insufficient Self-Control", code: "IS" },
      { name: "Approval Seeking", code: "AS" },
      { name: "Negativity/Pessimism", code: "NP" },
      { name: "Punitiveness", code: "PU" },
    ];

    const rows = container.querySelectorAll("tbody tr");

    schemas.forEach(({ name, code }, idx) => {
      const row = rows[idx];
      const tds = row.querySelectorAll("td");
      expect(tds[0]).toHaveTextContent(new RegExp(`${name} \\(${code}\\)`));
      const rawScore =
        ysqScores[`ysq_${code.toLowerCase()}_score`].split("-")[0];
      const score456 =
        ysq456Scores[`ysq_${code.toLowerCase()}_456`].split("-")[0];
      expect(tds[1]).toHaveTextContent(rawScore);
      expect(tds[2]).toHaveTextContent(score456);
      const rating = ysqScores[`ysq_${code.toLowerCase()}_score`].split("-")[1];
      const ratingCell = tds[4];
      expect(ratingCell).toHaveAttribute("data-rating", "");
    });
  });
});
