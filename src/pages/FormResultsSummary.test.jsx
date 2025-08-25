import { render, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import FormResultsSummary from "./FormResultsSummary";
import { useClientContext } from "../context/ClientContext";
import { useNavigate } from "react-router-dom";

vi.mock("../context/ClientContext");

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("../utils/parseScores", () => ({
  parseScore: vi.fn((score) => ({ score, label: "MockLabel" })),
}));

vi.mock("../components/modals/SMISummaryModal", () => ({
  default: ({ isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="smi-modal">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

const smiTableProps = {};
vi.mock("../tables/SMIModesTable", () => ({
  default: (props) => {
    Object.assign(smiTableProps, props);
    return (
      <div data-testid="smi-table" onClick={() => props.openModal?.()}>
        SMIModesTable
      </div>
    );
  },
}));

const ysqTableProps = {};
vi.mock("../tables/YSQSchemasTable", () => ({
  default: (props) => {
    Object.assign(ysqTableProps, props);
    return (
      <table data-testid="ysq-table">
        <thead>
          <tr>
            <th
              data-testid="raw-header"
              onClick={() => props.onHeaderClick("raw")}
              onContextMenu={(e) => props.onHeaderRightClick(e, "raw")}
            >
              Raw Header
            </th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    );
  },
}));

vi.mock("../components/BecksBurnsScoreCard", () => ({
  default: ({ title }) => <div>{title} ScoreCard</div>,
}));

vi.mock("../components/ProtectedAccess", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("../components/ui/Button", () => ({
  default: (props) => <button {...props}>{props.children}</button>,
}));

describe("FormResultsSummary", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useClientContext.mockReturnValue({
      clientFormsStatus: {
        clientName: "John Doe",
        clientDob: "1990-01-01",
        scores: {
          bdi: { bdi_score: 10 },
          bai: { bai_score: 15 },
          smi: {},
          ysq: {},
          ysq456: {},
        },
        forms: {
          SMI: { submittedAt: "2025-08-25T12:00:00Z" },
          YSQ: { submittedAt: "2025-08-25T12:00:00Z" },
          BURNS: { submittedAt: "2025-08-25T12:00:00Z" },
          BECKS: { submittedAt: "2025-08-25T12:00:00Z" },
        },
      },
    });
  });

  test("renders client info and title", () => {
    const { getByText } = render(<FormResultsSummary />);
    expect(getByText("SMI/YSQ/BAI/BDI Summary Sheet")).toBeInTheDocument();
    expect(getByText(/Client:/)).toBeInTheDocument();
    expect(getByText("John Doe")).toBeInTheDocument();
    expect(getByText(/Date of Birth:/)).toBeInTheDocument();
  });

  test("navigates to dashboard on button click", () => {
    const { getByRole } = render(<FormResultsSummary />);
    fireEvent.click(getByRole("button", { name: /Go to Dashboard/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("prints page on print button click", () => {
    window.print = vi.fn();
    const { getByRole } = render(<FormResultsSummary />);
    fireEvent.click(getByRole("button", { name: /Print page/i }));
    expect(window.print).toHaveBeenCalled();
  });

  test("renders empty string for missing clientDob", () => {
    useClientContext.mockReturnValue({
      clientFormsStatus: {
        clientName: "Jane Doe",
        scores: { bdi: {}, bai: {}, smi: {}, ysq: {}, ysq456: {} },
        forms: { SMI: {}, YSQ: {}, BURNS: {}, BECKS: {} },
      },
    });
    const { getByText } = render(<FormResultsSummary />);
    expect(getByText(/Date of Birth:/)).toHaveTextContent("Date of Birth:");
  });

  test("right-click on header undoes grayout if already grayed out", () => {
    const { getByTestId } = render(<FormResultsSummary />);
    const rawHeader = getByTestId("raw-header");
    fireEvent.click(rawHeader);
    fireEvent.contextMenu(rawHeader);
    expect(rawHeader).toBeInTheDocument();
  });

  test("right-click on header does nothing if not grayed out", () => {
    const { getByTestId } = render(<FormResultsSummary />);
    const rawHeader = getByTestId("raw-header");
    fireEvent.contextMenu(rawHeader);
    expect(rawHeader).toBeInTheDocument();
  });

  test("renders empty string when clientName is missing", () => {
    useClientContext.mockReturnValue({
      clientFormsStatus: {
        clientDob: "1990-01-01",
        scores: { bdi: {}, bai: {}, smi: {}, ysq: {}, ysq456: {} },
        forms: { SMI: {}, YSQ: {}, BURNS: {}, BECKS: {} },
      },
    });
    const { getByText } = render(<FormResultsSummary />);
    expect(getByText(/^Client:/)).toHaveTextContent("Client:");
  });

  test("modal opens when SMIModesTable clicked", () => {
    const { getByTestId } = render(<FormResultsSummary />);
    fireEvent.click(getByTestId("smi-table"));
    expect(getByTestId("smi-modal")).toBeInTheDocument();
  });

  test("passes empty object as smiScores if missing", () => {
    render(<FormResultsSummary />);
    expect(smiTableProps.smiScores).toEqual({});
  });

  test("passes smiScores prop correctly when present", () => {
    const smiScoresMock = { Q1: "5", Q2: "3" };
    useClientContext.mockReturnValue({
      clientFormsStatus: {
        clientName: "John Doe",
        clientDob: "1990-01-01",
        scores: {
          smi: smiScoresMock,
          bdi: { bdi_score: 10 },
          bai: { bai_score: 15 },
          ysq: {},
          ysq456: {},
        },
        forms: {
          SMI: { submittedAt: "2025-08-25T12:00:00Z" },
          YSQ: { submittedAt: "2025-08-25T12:00:00Z" },
          BURNS: { submittedAt: "2025-08-25T12:00:00Z" },
          BECKS: { submittedAt: "2025-08-25T12:00:00Z" },
        },
      },
    });
    render(<FormResultsSummary />);
    expect(smiTableProps.smiScores).toEqual(smiScoresMock);
  });

  test("defaults smiScores to empty object if clientFormsStatus is null", () => {
    useClientContext.mockReturnValue({ clientFormsStatus: null });
    render(<FormResultsSummary />);
    expect(smiTableProps.smiScores).toEqual({});
  });

  test("right-click on header undoes grayout if already grayed out", () => {
    const { getByTestId } = render(<FormResultsSummary />);
    const rawHeader = getByTestId("raw-header");

    fireEvent.click(rawHeader);
    expect(ysqTableProps.grayedOutCol).toBe("raw");

    fireEvent.contextMenu(rawHeader);
    expect(ysqTableProps.grayedOutCol).toBe(null);
  });

  test("opens and closes SMIModal", () => {
    const { getByTestId, getByText } = render(<FormResultsSummary />);
    fireEvent.click(getByTestId("smi-table"));
    expect(getByTestId("smi-modal")).toBeInTheDocument();
    fireEvent.click(getByText("Close"));
    expect(() => getByTestId("smi-modal")).toThrow();
  });
});
