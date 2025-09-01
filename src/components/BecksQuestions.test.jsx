import { render, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import BecksQuestions from "./BecksQuestions";

const mockItem = {
  id: 1,
  prompt: "How do you feel today?",
  options: [
    { value: 1, text: "Bad" },
    { value: 2, text: "Okay" },
    { value: 3, text: "Good" },
  ],
};

describe("BecksQuestions", () => {
  test("renders question prompt", () => {
    const { getByText } = render(
      <BecksQuestions
        item={mockItem}
        answers={{}}
        handleChange={() => {}}
        missingIds={[]}
      />
    );

    expect(getByText(mockItem.prompt)).toBeInTheDocument();
  });

  test("renders all options with correct labels and values", () => {
    const { getByLabelText } = render(
      <BecksQuestions
        item={mockItem}
        answers={{}}
        handleChange={() => {}}
        missingIds={[]}
      />
    );

    mockItem.options.forEach((opt) => {
      const input = getByLabelText(new RegExp(opt.text, "i"));
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("value", opt.value.toString());
      expect(input).toHaveAttribute("type", "radio");
    });
  });

  test("applies 'missing' class when item id is in missingIds", () => {
    const { container } = render(
      <BecksQuestions
        item={mockItem}
        answers={{}}
        handleChange={() => {}}
        missingIds={[mockItem.id]}
      />
    );

    const fieldset = container.querySelector("fieldset");
    expect(fieldset).toHaveClass("missing");
  });

  test("marks the selected option correctly", () => {
    const answers = { [mockItem.id]: 2 };
    const { getByLabelText } = render(
      <BecksQuestions
        item={mockItem}
        answers={answers}
        handleChange={() => {}}
        missingIds={[]}
      />
    );

    const selectedInput = getByLabelText(/Okay/i);
    expect(selectedInput.checked).toBe(true);
  });

  test("calls handleChange with correct value on option change", () => {
    const handleChange = vi.fn();
    const { getByLabelText } = render(
      <BecksQuestions
        item={mockItem}
        answers={{}}
        handleChange={handleChange}
        missingIds={[]}
      />
    );

    const optionInput = getByLabelText(/Good/i);
    fireEvent.click(optionInput);

    expect(handleChange).toHaveBeenCalledWith(mockItem.id, 3);
  });

  test("clears selection on right-click if option is selected", () => {
    const handleChange = vi.fn();
    const answers = { [mockItem.id]: 2 };
    const { getByLabelText } = render(
      <BecksQuestions
        item={mockItem}
        answers={answers}
        handleChange={handleChange}
        missingIds={[]}
      />
    );

    const optionDiv = getByLabelText(/Okay/i).closest(".option");
    fireEvent.contextMenu(optionDiv);

    expect(handleChange).toHaveBeenCalledWith(mockItem.id, undefined);
  });

  test("does not clear selection on right-click if option is not selected", () => {
    const handleChange = vi.fn();
    const answers = { [mockItem.id]: 1 };
    const { getByLabelText } = render(
      <BecksQuestions
        item={mockItem}
        answers={answers}
        handleChange={handleChange}
        missingIds={[]}
      />
    );

    const optionDiv = getByLabelText(/Good/i).closest(".option");
    fireEvent.contextMenu(optionDiv);

    expect(handleChange).not.toHaveBeenCalled();
  });
});
