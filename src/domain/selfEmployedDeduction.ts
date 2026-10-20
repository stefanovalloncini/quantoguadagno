import type { SelfEmployedDeductionConfig } from "@/data/index.ts";
import { round } from "./_math.ts";

export type { SelfEmployedDeductionConfig };

const CENTS = 100;

// Art. 13 c. 6 TUIR: the ratio keeps its first decimals, without rounding. Working in cents
// keeps both terms integers, so the floor is exact.
function truncatedRatio(numerator: number, denominator: number, decimals: number): number {
  const scale = 10 ** decimals;
  const top = Math.round(numerator * CENTS);
  const bottom = Math.round(denominator * CENTS);
  return Math.floor((top * scale) / bottom) / scale;
}

export function calculateSelfEmployedDeduction(
  income: number,
  cfg: SelfEmployedDeductionConfig,
): number {
  if (income <= 0) return 0;
  const [first, second, last] = cfg.thresholds;
  const ratio = (upper: number, lower: number) =>
    truncatedRatio(upper - income, upper - lower, cfg.quotientDecimals);

  let deduction = 0;
  if (income <= first) {
    deduction = cfg.baseDeduction;
  } else if (income <= second) {
    deduction = cfg.midBracketFixed + cfg.additionalDeduction * ratio(second, first);
  } else if (income <= last) {
    deduction = cfg.midBracketFixed * ratio(last, second);
  }

  const { above, upTo, amount } = cfg.midBracketBonus;
  const bonus = income > above && income <= upTo ? amount : 0;
  return round(deduction + bonus);
}
