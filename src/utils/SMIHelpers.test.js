import { describe, test, expect, vi } from "vitest";
import { getCellData, computeSMIScores, shouldHighlight } from "./SMIHelpers";
import { categoryKeyMap, smiBoundaries } from "../data/SMIBoundaries";

describe("SMIHelpers", () => {
  const smiScores = { smi_vc_score: "3.5" };

  test("getCellData returns parsed score + rating + display", () => {
    const result = getCellData("Vulnerable Child", smiScores);
    expect(result).toEqual({
      score: 3.5,
      rating: expect.any(String),
      display: expect.stringContaining("3.5"),
    });
  });

  test("getCellData returns null for invalid mode", () => {
    expect(getCellData("NotARealMode", smiScores)).toBeNull();
  });

  test("computeSMIScores computes averages and classifies", () => {
    const items = [
      { id: "q1", category: "Vulnerable Child" },
      { id: "q2", category: "Vulnerable Child" },
    ];
    const answers = { q1: 3, q2: 4 };

    const result = computeSMIScores(
      answers,
      items,
      categoryKeyMap,
      smiBoundaries
    );

    expect(result["Vulnerable Child"]).toEqual({
      average: 3.5,
      label: expect.any(String),
    });
  });

  test("shouldHighlight returns true for high severity ratings", () => {
    expect(shouldHighlight("Very High")).toBe(true);
    expect(shouldHighlight("Severe")).toBe(true);
  });

  test("shouldHighlight returns false for mild ratings", () => {
    expect(shouldHighlight("Average")).toBe(false);
  });

  test("returns 'Unknown' if categoryKeyMap or smiBoundaries missing for a category", () => {
    const answers = { q1: 5 };
    const items = [{ id: "q1", category: "NonExistentCategory" }];
    const fakeCategoryKeyMap = {};
    const fakeSmiBoundaries = {};

    const result = computeSMIScores(
      answers,
      items,
      fakeCategoryKeyMap,
      fakeSmiBoundaries
    );

    expect(result["NonExistentCategory"].label).toBe("Unknown");
  });

  test("defaults undefined answer to 0", () => {
    const items = [{ id: "q1", category: "Test Category" }];
    const answers = {}; // q1 missing

    const result = computeSMIScores(
      answers,
      items,
      categoryKeyMap,
      smiBoundaries
    );
    expect(result["Test Category"].average).toBe(0);
  });

  test("parses numeric string answer correctly", () => {
    const items = [{ id: "q1", category: "Test Category" }];
    const answers = { q1: "3" }; // simulate string from JSON

    const result = computeSMIScores(
      answers,
      items,
      categoryKeyMap,
      smiBoundaries
    );
    expect(result["Test Category"].average).toBe(3);
  });

  test("treats null answer as 0", () => {
    const items = [{ id: "q1", category: "Test Category" }];
    const answers = { q1: null };

    const result = computeSMIScores(
      answers,
      items,
      categoryKeyMap,
      smiBoundaries
    );
    expect(result["Test Category"].average).toBe(0);
  });

  test("returns null if the score is null or empty string", () => {
    expect(getCellData("Vulnerable Child", { smi_vc_score: null })).toBeNull();
    expect(getCellData("Vulnerable Child", { smi_vc_score: "" })).toBeNull();
  });

  test("returns null if the score is not a valid number", () => {
    expect(getCellData("Vulnerable Child", { smi_vc_score: "abc" })).toBeNull();
    expect(getCellData("Vulnerable Child", { smi_vc_score: "NaN" })).toBeNull();
  });
});
