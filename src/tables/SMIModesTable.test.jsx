import { render, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi } from "vitest";
import SMIModesTable from "./SMIModesTable";
import * as SMIHelpers from "../utils/SMIHelpers";
import { ClientProvider } from "../context/ClientContext";

function renderWithClient(ui, options = {}) {
  return render(<ClientProvider>{ui}</ClientProvider>, options);
}

describe("SMIModesTable", () => {
  const mockOpenModal = vi.fn();
  const smiScores = {
    "Detached Protector": "3-high",
    "Bully and Attack": "1-low",
    "Self-Aggrandizer": "5-severe",
  };
  let mockSetLocalSmiScores;
  let mockSetLocalSmiSubmittedAt;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetLocalSmiScores = vi.fn();
    mockSetLocalSmiSubmittedAt = vi.fn();

    vi.spyOn(SMIHelpers, "getCellData").mockImplementation((cell) => {
      const val = smiScores[cell];
      if (!val) return null;
      const [num, rating] = val.split("-");
      return {
        display: num,
        rating,
        highlightLevel:
          rating === "high"
            ? "highlight"
            : rating === "severe"
            ? "severe"
            : "none",
      };
    });

    let modalRoot = document.getElementById("modal-root");
    if (!modalRoot) {
      modalRoot = document.createElement("div");
      modalRoot.setAttribute("id", "modal-root");
      document.body.appendChild(modalRoot);
    }
    modalRoot.innerHTML = "";
  });

  test("renders all SMI modes", () => {
    const { getAllByText } = renderWithClient(
      <SMIModesTable
        openModal={mockOpenModal}
        submittedAt="2025-08-24"
        smiScores={smiScores}
        setLocalSmiScores={mockSetLocalSmiScores}
        setLocalSmiSubmittedAt={mockSetLocalSmiSubmittedAt}
      />
    );

    expect(getAllByText("Detached Protector").length).toBeGreaterThan(0);
    expect(getAllByText("Bully and Attack").length).toBeGreaterThan(0);
    expect(getAllByText("Healthy Adult *").length).toBeGreaterThan(0);
  });

  test("applies yellow highlight for high-rated cells", () => {
    const { getAllByText } = renderWithClient(
      <SMIModesTable openModal={mockOpenModal} smiScores={smiScores} />
    );

    const td = getAllByText("Detached Protector")[0].closest("td");
    expect(td).toHaveClass("bg-yellow-200");
    expect(td).toHaveClass("border-yellow-400");
  });

  test("applies red highlight for severe-rated cells", () => {
    const { getAllByText } = renderWithClient(
      <SMIModesTable openModal={mockOpenModal} smiScores={smiScores} />
    );

    const td = getAllByText("Self-Aggrandizer")[0].closest("td");
    expect(td).toHaveClass("bg-red-300");
    expect(td).toHaveClass("border-red-500");
  });

  test("clicking summary sheet icon calls openModal", () => {
    const { container } = renderWithClient(
      <SMIModesTable
        openModal={mockOpenModal}
        smiScores={smiScores}
        setLocalSmiScores={mockSetLocalSmiScores}
        setLocalSmiSubmittedAt={mockSetLocalSmiSubmittedAt}
      />
    );

    const fileTextButtons = container.querySelectorAll("svg");
    if (fileTextButtons.length > 0) fireEvent.click(fileTextButtons[0]);

    expect(mockOpenModal).toHaveBeenCalled();
  });

  test("clicking desktop Database icon opens SMI modal", async () => {
    const { getAllByText, getByTestId } = renderWithClient(
      <SMIModesTable
        openModal={mockOpenModal}
        smiScores={smiScores}
        setLocalSmiScores={mockSetLocalSmiScores}
        setLocalSmiSubmittedAt={mockSetLocalSmiSubmittedAt}
      />
    );

    const desktopIcon = getByTestId("db-icon-desktop");

    await act(async () => {
      fireEvent.click(desktopIcon);
    });

    await waitFor(() => {
      const modals = getAllByText("Previous SMI Submissions");
      expect(modals[0]).toBeInTheDocument();
    });
  });

  test("clicking mobile Database icon opens SMI modal", async () => {
    const { getAllByText, getByTestId } = renderWithClient(
      <SMIModesTable
        openModal={mockOpenModal}
        smiScores={smiScores}
        setLocalSmiScores={mockSetLocalSmiScores}
        setLocalSmiSubmittedAt={mockSetLocalSmiSubmittedAt}
      />
    );

    const mobileIcon = getByTestId("db-icon-mobile");

    await act(async () => {
      fireEvent.click(mobileIcon);
    });

    await waitFor(() => {
      const modals = getAllByText("Previous SMI Submissions");
      expect(modals[0]).toBeInTheDocument();
    });
  });

  test("renders fallback '-' for missing data", () => {
    vi.spyOn(SMIHelpers, "getCellData").mockImplementation((cell) => {
      if (cell === "Vulnerable Child") return null;
      if (cell === "Healthy Adult *") return {};
      return { display: smiScores[cell], rating: "low" };
    });

    const { getAllByText } = renderWithClient(
      <SMIModesTable
        openModal={mockOpenModal}
        smiScores={smiScores}
        setLocalSmiScores={mockSetLocalSmiScores}
        setLocalSmiSubmittedAt={mockSetLocalSmiSubmittedAt}
      />
    );

    const vulnerableChildCell =
      getAllByText("Vulnerable Child")[0].parentElement;
    expect(vulnerableChildCell).toHaveTextContent("—");

    const healthyAdultCell = getAllByText("Healthy Adult *")[0].parentElement;
    expect(healthyAdultCell).toHaveTextContent("—");
  });

  test("closing SMI modal calls handleCloseSmiModal", async () => {
    const { getByText, queryByText } = renderWithClient(
      <SMIModesTable
        openModal={mockOpenModal}
        smiScores={smiScores}
        setLocalSmiScores={mockSetLocalSmiScores}
        setLocalSmiSubmittedAt={mockSetLocalSmiSubmittedAt}
      />
    );

    const desktopIcon = document.querySelector(
      '[data-testid="db-icon-desktop"]'
    );
    await act(async () => {
      fireEvent.click(desktopIcon);
    });

    const modal = document.querySelector(".modal");
    expect(modal).toBeInTheDocument();
    const closeButton = modal.querySelector("button");
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(modal.parentElement).not.toBeInTheDocument();
    });
  });
});
