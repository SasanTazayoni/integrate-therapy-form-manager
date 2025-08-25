import { describe, test, expect } from "vitest";
import getBurnsScoreCategory from "../utils/burnsScoreUtils";

describe("getBurnsScoreCategory", () => {
  test("should return 'Minimal or no anxiety' for scores <= 4", () => {
    expect(getBurnsScoreCategory(0)).toBe("Minimal or no anxiety");
    expect(getBurnsScoreCategory(4)).toBe("Minimal or no anxiety");
  });

  test("should return 'Borderline anxiety' for scores 5-10", () => {
    expect(getBurnsScoreCategory(5)).toBe("Borderline anxiety");
    expect(getBurnsScoreCategory(10)).toBe("Borderline anxiety");
  });

  test("should return 'Mild anxiety' for scores 11-20", () => {
    expect(getBurnsScoreCategory(11)).toBe("Mild anxiety");
    expect(getBurnsScoreCategory(20)).toBe("Mild anxiety");
  });

  test("should return 'Moderate anxiety' for scores 21-30", () => {
    expect(getBurnsScoreCategory(21)).toBe("Moderate anxiety");
    expect(getBurnsScoreCategory(30)).toBe("Moderate anxiety");
  });

  test("should return 'Severe anxiety' for scores 31-50", () => {
    expect(getBurnsScoreCategory(31)).toBe("Severe anxiety");
    expect(getBurnsScoreCategory(50)).toBe("Severe anxiety");
  });

  test("should return 'Extreme anxiety or panic' for scores > 50", () => {
    expect(getBurnsScoreCategory(51)).toBe("Extreme anxiety or panic");
    expect(getBurnsScoreCategory(100)).toBe("Extreme anxiety or panic");
  });
});
