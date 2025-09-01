import { render, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import BurnsQuestions from "./BurnsQuestions";

const sampleItem = {
  id: "q1",
  category: "burns",
  text: "How often do you feel anxious?",
  options: [
    { value: 0, text: "Never" },
    { value: 1, text: "Sometimes" },
    { value: 2, text: "Often" },
    { value: 3, text: "Always" },
  ],
};

describe("BurnsQuestions", () => {
  test("renders question text and options", () => {
    const { getByText, getByLabelText } = render(
      <BurnsQuestions
        item={sampleItem}
        answers={{}}
        handleChange={vi.fn()}
        missingIds={[]}
      />
    );

    expect(getByText("q1: How often do you feel anxious?")).toBeInTheDocument();
    sampleItem.options.forEach((opt) => {
      expect(
        getByLabelText(`${opt.value}${opt.text}`) || getByText(opt.text)
      ).toBeInTheDocument();
    });
  });

  test("applies 'missing' class when question id is in missingIds", () => {
    const { container } = render(
      <BurnsQuestions
        item={sampleItem}
        answers={{}}
        handleChange={vi.fn()}
        missingIds={["q1"]}
      />
    );
    const fieldset = container.querySelector("fieldset");
    expect(fieldset).toHaveClass("missing");
  });

  test("checks the selected option based on answers", () => {
    const { getByLabelText } = render(
      <BurnsQuestions
        item={sampleItem}
        answers={{ q1: 2 }}
        handleChange={vi.fn()}
        missingIds={[]}
      />
    );

    const selectedInput = getByLabelText("2Often");
    expect(selectedInput).toBeChecked();
  });

  test("calls handleChange on option change", () => {
    const handleChange = vi.fn();
    const { getByLabelText } = render(
      <BurnsQuestions
        item={sampleItem}
        answers={{}}
        handleChange={handleChange}
        missingIds={[]}
      />
    );

    const input = getByLabelText("1Sometimes");
    fireEvent.click(input);

    expect(handleChange).toHaveBeenCalledWith("q1", 1);
  });

  test("clears selected option on right-click if already selected", () => {
    const handleChange = vi.fn();
    const { getByLabelText } = render(
      <BurnsQuestions
        item={sampleItem}
        answers={{ q1: 3 }}
        handleChange={handleChange}
        missingIds={[]}
      />
    );

    const selectedInput = getByLabelText("3Always");
    fireEvent.contextMenu(selectedInput.parentElement);

    expect(handleChange).toHaveBeenCalledWith("q1", undefined);
  });

  test("does not call handleChange on right-click if option not selected", () => {
    const handleChange = vi.fn();
    const { getByLabelText } = render(
      <BurnsQuestions
        item={sampleItem}
        answers={{ q1: 2 }}
        handleChange={handleChange}
        missingIds={[]}
      />
    );

    const input = getByLabelText("1Sometimes");
    fireEvent.contextMenu(input.parentElement);

    expect(handleChange).not.toHaveBeenCalled();
  });
});
