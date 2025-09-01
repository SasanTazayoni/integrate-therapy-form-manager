import { render, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import FormActionButton from "./FormActionButton";

const mockClick = vi.fn();

describe("FormActionButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders button with given label", () => {
    const { getByTestId } = render(
      <FormActionButton
        label="Submit"
        disabled={false}
        onClick={mockClick}
        testId="btn"
      />
    );
    const button = getByTestId("btn");
    expect(button).toBeInTheDocument();
  });

  test("button calls onClick when clicked", () => {
    const { getByTestId } = render(
      <FormActionButton
        label="Submit"
        disabled={false}
        onClick={mockClick}
        testId="btn"
      />
    );
    fireEvent.click(getByTestId("btn"));
    expect(mockClick).toHaveBeenCalled();
  });

  test("button is disabled when disabled prop is true", () => {
    const { getByTestId } = render(
      <FormActionButton
        label="Submit"
        disabled={true}
        onClick={mockClick}
        testId="btn"
      />
    );
    const button = getByTestId("btn");
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(mockClick).not.toHaveBeenCalled();
  });

  test("button is disabled when loading is true", () => {
    const { getByTestId } = render(
      <FormActionButton
        label="Submit"
        disabled={false}
        loading={true}
        onClick={mockClick}
        testId="btn"
      />
    );
    const button = getByTestId("btn");
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(mockClick).not.toHaveBeenCalled();
  });

  test("testId is applied correctly", () => {
    const { getByTestId } = render(
      <FormActionButton
        label="Submit"
        disabled={false}
        onClick={mockClick}
        testId="btn"
      />
    );
    expect(getByTestId("btn")).toBeInTheDocument();
  });
});
