export default function getBurnsScoreCategory(score: number): string {
  if (score <= 4) return "Minimal or no anxiety";
  if (score <= 10) return "Borderline anxiety";
  if (score <= 20) return "Mild anxiety";
  if (score <= 30) return "Moderate anxiety";
  if (score <= 50) return "Severe anxiety";
  return "Extreme anxiety or panic";
}
