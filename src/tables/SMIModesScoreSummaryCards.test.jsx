import { describe, test, expect } from "vitest";
import { render } from "@testing-library/react";
import SMIModesScoreSummaryCards from "./SMIModesScoreSummaryCards";

describe("SMIModesScoreSummaryCards", () => {
  const modeGroups = [
    { label: "Child Modes", items: ["Vulnerable Child", "Angry Child"] },
    { label: "Coping Modes", items: ["Compliant Surrenderer"] },
  ];

  const smiTableData = {
    "Vulnerable Child": { column: "Average - Moderate", alignment: "center" },
    "Angry Child": { column: "High - Very High", alignment: "left" },
    "Compliant Surrenderer": { column: null, alignment: null },
  };

  test("renders the correct number of cards", () => {
    const { container } = render(
      <SMIModesScoreSummaryCards
        modeGroups={modeGroups}
        smiTableData={smiTableData}
      />
    );

    const cards = container.querySelectorAll(".border-2");
    expect(cards.length).toBe(modeGroups.length);
    expect(cards[0].textContent).toContain("Child Modes");
    expect(cards[1].textContent).toContain("Coping Modes");
  });

  test("renders all mode items with their corresponding column values", () => {
    const { container } = render(
      <SMIModesScoreSummaryCards
        modeGroups={modeGroups}
        smiTableData={smiTableData}
      />
    );

    const firstCardItems = container
      .querySelectorAll(".border-2")[0]
      .querySelectorAll("li");
    expect(firstCardItems[0].textContent).toBe(
      "Vulnerable Child:Average - Moderate"
    );
    expect(firstCardItems[1].textContent).toBe("Angry Child:High - Very High");

    const secondCardItems = container
      .querySelectorAll(".border-2")[1]
      .querySelectorAll("li");
    expect(secondCardItems[0].textContent).toBe("Compliant Surrenderer:");
  });

  test("renders empty string for modes with null column", () => {
    const { container } = render(
      <SMIModesScoreSummaryCards
        modeGroups={modeGroups}
        smiTableData={smiTableData}
      />
    );

    const secondCardItem = container
      .querySelectorAll(".border-2")[1]
      .querySelector("li");
    expect(secondCardItem.textContent).toBe("Compliant Surrenderer:");
  });

  test("renders all modes with their columns", () => {
    const smiTableData = {
      "Vulnerable Child": { column: "Average - Moderate", alignment: "center" },
      "Angry Child": { column: "Moderate - High", alignment: "right" },
    };

    const { container } = render(
      <SMIModesScoreSummaryCards
        modeGroups={modeGroups}
        smiTableData={smiTableData}
      />
    );

    const items = container
      .querySelectorAll(".border-2")[0]
      .querySelectorAll("li");
    expect(items[0].textContent).toBe("Vulnerable Child:Average - Moderate");
    expect(items[1].textContent).toBe("Angry Child:Moderate - High");
  });
});
