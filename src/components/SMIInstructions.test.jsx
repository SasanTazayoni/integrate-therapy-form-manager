import { describe, test, expect } from "vitest";
import { render } from "@testing-library/react";
import SMIInstructions from "./SMIInstructions";

describe("SMIInstructions", () => {
  test("renders instruction text", () => {
    const { getByText } = render(<SMIInstructions />);
    expect(getByText("INSTRUCTIONS:")).toBeDefined();
    expect(
      getByText(
        /Listed below are statements that people might use to describe themselves/i
      )
    ).toBeDefined();
  });

  test("renders frequency heading and list", () => {
    const { getByText } = render(<SMIInstructions />);
    expect(getByText("FREQUENCY:")).toBeDefined();
    expect(getByText("1 = Never or Almost Never")).toBeDefined();
    expect(getByText("2 = Rarely")).toBeDefined();
    expect(getByText("3 = Occasionally")).toBeDefined();
    expect(getByText("4 = Frequently")).toBeDefined();
    expect(getByText("5 = Most of the time")).toBeDefined();
    expect(getByText("6 = All of the time")).toBeDefined();
  });
});
