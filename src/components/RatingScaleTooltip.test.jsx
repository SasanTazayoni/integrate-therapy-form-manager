import { describe, test, vi, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import RatingScaleTooltip from "./RatingScaleToolTip";

vi.mock("lucide-react", () => ({
  Info: () => <svg data-testid="icon-info" />,
  X: () => <svg data-testid="icon-x" />,
}));

describe("RatingScaleTooltip", () => {
  const title = "Test Scale";
  const items = ["1 = Low", "2 = Medium", "3 = High"];

  test("renders the button with correct aria-label", () => {
    const { getByLabelText } = render(
      <RatingScaleTooltip title={title} items={items} />
    );

    const button = getByLabelText(`Show ${title}`);
    expect(button).toBeInTheDocument();
  });

  test("tooltip is hidden by default", () => {
    const { queryByText } = render(
      <RatingScaleTooltip title={title} items={items} />
    );

    expect(queryByText(title)).not.toBeInTheDocument();
    items.forEach((item) => {
      expect(queryByText(item)).not.toBeInTheDocument();
    });
  });

  test("clicking the button opens the tooltip", () => {
    const { getByLabelText, getByText } = render(
      <RatingScaleTooltip title={title} items={items} />
    );

    const button = getByLabelText(`Show ${title}`);
    fireEvent.click(button);
    expect(getByText(title)).toBeInTheDocument();
    items.forEach((item) => {
      expect(getByText(item)).toBeInTheDocument();
    });
  });

  test("clicking the close button closes the tooltip", () => {
    const { getByLabelText, queryByText, getByText } = render(
      <RatingScaleTooltip title={title} items={items} />
    );

    fireEvent.click(getByLabelText(`Show ${title}`));
    expect(getByText(title)).toBeInTheDocument();
    const closeButton = getByLabelText("Close");
    fireEvent.click(closeButton);
    expect(queryByText(title)).not.toBeInTheDocument();
    items.forEach((item) => {
      expect(queryByText(item)).not.toBeInTheDocument();
    });
  });

  test("clicking the toggle button twice opens and closes the tooltip", () => {
    const { getByLabelText, queryByText } = render(
      <RatingScaleTooltip title={title} items={items} />
    );

    const button = getByLabelText(`Show ${title}`);
    fireEvent.click(button);
    expect(queryByText(title)).toBeInTheDocument();
    fireEvent.click(button);
    expect(queryByText(title)).not.toBeInTheDocument();
  });

  test("clicking outside closes the tooltip", () => {
    const { getByLabelText, queryByText, container } = render(
      <>
        <div data-testid="outside">Outside element</div>
        <RatingScaleTooltip title={title} items={items} />
      </>
    );

    const button = getByLabelText(`Show ${title}`);
    fireEvent.click(button);
    expect(queryByText(title)).toBeInTheDocument();
    const outside = container.querySelector('[data-testid="outside"]');
    fireEvent.mouseDown(outside);
    expect(queryByText(title)).not.toBeInTheDocument();
  });
});
