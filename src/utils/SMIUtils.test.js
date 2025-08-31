import { describe, test, expect } from "vitest";
import { classifyScore, classifyBoundaryAndAlignment } from "./SMIUtils";
import { smiBoundaries, labels } from "../data/SMIBoundaries";

describe("classifyScore", () => {
  test("returns the label of the closest boundary", () => {
    const boundaries = [0, 10, 20];
    expect(classifyScore(9, boundaries)).toBe(labels[1]);
  });

  test("returns the first label if score matches exactly the first boundary", () => {
    const boundaries = [0, 10, 20];
    expect(classifyScore(0, boundaries)).toBe(labels[0]);
  });

  test("returns the last label if score matches exactly the last boundary", () => {
    const boundaries = [0, 10, 20];
    expect(classifyScore(20, boundaries)).toBe(labels[2]);
  });
});

describe("classifyBoundaryAndAlignment", () => {
  test("returns nulls when scoreStr is null", () => {
    expect(classifyBoundaryAndAlignment(null, "someKey")).toEqual({
      column: null,
      alignment: null,
    });
  });

  test("returns nulls when categoryKey is missing", () => {
    expect(classifyBoundaryAndAlignment("10-20")).toEqual({
      column: null,
      alignment: null,
    });
  });

  test("returns nulls when score is NaN", () => {
    expect(classifyBoundaryAndAlignment("abc", "someKey")).toEqual({
      column: null,
      alignment: null,
    });
  });

  test("returns nulls when categoryKey not in smiBoundaries", () => {
    expect(classifyBoundaryAndAlignment("10", "notAKey")).toEqual({
      column: null,
      alignment: null,
    });
  });

  test("classifies a score inside a boundary range (ascending boundaries)", () => {
    const categoryKey = Object.keys(smiBoundaries)[0];
    const boundaries = smiBoundaries[categoryKey];
    const lo = Math.min(boundaries[0], boundaries[1]);
    const hi = Math.max(boundaries[0], boundaries[1]);
    const mid = (lo + hi) / 2;

    const resultMid = classifyBoundaryAndAlignment(`${mid}`, categoryKey);
    expect(resultMid.alignment).toBe("center");

    const resultLeft = classifyBoundaryAndAlignment(`${lo}`, categoryKey);
    expect(resultLeft.alignment).toBe("left");

    const resultRight = classifyBoundaryAndAlignment(`${hi}`, categoryKey);
    expect(resultRight.alignment).toBe("right");
  });

  test("returns null if score not in any boundary range", () => {
    const categoryKey = Object.keys(smiBoundaries)[0];
    const boundaries = smiBoundaries[categoryKey];
    const score = Math.max(...boundaries) + 100;
    expect(classifyBoundaryAndAlignment(`${score}`, categoryKey)).toEqual({
      column: null,
      alignment: null,
    });
  });

  test("works for descending boundaries", () => {
    const categoryKey = Object.keys(smiBoundaries)[0];
    const boundaries = [100, 50, 0];
    smiBoundaries[categoryKey] = boundaries;

    const result = classifyBoundaryAndAlignment("75", categoryKey);
    expect(result.column).toBe("Very Low - Average");
    expect(["left", "center", "right"]).toContain(result.alignment);
  });
});
