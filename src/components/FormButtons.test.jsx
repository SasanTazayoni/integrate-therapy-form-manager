import { render, fireEvent } from "@testing-library/react";
import { describe, test, beforeEach, vi, expect } from "vitest";
import FormButtons from "./FormButtons";
import { FORM_TYPES, FORM_TITLES } from "../constants/formTypes";

const mockOnSend = vi.fn();
const mockOnRevoke = vi.fn();
const mockOnSendAll = vi.fn();

const defaultProps = {
  clientFormsStatus: {
    exists: true,
    forms: {
      SMI: { activeToken: false, submitted: true },
      YSQ: { activeToken: false, submitted: false },
      BECKS: { activeToken: false, submitted: false },
      BURNS: { activeToken: false, submitted: false },
    },
  },
  onSend: mockOnSend,
  onRevoke: mockOnRevoke,
  onSendAll: mockOnSendAll,
  formActionLoading: { SMI: false, YSQ: false, BECKS: false, BURNS: false },
  clientInactive: false,
  searchLoading: false,
};

describe("FormButtons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders all form buttons with correct titles", () => {
    const { getByText } = render(<FormButtons {...defaultProps} />);
    Object.values(FORM_TITLES).forEach((title) => {
      expect(
        getByText((content) => content.includes(title))
      ).toBeInTheDocument();
    });
  });

  test("calls onSend and onRevoke when buttons clicked", () => {
    const { getByTestId } = render(<FormButtons {...defaultProps} />);

    FORM_TYPES.forEach((formType) => {
      const sendButton = getByTestId(`send-${formType}-button`);
      const revokeButton = getByTestId(`revoke-${formType}-button`);
      if (!sendButton.disabled) fireEvent.click(sendButton);
      if (!revokeButton.disabled) fireEvent.click(revokeButton);
    });

    expect(mockOnSend).toHaveBeenCalledWith("SMI");
    expect(mockOnSend).toHaveBeenCalledWith("YSQ");
    expect(mockOnSend).toHaveBeenCalledWith("BECKS");
    expect(mockOnSend).toHaveBeenCalledWith("BURNS");
    expect(mockOnRevoke).not.toHaveBeenCalled();
  });

  test("disables buttons when clientInactive is true", () => {
    const props = { ...defaultProps, clientInactive: true };
    const { getByTestId } = render(<FormButtons {...props} />);
    FORM_TYPES.forEach((formType) => {
      expect(getByTestId(`send-${formType}-button`)).toBeDisabled();
      expect(getByTestId(`revoke-${formType}-button`)).toBeDisabled();
    });
  });

  test("disables buttons when searchLoading is true", () => {
    const props = { ...defaultProps, searchLoading: true };
    const { getByTestId } = render(<FormButtons {...props} />);
    FORM_TYPES.forEach((formType) => {
      expect(getByTestId(`send-${formType}-button`)).toBeDisabled();
      expect(getByTestId(`revoke-${formType}-button`)).toBeDisabled();
    });
  });

  test("renders 'Send All' button", () => {
    const { getByText } = render(<FormButtons {...defaultProps} />);
    expect(getByText("Send all")).toBeInTheDocument();
  });

  test("'Send All' button disabled when clientInactive is true", () => {
    const props = { ...defaultProps, clientInactive: true };
    const { getByText } = render(<FormButtons {...props} />);
    expect(getByText("Send all")).toBeDisabled();
  });

  test("'Send All' button calls onSendAll with correct sendable forms", () => {
    const props = {
      ...defaultProps,
      clientFormsStatus: {
        exists: true,
        forms: {
          SMI: { activeToken: false, submitted: true },
          YSQ: { activeToken: false, submitted: true },
          BECKS: { activeToken: false, submitted: false },
          BURNS: { activeToken: false, submitted: false },
        },
      },
    };

    const { getByRole } = render(<FormButtons {...props} />);

    const sendAllButton = getByRole("button", { name: /send all/i });
    fireEvent.click(sendAllButton);

    expect(props.onSendAll).toHaveBeenCalledTimes(1);
    expect(props.onSendAll).toHaveBeenCalledWith(["SMI", "BECKS", "BURNS"]);
  });

  test("revoke buttons disabled when formActionLoading is true", () => {
    const props = {
      ...defaultProps,
      clientFormsStatus: {
        exists: true,
        forms: {
          SMI: { activeToken: true, submitted: true },
          YSQ: { activeToken: true, submitted: false },
          BECKS: { activeToken: false, submitted: false },
          BURNS: { activeToken: false, submitted: false },
        },
      },
      formActionLoading: { SMI: true, YSQ: false, BECKS: false, BURNS: false },
    };

    const { getByTestId } = render(<FormButtons {...props} />);

    expect(getByTestId("revoke-SMI-button")).toBeDisabled();
    expect(getByTestId("revoke-YSQ-button")).not.toBeDisabled();
  });

  test("send button enabled when status is undefined (fallback false)", () => {
    const props = {
      ...defaultProps,
      clientFormsStatus: {
        exists: true,
        forms: {
          SMI: undefined,
          YSQ: { activeToken: false, submitted: false },
          BECKS: { activeToken: false, submitted: false },
          BURNS: { activeToken: false, submitted: false },
        },
      },
    };

    const { getByTestId } = render(<FormButtons {...props} />);
    expect(getByTestId("send-SMI-button")).not.toBeDisabled();
  });

  test("handles clientFormsStatus being null (clientExists = false)", () => {
    const props = {
      clientFormsStatus: null,
      onSend: mockOnSend,
      onRevoke: mockOnRevoke,
      formActionLoading: { SMI: false, YSQ: false, BECKS: false, BURNS: false },
      clientInactive: false,
      searchLoading: false,
      onSendAll: vi.fn(),
    };

    const { getByText, getByTestId } = render(<FormButtons {...props} />);

    ["SMI", "YSQ", "BECKS", "BURNS"].forEach((formType) => {
      expect(getByTestId(`send-${formType}-button`)).toBeDisabled();
      expect(getByTestId(`revoke-${formType}-button`)).toBeDisabled();
    });

    expect(getByText("Send all")).toHaveAttribute("aria-disabled", "true");
  });

  test("calls onRevoke when a form has an active token", () => {
    const mockOnRevoke = vi.fn();
    const props = {
      clientFormsStatus: {
        exists: true,
        forms: {
          SMI: { activeToken: true, submitted: true },
          YSQ: { activeToken: false, submitted: false },
          BECKS: { activeToken: false, submitted: false },
          BURNS: { activeToken: false, submitted: false },
        },
      },
      onSend: vi.fn(),
      onRevoke: mockOnRevoke,
      formActionLoading: { SMI: false, YSQ: false, BECKS: false, BURNS: false },
      clientInactive: false,
      searchLoading: false,
    };

    const { getByTestId } = render(<FormButtons {...props} />);

    fireEvent.click(getByTestId("revoke-SMI-button"));

    expect(mockOnRevoke).toHaveBeenCalledTimes(1);
    expect(mockOnRevoke).toHaveBeenCalledWith("SMI");
  });
});
