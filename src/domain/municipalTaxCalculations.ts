import type { ComunaleBracket, ComunaleRule } from "@/data/index.ts";

export type { ComunaleBracket, ComunaleRule };

export type MunicipalTaxInput = number | ComunaleRule;

export interface MunicipalTaxResult {
  readonly municipalTax: number;
  readonly municipalTaxRate: number;
  readonly municipalMarginalRate: number;
}

const PERCENT = 100;

function isExempt(taxableIncome: number, rule: ComunaleRule): boolean {
  return rule.exemption !== undefined && taxableIncome <= rule.exemption;
}

function progressiveTax(taxableIncome: number, brackets: readonly ComunaleBracket[]): number {
  let taxInPercentPoints = 0;
  let lower = 0;
  for (const bracket of brackets) {
    if (taxableIncome <= lower) break;
    const upper = bracket.upTo ?? Number.POSITIVE_INFINITY;
    if (upper > lower) {
      taxInPercentPoints += (Math.min(taxableIncome, upper) - lower) * bracket.rate;
    }
    lower = Math.max(lower, upper);
  }
  return taxInPercentPoints / PERCENT;
}

export function calculateMunicipalTax(taxableIncome: number, rule: ComunaleRule): number {
  if (taxableIncome <= 0 || isExempt(taxableIncome, rule)) return 0;
  if (rule.brackets !== undefined) return progressiveTax(taxableIncome, rule.brackets);
  return (taxableIncome * rule.rate) / PERCENT;
}

export function getEffectiveMunicipalRate(taxableIncome: number, rule: ComunaleRule): number {
  if (taxableIncome <= 0) return 0;
  return calculateMunicipalTax(taxableIncome, rule) / taxableIncome;
}

export function getMunicipalMarginalRate(taxableIncome: number, rule: ComunaleRule): number {
  if (isExempt(taxableIncome, rule)) return 0;
  if (rule.brackets === undefined) return rule.rate / PERCENT;
  const bracket =
    rule.brackets.find(({ upTo }) => upTo === null || taxableIncome < upTo) ??
    rule.brackets[rule.brackets.length - 1];
  return bracket === undefined ? 0 : bracket.rate / PERCENT;
}

export function calculateMunicipal(
  taxableIncome: number,
  input: MunicipalTaxInput,
): MunicipalTaxResult {
  if (typeof input === "number") {
    return {
      municipalTax: taxableIncome * input,
      municipalTaxRate: input,
      municipalMarginalRate: input,
    };
  }
  return {
    municipalTax: calculateMunicipalTax(taxableIncome, input),
    municipalTaxRate: getEffectiveMunicipalRate(taxableIncome, input),
    municipalMarginalRate: getMunicipalMarginalRate(taxableIncome, input),
  };
}
