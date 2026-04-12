import { render, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import EmailSearchControls from "./EmailSearchControls";

describe("EmailSearchControls", () => {
  const onCheckMock = vi.fn();
  const onClearMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders Search and Clear buttons", () => {
    const { getByTestId } = render(
      <EmailSearchControls
        onCheck={onCheckMock}
        onClear={onClearMock}
        loading={false}
      />
    );

    const checkButton = getByTestId("check-button");
    const clearButton = getByTestId("clear-button");

    expect(checkButton).toBeInTheDocument();
    expect(clearButton).toBeInTheDocument();
    expect(checkButton).not.toBeDisabled();
    expect(clearButton).not.toBeDisabled();
  });

  test("calls onCheck when Search button is clicked", () => {
    const { getByTestId } = render(
      <EmailSearchControls
        onCheck={onCheckMock}
        onClear={onClearMock}
        loading={false}
      />
    );

    fireEvent.click(getByTestId("check-button"));
    expect(onCheckMock).toHaveBeenCalledTimes(1);
  });

  test("calls onClear when Clear button is clicked", () => {
    const { getByTestId } = render(
      <EmailSearchControls
        onCheck={onCheckMock}
        onClear={onClearMock}
        loading={false}
      />
    );

    fireEvent.click(getByTestId("clear-button"));
    expect(onClearMock).toHaveBeenCalledTimes(1);
  });

  test("disables both buttons when loading is true", () => {
    const { getByTestId } = render(
      <EmailSearchControls
        onCheck={onCheckMock}
        onClear={onClearMock}
        loading={true}
      />
    );

    expect(getByTestId("check-button")).toBeDisabled();
    expect(getByTestId("clear-button")).toBeDisabled();
  });
});
