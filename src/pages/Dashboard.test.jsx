import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor, act } from "@testing-library/react";
import Dashboard from "./Dashboard";
import { useClientContext } from "../context/ClientContext";
import { fetchClientStatus } from "../api/clientsFrontend";
import { sendFormToken, sendMultipleFormTokens } from "../api/formsFrontend";
import validateEmail from "../utils/validators";
import normalizeEmail from "../utils/normalizeEmail";

vi.mock("../context/ClientContext");
vi.mock("../api/clientsFrontend");
vi.mock("../api/formsFrontend");
vi.mock("../utils/validators");
vi.mock("../utils/normalizeEmail");
vi.mock("../utils/truncateEmail", () => ({ default: (e) => e }));

vi.mock("react-router-dom", async (orig) => {
  const actual = await orig();
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock("../components/ProtectedAccess", () => ({
  default: ({ children }) => <>{children}</>,
}));
vi.mock("../components/EmailInput", () => ({
  default: () => <div data-testid="email-input" />,
}));
vi.mock("../components/EmailSearchControls", () => ({
  default: ({ onCheck }) => (
    <button data-testid="check-btn" onClick={onCheck}>Check</button>
  ),
}));
vi.mock("../components/ClientActions", () => ({
  default: () => <div data-testid="client-actions" />,
}));
vi.mock("../components/ui/Button", () => ({
  default: ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));
vi.mock("../components/FormButtons", () => ({
  default: ({ onSend, onSendAll }) => (
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
  clientDob: null,
  inactive: false,
  formsCompleted: 0,
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
    useClientContext.mockReturnValue({
      email: null,
      setEmail: vi.fn(),
      clientFormsStatus: null,
      setClientFormsStatus: vi.fn(),
    });
    normalizeEmail.mockImplementation((e) => e?.toLowerCase().trim() ?? "");
    validateEmail.mockReturnValue(true);
  });

  const renderWithConfirmedEmail = async () => {
    useClientContext.mockReturnValue({
      email: "test@example.com",
      setEmail: vi.fn(),
      clientFormsStatus: null,
      setClientFormsStatus: vi.fn(),
    });
    fetchClientStatus.mockResolvedValue({ ok: true, data: mockClientFormsStatus });

    const result = render(<Dashboard />);
    await waitFor(() => expect(fetchClientStatus).toHaveBeenCalled());
    return result;
  };

  test("handleSendAllForms does nothing if confirmedEmail is not set", () => {
    render(<Dashboard />);

    fireEvent.click(document.querySelector('[data-testid="send-all"]'));

    expect(sendMultipleFormTokens).not.toHaveBeenCalled();
  });

  test("handleSendForm does nothing if form action already loading for that type", async () => {
    const { getByTestId } = await renderWithConfirmedEmail();

    let resolveFirst;
    sendFormToken.mockImplementation(
      () => new Promise((resolve) => { resolveFirst = resolve; })
    );

    await act(async () => {
      fireEvent.click(getByTestId("send-ysq"));
    });

    fireEvent.click(getByTestId("send-ysq"));

    expect(sendFormToken).toHaveBeenCalledTimes(1);

    resolveFirst({ ok: true, data: {} });
  });
});
