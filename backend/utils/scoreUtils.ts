export function parseAndCombineScore(
  result: string,
  getCategoryFn: (score: number) => string
): string {
  const score = Number.isInteger(parseInt(result)) ? parseInt(result) : 0;
  const category = getCategoryFn(score);
  return `${score}-${category}`;
}
