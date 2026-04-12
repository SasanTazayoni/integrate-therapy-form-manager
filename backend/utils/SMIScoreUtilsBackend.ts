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
    .replace(/[\(\)\-\-]/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function randomScoreBetween(min: number, max: number): number {
  const randomValue = min + Math.random() * (max - min);
  return Math.round(randomValue * 100) / 100;
}

export function generateScore(scaleKey: string): string {
  const boundaries = smiBoundaries[scaleKey];
  const segment = Math.floor(Math.random() * (boundaries.length - 1));
  let lowerBoundary = boundaries[segment];
  let upperBoundary = boundaries[segment + 1];
  if (lowerBoundary > upperBoundary) [lowerBoundary, upperBoundary] = [upperBoundary, lowerBoundary];
  const score = randomScoreBetween(lowerBoundary, upperBoundary);
  const category = classifyScore(score, boundaries);
  return `${score} - ${category}`;
}
