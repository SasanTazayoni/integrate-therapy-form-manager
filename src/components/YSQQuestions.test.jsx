import { render, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import YSQQuestions from "./YSQQuestions";

describe("YSQQuestions", () => {
  const item = {
    id: 1,
    prompt: "How often do you feel stressed?",
    category: "st",
  };

  test("renders question number, prompt, and category", () => {
    const { getByText } = render(
      <YSQQuestions item={item} value={undefined} onChange={() => {}} />
    );

    expect(getByText("1")).toBeInTheDocument();
    expect(getByText(item.prompt)).toBeInTheDocument();
    expect(getByText(item.category)).toBeInTheDocument();
  });

  test("renders the input with correct value", () => {
    const { getByRole } = render(
      <YSQQuestions item={item} value={3} onChange={() => {}} />
    );
    const input = getByRole("spinbutton");
    expect(input.value).toBe("3");
  });

  test("calls onChange with number when valid input is entered", () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <YSQQuestions item={item} value={undefined} onChange={onChange} />
    );

    const input = getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "5" } });

    expect(onChange).toHaveBeenCalledWith(5);
  });

  test("calls onChange with undefined when input is cleared", () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <YSQQuestions item={item} value={3} onChange={onChange} />
    );

    const input = getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "" } });

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  test("does not call onChange for invalid numbers outside 1-6", () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <YSQQuestions item={item} value={3} onChange={onChange} />
    );

    const input = getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "10" } });
    fireEvent.change(input, { target: { value: "0" } });
    fireEvent.change(input, { target: { value: "-2" } });

    expect(onChange).not.toHaveBeenCalled();
  });

  test("applies error class when showError is true", () => {
    const { getByRole } = render(
      <YSQQuestions item={item} value={3} onChange={() => {}} showError />
    );

    const input = getByRole("spinbutton");
    expect(input.classList.contains("error")).toBe(true);
  });

  test("calls select on input focus", () => {
    const { getByRole } = render(
      <YSQQuestions item={item} value={3} onChange={() => {}} />
    );
    const input = getByRole("spinbutton");

    input.select = vi.fn();

    fireEvent.focus(input);

    expect(input.select).toHaveBeenCalled();
  });
});
