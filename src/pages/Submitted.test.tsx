import { render } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import SubmittedPage from "./Submitted";

describe("SubmittedPage", () => {
  test("renders the thank you heading", () => {
    const { getByText } = render(<SubmittedPage />);
    expect(getByText("Thank you!")).toBeInTheDocument();
  });

  test("renders the success message paragraph", () => {
    const { getByText } = render(<SubmittedPage />);
    expect(
      getByText("Your form has been successfully submitted.")
    ).toBeInTheDocument();
  });

  test("renders the informational text paragraph", () => {
    const { getByText } = render(<SubmittedPage />);
    expect(
      getByText("You may now safely close this tab or browser window.")
    ).toBeInTheDocument();
  });

  test("renders the modal container", () => {
    const { container } = render(<SubmittedPage />);
    const modal = container.querySelector(".modal");
    expect(modal).toBeInTheDocument();
  });

  test("renders the outer container with correct classes", () => {
    const { container } = render(<SubmittedPage />);
    const outerDiv = container.firstChild;
    expect(outerDiv).toHaveClass(
      "min-h-screen flex items-center justify-center bg-gray-100"
    );
  });
});
