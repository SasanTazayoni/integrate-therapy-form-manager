export const BURNS_MINIMAL_MAX = 4;
export const BURNS_BORDERLINE_MAX = 10;
export const BURNS_MILD_MAX = 20;
export const BURNS_MODERATE_MAX = 30;
export const BURNS_SEVERE_MAX = 50;

export default function getBurnsScoreCategory(score: number): string {
  if (score <= BURNS_MINIMAL_MAX) return "Minimal or no anxiety";
  if (score <= BURNS_BORDERLINE_MAX) return "Borderline anxiety";
  if (score <= BURNS_MILD_MAX) return "Mild anxiety";
  if (score <= BURNS_MODERATE_MAX) return "Moderate anxiety";
  if (score <= BURNS_SEVERE_MAX) return "Severe anxiety";
  return "Extreme anxiety or panic";
}
