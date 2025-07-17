import { render } from "@testing-library/react";
import Questionnaire from "./Questionnaire";
import { describe, expect, test } from "vitest";

describe("YSQ Questionnaire", () => {
  test("renders the questionnaire container", () => {
    const { getByTestId } = render(<Questionnaire />);
    expect(getByTestId("ysq-questionnaire")).toBeInTheDocument();
  });
});
