import { render } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import YSQInstructions from "./YSQInstructions";

describe("YSQInstructions", () => {
  test("renders instructions text", () => {
    const { getByText } = render(<YSQInstructions />);

    expect(getByText("INSTRUCTIONS:")).toBeInTheDocument();
    expect(
      getByText(
        /Listed below are statements that you might use to describe yourself/i
      )
    ).toBeInTheDocument();
    expect(getByText("Rating Scale:")).toBeInTheDocument();
    expect(getByText("1 – Completely untrue of me")).toBeInTheDocument();
    expect(getByText("6 – Describes me perfectly")).toBeInTheDocument();
    expect(getByText("Example:")).toBeInTheDocument();
  });
});
