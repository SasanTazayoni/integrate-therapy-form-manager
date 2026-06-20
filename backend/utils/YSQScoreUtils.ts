import { SchemaType } from "../data/YSQBoundariesBackend";

export const YSQ_BOUNDARIES: Record<SchemaType, [number, number, number]> = {
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

export function getScoreCategory(schema: SchemaType, score: number): string {
  const [lowMax, medMax, highMax] = YSQ_BOUNDARIES[schema];

  if (score <= lowMax) return "Low";
  if (score <= medMax) return "Medium";
  if (score <= highMax) return "High";
  return "Very High";
}
