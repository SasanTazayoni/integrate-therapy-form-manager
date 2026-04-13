import { smiBoundaries } from "../data/SMIBoundariesBackend";
import { classifyScore } from "./classifyScore";

export { classifyScore };

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
