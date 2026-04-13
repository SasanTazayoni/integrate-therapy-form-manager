import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor, act } from "@testing-library/react";
import React from "react";
import Dashboard from "./Dashboard";
import { useClientContext } from "../context/ClientContext";
import { fetchClientStatus } from "../api/clientsFrontend";
import { sendFormToken, sendMultipleFormTokens } from "../api/formsFrontend";
import validateEmail from "../utils/validators";
import { normalizeEmail } from "../utils/normalizeEmail";

vi.mock("../context/ClientContext");
vi.mock("../api/clientsFrontend");
vi.mock("../api/formsFrontend");
vi.mock("../utils/validators");
vi.mock("../utils/normalizeEmail");
vi.mock("../utils/truncateEmail", () => ({ default: (e: string) => e }));

vi.mock("react-router-dom", async (orig) => {
  const actual = await orig();
  return { ...(actual as object), useNavigate: () => vi.fn() };
});

vi.mock("../components/ProtectedAccess", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("../components/EmailInput", () => ({
  default: () => <div data-testid="email-input" />,
}));
vi.mock("../components/EmailSearchControls", () => ({
  default: ({ onCheck }: { onCheck: () => void }) => (
    <button data-testid="check-btn" onClick={onCheck}>Check</button>
  ),
}));
vi.mock("../components/ClientActions", () => ({
  default: () => <div data-testid="client-actions" />,
}));
vi.mock("../components/Button", () => ({
  default: ({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));
vi.mock("../components/FormButtons", () => ({
  default: ({ onSend, onSendAll }: { onSend: (type: string) => void; onSendAll: (types: string[]) => void }) => (
    <div>
      <button data-testid="send-ysq" onClick={() => onSend("YSQ")}>Send YSQ</button>
      <button data-testid="send-all" onClick={() => onSendAll(["YSQ", "SMI", "BECKS", "BURNS"])}>Send All</button>
    </div>
  ),
}));
vi.mock("../components/modals/RevokeConfirmModal", () => ({
  default: () => <div data-testid="revoke-modal" />,
}));

const mockClientFormsStatus = {
  clientExists: true,
  exists: true,
  clientName: "Alice",
  clientDob: undefined,
  inactive: false,
  formsCompleted: 0,
  clientStatus: "active" as const,
  forms: {
    YSQ: { submitted: false, activeToken: false },
    SMI: { submitted: false, activeToken: false },
    BECKS: { submitted: false, activeToken: false },
    BURNS: { submitted: false, activeToken: false },
  },
  scores: { bdi: null, bai: null, ysq: {}, ysq456: {}, smi: {} },
};

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useClientContext).mockReturnValue({
      email: "",
      setEmail: vi.fn(),
      clientFormsStatus: null,
      setClientFormsStatus: vi.fn(),
      successMessage: "",
      setSuccessMessage: vi.fn(),
      error: "",
      setError: vi.fn(),
    });
    vi.mocked(normalizeEmail).mockImplementation((e: string) => e?.toLowerCase().trim() ?? "");
    vi.mocked(validateEmail).mockReturnValue(true);
  });

  const renderWithConfirmedEmail = async () => {
    vi.mocked(useClientContext).mockReturnValue({
      email: "test@example.com",
      setEmail: vi.fn(),
      clientFormsStatus: null,
      setClientFormsStatus: vi.fn(),
      successMessage: "",
      setSuccessMessage: vi.fn(),
      error: "",
      setError: vi.fn(),
    });
    vi.mocked(fetchClientStatus).mockResolvedValue({ ok: true, data: mockClientFormsStatus });

    const result = render(<Dashboard />);
    await waitFor(() => expect(fetchClientStatus).toHaveBeenCalled());
    return result;
  };

  test("handleSendAllForms does nothing if confirmedEmail is not set", () => {
    render(<Dashboard />);

    fireEvent.click(document.querySelector('[data-testid="send-all"]')!);

    expect(sendMultipleFormTokens).not.toHaveBeenCalled();
  });

  test("handleSendForm does nothing if form action already loading for that type", async () => {
    const { getByTestId } = await renderWithConfirmedEmail();

    let resolveFirst: (value: { ok: true; data: Record<string, never> }) => void;
    vi.mocked(sendFormToken).mockImplementation(
      () => new Promise((resolve) => { resolveFirst = resolve; })
    );

    await act(async () => {
      fireEvent.click(getByTestId("send-ysq"));
    });

    fireEvent.click(getByTestId("send-ysq"));

    expect(sendFormToken).toHaveBeenCalledTimes(1);

    resolveFirst!({ ok: true, data: {} });
  });
});
