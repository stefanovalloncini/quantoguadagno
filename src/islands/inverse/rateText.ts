import type { ComunaleRule } from "@/data/index.ts";
import type { ViewFormat } from "@/islands/home/viewFormat.tsx";

export function ratesOfRule(rule: ComunaleRule): readonly number[] {
  return rule.brackets === undefined ? [rule.rate] : rule.brackets.map((bracket) => bracket.rate);
}

export function rateRangeText(rates: readonly number[], f: ViewFormat): string {
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  if (min === max) return f.percent(max);
  return `${f.percent(min).replace("%", "")}–${f.percent(max)}`;
}
