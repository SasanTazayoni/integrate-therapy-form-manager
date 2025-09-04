import { smiBoundaries, categoryKeyMap } from "../data/SMIBoundaries";
import { classifyScore } from "./SMIUtils";
import { Item } from "../data/SMICommon";

export const shouldHighlight = (rating: string) =>
  ["high", "very high", "severe"].some((r) => rating.toLowerCase().includes(r));

export const getCellData = (
  mode: string,
  smiScores: Record<string, string | null>
) => {
  const key = categoryKeyMap[mode];
  if (!key) return null;

  const raw = smiScores?.[key];
  if (!raw) return null;

  const score = parseFloat(raw);
  if (Number.isNaN(score)) return null;

  const rating = classifyScore(score, smiBoundaries[key]);
  return { score, rating, display: `${score} (${rating})` };
};

export type SmiBoundaries = Record<string, number[]>;

export const computeSMIScores = (
  answers: Record<string, number>,
  items: Item[],
  categoryKeyMap: Record<string, string>,
  smiBoundaries: SmiBoundaries
): Record<string, { average: number; label: string }> => {
  const scoresByCategory: Record<string, number> = {};
  const countsByCategory: Record<string, number> = {};

  for (const item of items) {
    const value = Number(answers[item.id] ?? 0);
    scoresByCategory[item.category] ??= 0;
    countsByCategory[item.category] ??= 0;
    scoresByCategory[item.category] += value;
    countsByCategory[item.category] += 1;
  }

  const results: Record<string, { average: number; label: string }> = {};
  for (const category in scoresByCategory) {
    const avg = Number(
      (scoresByCategory[category] / countsByCategory[category]).toFixed(2)
    );
    const key = categoryKeyMap[category];
    const label =
      key && smiBoundaries[key]
        ? classifyScore(avg, smiBoundaries[key])
        : "Unknown";
    results[category] = { average: avg, label };
  }

  return results;
};
