import { render, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import FormButtonGroup from "./FormButtonGroup";

const mockSend = vi.fn();
const mockRevoke = vi.fn();

describe("FormButtonGroup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders send and revoke buttons with correct labels", () => {
    const { getByTestId, getByText } = render(
      <FormButtonGroup
        sendDisabled={false}
        revokeDisabled={false}
        onSend={mockSend}
        onRevoke={mockRevoke}
        sendLabel="Custom Send"
        sendTestId="send-btn"
        revokeTestId="revoke-btn"
      />
    );

    expect(getByTestId("send-btn")).toBeInTheDocument();
    expect(getByTestId("revoke-btn")).toBeInTheDocument();
    expect(getByText("Custom Send")).toBeInTheDocument();
    expect(getByText("Revoke")).toBeInTheDocument();
  });

  test("sendLabel defaults to 'Send' if not provided", () => {
    const { getByText } = render(
      <FormButtonGroup
        sendDisabled={false}
        revokeDisabled={false}
        onSend={mockSend}
        onRevoke={mockRevoke}
      />
    );

    expect(getByText("Send")).toBeInTheDocument();
    expect(getByText("Revoke")).toBeInTheDocument();
  });

  test("calls onSend and onRevoke when buttons clicked", () => {
    const { getByTestId } = render(
      <FormButtonGroup
        sendDisabled={false}
        revokeDisabled={false}
        onSend={mockSend}
        onRevoke={mockRevoke}
        sendTestId="send-btn"
        revokeTestId="revoke-btn"
      />
    );

    fireEvent.click(getByTestId("send-btn"));
    fireEvent.click(getByTestId("revoke-btn"));
    expect(mockSend).toHaveBeenCalled();
    expect(mockRevoke).toHaveBeenCalled();
  });

  test("disabled buttons do not call handlers", () => {
    const { getByTestId } = render(
      <FormButtonGroup
        sendDisabled={true}
        revokeDisabled={true}
        onSend={mockSend}
        onRevoke={mockRevoke}
        sendTestId="send-btn"
        revokeTestId="revoke-btn"
      />
    );

    fireEvent.click(getByTestId("send-btn"));
    fireEvent.click(getByTestId("revoke-btn"));
    expect(mockSend).not.toHaveBeenCalled();
    expect(mockRevoke).not.toHaveBeenCalled();
  });

  test("loading props are passed correctly", () => {
    const { getByTestId } = render(
      <FormButtonGroup
        sendDisabled={false}
        revokeDisabled={false}
        onSend={mockSend}
        onRevoke={mockRevoke}
        sendTestId="send-btn"
        revokeTestId="revoke-btn"
        loadingSend={true}
        loadingRevoke={true}
      />
    );

    const sendButton = getByTestId("send-btn");
    const revokeButton = getByTestId("revoke-btn");
    expect(sendButton).toBeInTheDocument();
    expect(revokeButton).toBeInTheDocument();
  });
});
