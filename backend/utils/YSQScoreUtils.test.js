import { describe, it, expect } from "vitest";
import { getScoreCategory } from "./YSQScoreUtils";

const boundaries = {
  ED: [8, 18, 30],
  AB: [12, 25, 39],
  MA: [12, 25, 39],
  SI: [8, 18, 30],
  DS: [12, 25, 39],
  FA: [8, 18, 30],
  DI: [12, 25, 39],
  VU: [8, 18, 30],
  EU: [8, 18, 30],
  SB: [8, 18, 30],
  SS: [12, 25, 39],
  EI: [8, 18, 30],
  US: [12, 25, 39],
  ET: [8, 18, 30],
  IS: [12, 25, 39],
  AS: [12, 25, 39],
  NP: [8, 18, 30],
  PU: [12, 25, 39],
};

describe("getScoreCategory", () => {
  Object.entries(boundaries).forEach(([schema, [lowMax, medMax, highMax]]) => {
    it(`${schema} returns correct categories`, () => {
      expect(getScoreCategory(schema, lowMax - 1)).toBe("Low");
      expect(getScoreCategory(schema, lowMax)).toBe("Low");

      expect(getScoreCategory(schema, lowMax + 1)).toBe("Medium");
      expect(getScoreCategory(schema, medMax)).toBe("Medium");

      expect(getScoreCategory(schema, medMax + 1)).toBe("High");
      expect(getScoreCategory(schema, highMax)).toBe("High");

      expect(getScoreCategory(schema, highMax + 1)).toBe("Very High");
      expect(getScoreCategory(schema, highMax + 100)).toBe("Very High");
    });
  });
});
