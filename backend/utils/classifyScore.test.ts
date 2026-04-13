import { describe, test, expect } from "vitest";
import { classifyScore } from "./classifyScore";
import { smiBoundaries } from "../data/SMIBoundariesBackend";

describe("classifyScore", () => {
  test("returns correct label for ascending scale (smi_vc_score)", () => {
    const boundaries = smiBoundaries.smi_vc_score;

    expect(classifyScore(1, boundaries)).toBe("Very Low");
    expect(classifyScore(1.48, boundaries)).toBe("Average");
    expect(classifyScore(2.5, boundaries)).toBe("Moderate");
    expect(classifyScore(4.5, boundaries)).toBe("Very High");
    expect(classifyScore(6, boundaries)).toBe("Severe");
  });

  test("returns correct label for reversed scale (smi_cc_score)", () => {
    const boundaries = smiBoundaries.smi_cc_score;

    expect(classifyScore(6, boundaries)).toBe("Very Low");
    expect(classifyScore(4.5, boundaries)).toBe("Moderate");
    expect(classifyScore(1, boundaries)).toBe("Severe");
  });

  test("returns the label of the closest boundary", () => {
    expect(classifyScore(9, [0, 10, 20])).toBe("Average");
  });

  test("returns first label when score matches first boundary exactly", () => {
    expect(classifyScore(0, [0, 10, 20])).toBe("Very Low");
  });

  test("returns last label when score matches last boundary exactly", () => {
    expect(classifyScore(20, [0, 10, 20])).toBe("Moderate");
  });
});
