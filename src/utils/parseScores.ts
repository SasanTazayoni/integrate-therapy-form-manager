export function parseScore(raw: string | null): {
  score: number | null;
  label: string;
} {
  if (!raw) return { score: null, label: "" };

  const match = raw.match(/^(\d+)[\s-]*(.*)$/);
  if (!match) return { score: null, label: raw };

  const score = parseInt(match[1], 10);
  const label = match[2]?.trim() || "";

  return { score, label };
}
