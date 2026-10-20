export type PercentArticle = "lo" | "l" | "il";

const ELIDED_WHOLE_NUMBERS: ReadonlySet<number> = new Set([1, 11]);

export function percentArticle(percent: number): PercentArticle {
  const whole = Math.floor(Math.abs(percent));
  if (whole === 0) return "lo";
  if (ELIDED_WHOLE_NUMBERS.has(whole) || String(whole).startsWith("8")) return "l";
  return "il";
}

export type DateArticle = "l" | "il";

const ELIDED_DAYS: ReadonlySet<number> = new Set([8, 11]);

// Dates are formatted in UTC (numbers.ts), so the day is read in UTC too.
export function dateArticle(date: Date): DateArticle {
  return ELIDED_DAYS.has(date.getUTCDate()) ? "l" : "il";
}
