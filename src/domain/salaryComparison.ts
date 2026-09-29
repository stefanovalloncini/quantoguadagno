import { calculateSalaryBreakdown } from "./composer.ts";
import type { SalaryInput, SalaryBreakdown } from "./composerTypes.ts";

export type ComparisonWinner = "a" | "b" | "equal";

export interface SalaryComparison {
  readonly a: SalaryBreakdown;
  readonly b: SalaryBreakdown;
  readonly netAnnualDelta: number;
  readonly netMonthlyDelta: number;
  readonly grossAnnualDelta: number;
  readonly winner: ComparisonWinner;
}

export function compareSalaries(a: SalaryInput, b: SalaryInput): SalaryComparison {
  const ra = calculateSalaryBreakdown(a);
  const rb = calculateSalaryBreakdown(b);
  const netAnnualDelta = rb.netAnnual - ra.netAnnual;
  const winner: ComparisonWinner = netAnnualDelta > 0 ? "b" : netAnnualDelta < 0 ? "a" : "equal";
  return {
    a: ra,
    b: rb,
    netAnnualDelta,
    netMonthlyDelta: rb.netMonthly - ra.netMonthly,
    grossAnnualDelta: b.grossAnnual - a.grossAnnual,
    winner,
  };
}
