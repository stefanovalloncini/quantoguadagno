export type PercentArticle = "lo" | "l" | "il";

const ELIDED_WHOLE_NUMBERS: ReadonlySet<number> = new Set([1, 11]);

export function percentArticle(percent: number): PercentArticle {
  const whole = Math.floor(Math.abs(percent));
  if (whole === 0) return "lo";
  if (ELIDED_WHOLE_NUMBERS.has(whole) || String(whole).startsWith("8")) return "l";
  return "il";
}
