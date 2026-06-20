export const BECKS_NORMAL_MAX = 10;
export const BECKS_MILD_MAX = 16;
export const BECKS_BORDERLINE_MAX = 20;
export const BECKS_MODERATE_MAX = 30;
export const BECKS_SEVERE_MAX = 40;

export default function getBecksScoreCategory(score: number): string {
  if (score <= BECKS_NORMAL_MAX) return "Normal";
  if (score <= BECKS_MILD_MAX) return "Mild mood disturbance";
  if (score <= BECKS_BORDERLINE_MAX) return "Borderline clinical depression";
  if (score <= BECKS_MODERATE_MAX) return "Moderate depression";
  if (score <= BECKS_SEVERE_MAX) return "Severe depression";
  return "Extreme depression";
}
