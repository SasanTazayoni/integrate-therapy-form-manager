export default function getEDScoreCategory(score: number): string {
  if (score <= 10) return "Low";
  if (score <= 20) return "Moderate";
  if (score <= 30) return "High";
  return "Very High";
}
