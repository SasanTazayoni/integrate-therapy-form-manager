import { render, fireEvent } from "@testing-library/react";
import { describe, test, beforeEach, vi, expect } from "vitest";
import FormButtons from "./FormButtons";
import { FORM_TYPES, FORM_TITLES } from "../constants/formTypes";

const mockOnSend = vi.fn();
const mockOnRevoke = vi.fn();

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
});
