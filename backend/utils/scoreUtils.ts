export function parseAndCombineScore(
  result: string,
  getCategoryFn: (score: number) => string
): string {
  const parsed = parseInt(result, 10);
  const score = Number.isInteger(parsed) ? parsed : 0;
  const category = getCategoryFn(score);
  return `${score}-${category}`;
}
