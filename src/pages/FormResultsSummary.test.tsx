import { render, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import FormResultsSummary from "./FormResultsSummary";
import { useClientContext } from "../context/ClientContext";
import { useNavigate } from "react-router-dom";
import type { ClientFormsStatus } from "../types/formStatusTypes";

vi.mock("../context/ClientContext");

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("../utils/parseScores", () => ({
  parseScore: vi.fn((score: unknown) => ({ score, label: "MockLabel" })),
}));

vi.mock("../components/modals/SMISummaryModal", () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="smi-modal">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

type SMITableProps = {
  openModal?: () => void;
  smiScores: Record<string, string | null>;
  hiddenColumn?: "raw" | "456" | null;
};

type YSQTableProps = {
  hiddenColumn: "raw" | "456" | null;
  onHeaderClick: (col: "raw" | "456") => void;
  onHeaderRightClick: (e: React.MouseEvent, col: "raw" | "456") => void;
};

let smiTableProps: SMITableProps = { smiScores: {} };
vi.mock("../tables/SMIModesTable", () => ({
  default: (props: SMITableProps) => {
    smiTableProps = props;
    return (
      <div data-testid="smi-table" onClick={() => props.openModal?.()}>
        SMIModesTable
      </div>
    );
  },
}));

let ysqTableProps: YSQTableProps = {
  hiddenColumn: null,
  onHeaderClick: () => {},
  onHeaderRightClick: () => {},
};
vi.mock("../tables/YSQSchemasTable", () => ({
  default: (props: YSQTableProps) => {
    ysqTableProps = props;
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
  default: ({ title }: { title: string }) => <div>{title} ScoreCard</div>,
}));

vi.mock("../components/ProtectedAccess", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("../components/Button", () => ({
  default: (
    props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
      children: React.ReactNode;
    }
  ) => <button {...props}>{props.children}</button>,
}));

const baseClientFormsStatus: ClientFormsStatus = {
  exists: true,
  clientName: "John Doe",
  clientDob: "1990-01-01",
  clientStatus: "active",
  scores: {
    bdi: { bdi_score: "10", submitted_at: null },
    bai: { bai_score: "15", submitted_at: null },
    smi: {},
    ysq: {},
    ysq456: {},
  },
  forms: {
    SMI: { submitted: true, activeToken: false, submittedAt: "2025-08-25T12:00:00Z" },
    YSQ: { submitted: true, activeToken: false, submittedAt: "2025-08-25T12:00:00Z" },
    BURNS: { submitted: true, activeToken: false, submittedAt: "2025-08-25T12:00:00Z" },
    BECKS: { submitted: true, activeToken: false, submittedAt: "2025-08-25T12:00:00Z" },
  },
};

const baseContext = {
  email: "",
  setEmail: vi.fn(),
  setClientFormsStatus: vi.fn(),
  successMessage: "",
  setSuccessMessage: vi.fn(),
  error: "",
  setError: vi.fn(),
};

describe("FormResultsSummary", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useClientContext).mockReturnValue({
      ...baseContext,
      clientFormsStatus: baseClientFormsStatus,
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
    vi.mocked(useClientContext).mockReturnValue({
      ...baseContext,
      clientFormsStatus: { ...baseClientFormsStatus, clientDob: undefined, clientName: "Jane Doe" },
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
    vi.mocked(useClientContext).mockReturnValue({
      ...baseContext,
      clientFormsStatus: { ...baseClientFormsStatus, clientName: undefined },
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
    const smiScoresMock: Record<string, string | null> = { Q1: "5", Q2: "3" };
    vi.mocked(useClientContext).mockReturnValue({
      ...baseContext,
      clientFormsStatus: {
        ...baseClientFormsStatus,
        scores: { ...baseClientFormsStatus.scores, smi: smiScoresMock },
      },
    });
    render(<FormResultsSummary />);
    expect(smiTableProps.smiScores).toEqual(smiScoresMock);
  });

  test("defaults smiScores to empty object if clientFormsStatus is null", () => {
    vi.mocked(useClientContext).mockReturnValue({
      ...baseContext,
      clientFormsStatus: null,
    });
    render(<FormResultsSummary />);
    expect(smiTableProps.smiScores).toEqual({});
  });

  test("right-click on header undoes grayout if already grayed out", () => {
    const { getByTestId } = render(<FormResultsSummary />);
    const rawHeader = getByTestId("raw-header");

    fireEvent.click(rawHeader);
    expect(ysqTableProps.hiddenColumn).toBe("raw");

    fireEvent.contextMenu(rawHeader);
    expect(ysqTableProps.hiddenColumn).toBe(null);
  });

  test("opens and closes SMIModal", () => {
    const { getByTestId, getByText } = render(<FormResultsSummary />);
    fireEvent.click(getByTestId("smi-table"));
    expect(getByTestId("smi-modal")).toBeInTheDocument();
    fireEvent.click(getByText("Close"));
    expect(() => getByTestId("smi-modal")).toThrow();
  });
});
