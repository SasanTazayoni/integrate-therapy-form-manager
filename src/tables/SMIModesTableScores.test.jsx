import { describe, test, expect } from "vitest";
import { render } from "@testing-library/react";
import SMIModesScoreSummaryTable from "./SMIModesTableScores";

describe("SMIModesScoreSummaryTable", () => {
  const columns = [
    "Very Low - Average",
    "Average - Moderate",
    "Moderate - High",
    "High - Very High",
    "Very High - Severe",
  ];

  const items = ["Vulnerable Child", "Angry Child", "Enraged Child"];
  const smiTableData = {
    "Vulnerable Child": { column: "Moderate - High", alignment: "center" },
    "Angry Child": { column: "High - Very High", alignment: "right" },
    "Enraged Child": { column: "Average - Moderate", alignment: "left" },
  };

  test("renders table with correct headers", () => {
    const { getByText } = render(
      <SMIModesScoreSummaryTable
        label="Child Modes"
        items={items}
        smiTableData={smiTableData}
      />
    );

    expect(getByText("Child Modes")).toBeDefined();

    columns.forEach((col) => {
      expect(getByText(col)).toBeDefined();
    });
  });

  test("renders all modes in first column", () => {
    const { getByText } = render(
      <SMIModesScoreSummaryTable
        label="Child Modes"
        items={items}
        smiTableData={smiTableData}
      />
    );

    items.forEach((mode) => {
      expect(getByText(mode)).toBeDefined();
    });
  });

  test("renders X in the correct column with correct alignment class", () => {
    const { container } = render(
      <SMIModesScoreSummaryTable
        label="Child Modes"
        items={items}
        smiTableData={smiTableData}
      />
    );

    const vulnerableChildCell = container.querySelector(
      "tr:nth-child(1) td:nth-child(4)"
    );
    expect(vulnerableChildCell?.textContent).toBe("X");
    expect(vulnerableChildCell?.className).toContain(
      "text-center font-bold text-lg"
    );

    const angryChildCell = container.querySelector(
      "tr:nth-child(2) td:nth-child(5)"
    );
    expect(angryChildCell?.textContent).toBe("X");
    expect(angryChildCell?.className).toContain("text-right font-bold text-lg");

    const enragedChildCell = container.querySelector(
      "tr:nth-child(3) td:nth-child(3)"
    );
    expect(enragedChildCell?.textContent).toBe("X");
    expect(enragedChildCell?.className).toContain(
      "text-left font-bold text-lg"
    );
  });

  test("cells without X are empty", () => {
    const { container } = render(
      <SMIModesScoreSummaryTable
        label="Child Modes"
        items={items}
        smiTableData={smiTableData}
      />
    );

    const firstRowFirstDataCell = container.querySelector(
      "tr:nth-child(1) td:nth-child(2)"
    );
    expect(firstRowFirstDataCell?.textContent).toBe("");
  });

  test("handles mode with missing smiTableData entry", () => {
    const itemsWithMissing = ["Vulnerable Child", "Missing Mode"];
    const smiDataPartial = {
      "Vulnerable Child": { column: "Moderate - High", alignment: "center" },
    };

    const { container, getByText } = render(
      <SMIModesScoreSummaryTable
        label="Child Modes"
        items={itemsWithMissing}
        smiTableData={smiDataPartial}
      />
    );

    expect(getByText("Vulnerable Child")).toBeDefined();
    expect(getByText("Missing Mode")).toBeDefined();

    const missingModeRow = container.querySelector("tr:nth-child(2)");
    expect(missingModeRow?.textContent).not.toContain("X");
  });
});
