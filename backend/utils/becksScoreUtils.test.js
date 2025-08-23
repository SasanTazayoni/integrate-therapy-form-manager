import getBecksScoreCategory from "./becksScoreUtils";
import { describe, test, expect } from "vitest";

describe("getBecksScoreCategory", () => {
  test("returns 'Normal' for score <= 10", () => {
    expect(getBecksScoreCategory(0)).toBe("Normal");
    expect(getBecksScoreCategory(10)).toBe("Normal");
  });

  test("returns 'Mild mood disturbance' for score 11-16", () => {
    expect(getBecksScoreCategory(11)).toBe("Mild mood disturbance");
    expect(getBecksScoreCategory(16)).toBe("Mild mood disturbance");
  });

  test("returns 'Borderline clinical depression' for score 17-20", () => {
    expect(getBecksScoreCategory(17)).toBe("Borderline clinical depression");
    expect(getBecksScoreCategory(20)).toBe("Borderline clinical depression");
  });

  test("returns 'Moderate depression' for score 21-30", () => {
    expect(getBecksScoreCategory(21)).toBe("Moderate depression");
    expect(getBecksScoreCategory(30)).toBe("Moderate depression");
  });

  test("returns 'Severe depression' for score 31-40", () => {
    expect(getBecksScoreCategory(31)).toBe("Severe depression");
    expect(getBecksScoreCategory(40)).toBe("Severe depression");
  });

  test("returns 'Extreme depression' for score > 40", () => {
    expect(getBecksScoreCategory(41)).toBe("Extreme depression");
    expect(getBecksScoreCategory(100)).toBe("Extreme depression");
  });
});
