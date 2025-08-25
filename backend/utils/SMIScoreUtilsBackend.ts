import { smiBoundaries, labels } from "../data/SMIBoundariesBackend";

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

export function normalizeLabel(label: string) {
  return label
    .toLowerCase()
    .replace(/[\(\)\-\–]/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function randomScoreBetween(min: number, max: number): number {
  const val = min + Math.random() * (max - min);
  return Math.round(val * 100) / 100;
}

export function generateScore(scaleKey: string): string {
  const boundaries = smiBoundaries[scaleKey];
  const segment = Math.floor(Math.random() * (boundaries.length - 1));
  let low = boundaries[segment];
  let high = boundaries[segment + 1];
  if (low > high) [low, high] = [high, low];
  const score = randomScoreBetween(low, high);
  const category = classifyScore(score, boundaries);
  return `${score} - ${category}`;
}
