import { render } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import ScoreCard from "./BecksBurnsScoreCard";

describe("ScoreCard component", () => {
  test("renders title and value", () => {
    const { getByText } = render(<ScoreCard title="YSQ" value="42" />);
    expect(getByText("YSQ")).toBeTruthy();
    expect(getByText("42")).toBeTruthy();
  });

  test("renders submittedAt date if provided", () => {
    const dateStr = "2025-08-31T12:34:56Z";
    const { getByText } = render(
      <ScoreCard title="YSQ" value="42" submittedAt={dateStr} />
    );

    const formattedDate = new Date(dateStr).toLocaleDateString();
    expect(getByText(`(${formattedDate})`)).toBeTruthy();
  });

  test("applies highlight styles when highlight is true", () => {
    const { container } = render(
      <ScoreCard title="YSQ" value="42" highlight={true} />
    );

    const cardDiv = container.querySelector(".score-card");
    expect(cardDiv).toHaveClass("bg-yellow-200");
    expect(cardDiv).toHaveClass("border-yellow-400");
  });

  test("does not apply highlight styles when highlight is false", () => {
    const { container } = render(
      <ScoreCard title="YSQ" value="42" highlight={false} />
    );

    const cardDiv = container.querySelector(".score-card");
    expect(cardDiv).toHaveClass("border-gray-300");
    expect(cardDiv).not.toHaveClass("bg-yellow-200");
  });

  test("highlight defaults to false if not provided", () => {
    const { container } = render(<ScoreCard title="YSQ" value="42" />);
    const cardDiv = container.querySelector(".score-card");
    expect(cardDiv).toHaveClass("border-gray-300");
    expect(cardDiv).not.toHaveClass("bg-yellow-200");
  });
});
