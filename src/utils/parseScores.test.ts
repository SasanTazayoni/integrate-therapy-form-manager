import { describe, expect, test } from "vitest";
import { parseScore } from "./parseScores";

describe("parseScore", () => {
  test("returns null score and empty label if input is null", () => {
    expect(parseScore(null)).toEqual({ score: null, label: "" });
  });

  test("returns null score and empty label if input is empty string", () => {
    expect(parseScore("")).toEqual({ score: null, label: "" });
  });

  test("parses a score with a label separated by space", () => {
    expect(parseScore("12 Anxiety")).toEqual({ score: 12, label: "Anxiety" });
  });

  test("parses a score with a label separated by dash", () => {
    expect(parseScore("45-Depression")).toEqual({
      score: 45,
      label: "Depression",
    });
  });

  test("parses a score with a label with extra spaces", () => {
    expect(parseScore("99   Stress ")).toEqual({ score: 99, label: "Stress" });
  });

  test("parses just a score with no label", () => {
    expect(parseScore("100")).toEqual({ score: 100, label: "" });
  });

  test("returns null score and uses raw as label if input does not match pattern", () => {
    expect(parseScore("abc")).toEqual({ score: null, label: "abc" });
  });
});
