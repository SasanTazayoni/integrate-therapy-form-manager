export default function getBecksScoreCategory(score: number): string {
  if (score <= 10) return "Normal";
  if (score <= 16) return "Mild mood disturbance";
  if (score <= 20) return "Borderline clinical depression";
  if (score <= 30) return "Moderate depression";
  if (score <= 40) return "Severe depression";
  return "Extreme depression";
}
