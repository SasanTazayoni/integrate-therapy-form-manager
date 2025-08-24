import { render, screen, fireEvent } from "@testing-library/react";
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
    render(
      <SMIModesTable
        openModal={mockOpenModal}
        submittedAt="2025-08-24"
        smiScores={smiScores}
      />
    );

    const detachedProtectorCells = screen.getAllByText("Detached Protector");
    expect(detachedProtectorCells.length).toBeGreaterThan(0);

    const bullyAndAttackCells = screen.getAllByText("Bully and Attack");
    expect(bullyAndAttackCells.length).toBeGreaterThan(0);

    const healthyAdultCells = screen.getAllByText("Healthy Adult *");
    expect(healthyAdultCells.length).toBeGreaterThan(0);
  });

  test("highlights high-rated cells", () => {
    render(<SMIModesTable openModal={mockOpenModal} smiScores={smiScores} />);

    const highlightedCells = screen
      .getAllByText("Detached Protector")
      .map((el) => el.parentElement);
    highlightedCells.forEach((cell) => {
      expect(cell).toHaveClass("bg-yellow-200");
    });
  });

  test("calls openModal when summary sheet button is clicked", () => {
    render(<SMIModesTable openModal={mockOpenModal} smiScores={smiScores} />);
    const buttons = screen.getAllByTitle("Open SMI Summary Sheet");
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

    render(
      <SMIModesTable openModal={mockOpenModal} smiScores={emptyDataScores} />
    );

    const vulnerableChildCell =
      screen.getAllByText("Vulnerable Child")[0].parentElement;
    expect(vulnerableChildCell).toHaveTextContent("—");

    const healthyAdultCell =
      screen.getAllByText("Healthy Adult *")[0].parentElement;
    expect(healthyAdultCell).toHaveTextContent("—");
  });
});
