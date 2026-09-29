import type { Bracket } from "@/data/index.ts";

export type IrpefBracket = Bracket;

export function applyProgressiveBrackets(
  income: number,
  brackets: readonly IrpefBracket[],
): number {
  let tax = 0;
  let remaining = income;

  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const cap = bracket.max ?? Number.POSITIVE_INFINITY;
    const span = cap - bracket.min;
    const taxable = Math.min(remaining, span);
    tax += taxable * bracket.rate;
    remaining -= taxable;
  }

  return tax;
}

export const calculateIrpefGross = applyProgressiveBrackets;

export function getMarginalRate(income: number, brackets: readonly IrpefBracket[]): number {
  for (const bracket of brackets) {
    if (bracket.max === null || income < bracket.max) return bracket.rate;
  }
  const last = brackets[brackets.length - 1];
  return last ? last.rate : 0;
}
