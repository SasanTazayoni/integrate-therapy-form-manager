import { describe, test, expect } from "vitest";
import { normalizeLabel, generateScore } from "./SMIScoreUtilsBackend";
import { smiBoundaries, labels } from "../data/SMIBoundariesBackend";

describe("SMI Score Utils", () => {
  describe("normalizeLabel", () => {
    test("normalizes labels correctly", () => {
      expect(normalizeLabel("Burn's Anxiety (BAI)")).toBe("burns anxiety bai");
      expect(normalizeLabel("  Test-Label - Example  ")).toBe(
        "test label example"
      );
      expect(normalizeLabel("Special@#Chars!!")).toBe("specialchars");
    });
  });

  describe("generateScore", () => {
    test("smiBoundaries contains all expected scale keys", () => {
      const expectedKeys = [
        "smi_vc_score",
        "smi_ac_score",
        "smi_ec_score",
        "smi_ic_score",
        "smi_uc_score",
        "smi_cc_score",
        "smi_cs_score",
        "smi_dp_score",
        "smi_dss_score",
        "smi_sa_score",
        "smi_ba_score",
        "smi_pp_score",
        "smi_dc_score",
        "smi_ha_score",
      ];
      expect(Object.keys(smiBoundaries)).toEqual(expectedKeys);
    });

    test("generates scores within boundaries and returns valid labels for all scales", () => {
      Object.keys(smiBoundaries).forEach((scaleKey) => {
        for (let i = 0; i < 5; i++) {
          const result = generateScore(scaleKey);
          const [scoreStr, label] = result.split(" - ");
          const score = parseFloat(scoreStr);
          const boundaries = smiBoundaries[scaleKey];
          const min = Math.min(...boundaries);
          const max = Math.max(...boundaries);

          expect(score).toBeGreaterThanOrEqual(min);
          expect(score).toBeLessThanOrEqual(max);
          expect(labels).toContain(label);
        }
      });
    });

    test("handles reversed scales correctly", () => {
      const reversedScales = ["smi_cc_score", "smi_ha_score"];
      reversedScales.forEach((scaleKey) => {
        for (let i = 0; i < 5; i++) {
          const result = generateScore(scaleKey);
          const [scoreStr, label] = result.split(" - ");
          const score = parseFloat(scoreStr);
          const boundaries = smiBoundaries[scaleKey];
          const min = Math.min(...boundaries);
          const max = Math.max(...boundaries);

          expect(score).toBeGreaterThanOrEqual(min);
          expect(score).toBeLessThanOrEqual(max);
          expect(labels).toContain(label);
        }
      });
    });
  });
});
