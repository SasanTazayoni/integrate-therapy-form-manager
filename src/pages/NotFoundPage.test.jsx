import { describe, test, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import NotFoundPage from "./NotFoundPage";

vi.mock("../components/modals/NotFoundModal", () => ({
  default: () => <div data-testid="not-found-modal">Mock NotFoundModal</div>,
}));

describe("NotFoundPage", () => {
  test("renders without crashing", () => {
    const { getByTestId } = render(<NotFoundPage />);
    expect(getByTestId("not-found-modal")).toBeInTheDocument();
  });

  test("renders hidden 404 heading for accessibility", () => {
    const { getByRole } = render(<NotFoundPage />);
    const heading = getByRole("heading", { level: 1, name: "404" });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass("sr-only");
  });

  test("renders the NotFoundModal", () => {
    const { getByTestId, getByText } = render(<NotFoundPage />);
    expect(getByTestId("not-found-modal")).toBeInTheDocument();
    expect(getByText(/Mock NotFoundModal/i)).toBeInTheDocument();
  });
});
