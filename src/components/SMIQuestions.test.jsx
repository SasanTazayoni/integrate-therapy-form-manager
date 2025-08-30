import { describe, test, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import SMIQuestion from "./SMIQuestions";

describe("SMIQuestions", () => {
  const item = { id: 1, prompt: "Sample question?" };

  test("renders question number and prompt", () => {
    const { getByText, getByTestId } = render(
      <SMIQuestion item={item} value={undefined} onChange={vi.fn()} />
    );

    expect(getByText(item.id)).toBeDefined();
    expect(getByText(item.prompt)).toBeDefined();
    expect(getByTestId("input-1")).toBeDefined();
  });

  test("renders initial value", () => {
    const { getByTestId } = render(
      <SMIQuestion item={item} value={3} onChange={vi.fn()} />
    );
    expect(getByTestId("input-1").value).toBe("3");
  });

  test("calls onChange with valid number", () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <SMIQuestion item={item} value={undefined} onChange={onChange} />
    );

    const input = getByTestId("input-1");
    fireEvent.change(input, { target: { value: "4" } });
    expect(onChange).toHaveBeenCalledWith(4);
    fireEvent.change(input, { target: { value: "10" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test("calls onChange with undefined when input cleared", () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <SMIQuestion item={item} value={2} onChange={onChange} />
    );

    const input = getByTestId("input-1");
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  test("applies error class when showError is true", () => {
    const { getByTestId } = render(
      <SMIQuestion item={item} value={1} onChange={vi.fn()} showError={true} />
    );

    const input = getByTestId("input-1");
    expect(input.className).toContain("error");
  });

  test("selects input content on focus", () => {
    const { getByTestId } = render(
      <SMIQuestion item={item} value={3} onChange={vi.fn()} />
    );

    const input = getByTestId("input-1");
    input.select = vi.fn();
    fireEvent.focus(input);
    expect(input.select).toHaveBeenCalled();
  });
});
