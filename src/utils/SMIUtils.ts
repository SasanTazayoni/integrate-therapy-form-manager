import { smiBoundaries, labels, BoundaryResult } from "../data/SMIBoundaries";

export function classifyScore(score: number, boundaries: number[]): string {
  let closestIndex = 0;
  let smallestDiff = Infinity;
  boundaries.forEach((boundary, idx) => {
    const diff = Math.abs(score - boundary);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestIndex = idx;
    }
  });
  return labels[closestIndex];
}

export function classifyBoundaryAndAlignment(
  scoreStr: string | null | undefined,
  categoryKey?: string
): BoundaryResult {
  if (!scoreStr || !categoryKey) return { column: null, alignment: null };

  const score = parseFloat(scoreStr.split("-")[0]);
  if (Number.isNaN(score)) return { column: null, alignment: null };

  const boundaries = smiBoundaries[categoryKey];
  if (!boundaries) return { column: null, alignment: null };

  const columns = [
    "Very Low - Average",
    "Average - Moderate",
    "Moderate - High",
    "High - Very High",
    "Very High - Severe",
  ];

  const isAscending = boundaries[0] < boundaries[boundaries.length - 1];

  let band = -1;
  for (let i = 0; i < boundaries.length - 1; i++) {
    const a = boundaries[i];
    const b = boundaries[i + 1];
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    if (score >= lo && score <= hi) {
      band = i;
      break;
    }
  }
  if (band === -1) return { column: null, alignment: null };

  const a = boundaries[band];
  const b = boundaries[band + 1];
  const column = columns[band];
  const leftVal = isAscending ? Math.min(a, b) : Math.max(a, b);
  const rightVal = isAscending ? Math.max(a, b) : Math.min(a, b);
  const mid = (a + b) / 2;

  const dLeft = Math.abs(score - leftVal);
  const dRight = Math.abs(score - rightVal);
  const dMid = Math.abs(score - mid);

  let alignment: "left" | "center" | "right";
  if (dMid <= Math.min(dLeft, dRight)) alignment = "center";
  else alignment = dLeft < dRight ? "left" : "right";

  return { column, alignment };
}
