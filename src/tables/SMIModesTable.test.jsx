import { render, fireEvent } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi } from "vitest";
import SMIModesTable from "./SMIModesTable";
import * as SMIHelpers from "../utils/SMIHelpers";

describe("SMIModesTable", () => {
  const mockOpenModal = vi.fn();
  const smiScores = {
    "Detached Protector": "3-high",
    "Bully and Attack": "1-low",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(SMIHelpers, "getCellData").mockImplementation((cell) => ({
      display: smiScores[cell] || "—",
      rating: smiScores[cell]?.split("-")[1] || "",
    }));

    vi.spyOn(SMIHelpers, "shouldHighlight").mockImplementation(
      (rating) => rating === "high"
    );
  });

  test("renders all SMI modes", () => {
    const { getAllByText } = render(
      <SMIModesTable
        openModal={mockOpenModal}
        submittedAt="2025-08-24"
        smiScores={smiScores}
      />
    );

    expect(getAllByText("Detached Protector").length).toBeGreaterThan(0);
    expect(getAllByText("Bully and Attack").length).toBeGreaterThan(0);
    expect(getAllByText("Healthy Adult *").length).toBeGreaterThan(0);
  });

  test("highlights high-rated cells", () => {
    const { getAllByText } = render(
      <SMIModesTable openModal={mockOpenModal} smiScores={smiScores} />
    );

    const highlightedCells = getAllByText("Detached Protector").map(
      (el) => el.parentElement
    );
    highlightedCells.forEach((cell) => {
      expect(cell).toHaveClass("bg-yellow-200");
    });
  });

  test("calls openModal when summary sheet button is clicked", () => {
    const { getAllByTitle } = render(
      <SMIModesTable openModal={mockOpenModal} smiScores={smiScores} />
    );
    const buttons = getAllByTitle("Open SMI Summary Sheet");
    fireEvent.click(buttons[0]);
    expect(mockOpenModal).toHaveBeenCalled();
  });

  test("renders fallback '-' for modes with no data", () => {
    const emptyDataScores = {
      "Detached Protector": "3-high",
      "Bully and Attack": "1-low",
    };

    vi.spyOn(SMIHelpers, "getCellData").mockImplementation((cell) => {
      if (cell === "Vulnerable Child") return null;
      if (cell === "Healthy Adult *") return {};
      return { display: emptyDataScores[cell], rating: "low" };
    });

    const { getAllByText } = render(
      <SMIModesTable openModal={mockOpenModal} smiScores={emptyDataScores} />
    );

    const vulnerableChildCell =
      getAllByText("Vulnerable Child")[0].parentElement;
    expect(vulnerableChildCell).toHaveTextContent("—");

    const healthyAdultCell = getAllByText("Healthy Adult *")[0].parentElement;
    expect(healthyAdultCell).toHaveTextContent("—");
  });
});
