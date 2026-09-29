import { REGIONS, type RegionCode, type RegionalTaxRules, type TaxYear } from "@/data/index.ts";
import { applyProgressiveBrackets, getMarginalRate } from "./irpef.ts";
import {
  calculateMunicipal,
  type MunicipalTaxInput,
  type MunicipalTaxResult,
} from "./municipalTaxCalculations.ts";

export function regionalRules(regionCode: RegionCode, year: TaxYear): RegionalTaxRules {
  return REGIONS[regionCode].rules[year];
}

function isExempt(taxableIncome: number, rules: RegionalTaxRules): boolean {
  return rules.exemptionThreshold !== undefined && taxableIncome <= rules.exemptionThreshold;
}

function usesFlatRate(taxableIncome: number, rules: RegionalTaxRules): boolean {
  return rules.flatRate !== undefined && taxableIncome <= rules.flatRate.upToIncome;
}

function grossRegionalTax(taxableIncome: number, rules: RegionalTaxRules): number {
  if (rules.flatRate && usesFlatRate(taxableIncome, rules)) {
    return taxableIncome * rules.flatRate.rate;
  }
  return applyProgressiveBrackets(taxableIncome, rules.taxBrackets);
}

function deductionsFor(taxableIncome: number, rules: RegionalTaxRules): number {
  return (rules.taxDeductions ?? []).reduce((total, deduction) => {
    const above = deduction.above ?? 0;
    if (deduction.above !== undefined && taxableIncome <= deduction.above) return total;
    if (deduction.upTo !== undefined && taxableIncome > deduction.upTo) return total;
    const share =
      deduction.phaseInOver === undefined
        ? 1
        : Math.min(1, (taxableIncome - above) / deduction.phaseInOver);
    return total + deduction.amount * share;
  }, 0);
}

export function calculateRegionalTax(taxableIncome: number, rules: RegionalTaxRules): number {
  if (taxableIncome <= 0 || isExempt(taxableIncome, rules)) return 0;
  const gross = grossRegionalTax(taxableIncome, rules);
  return Math.max(0, gross - deductionsFor(taxableIncome, rules));
}

export function getEffectiveRegionalRate(taxableIncome: number, rules: RegionalTaxRules): number {
  if (taxableIncome <= 0) return 0;
  return calculateRegionalTax(taxableIncome, rules) / taxableIncome;
}

export function getRegionalMarginalRate(taxableIncome: number, rules: RegionalTaxRules): number {
  if (isExempt(taxableIncome, rules)) return 0;
  // While the detrazione still covers the whole tax, another euro of income
  // costs nothing. The jump at the ceiling is a cliff, not a marginal rate.
  const gross = grossRegionalTax(taxableIncome, rules);
  if (gross < deductionsFor(taxableIncome, rules)) return 0;
  if (rules.flatRate && usesFlatRate(taxableIncome, rules)) return rules.flatRate.rate;
  return getMarginalRate(taxableIncome, rules.taxBrackets);
}

export function calculateLocalTaxes(
  taxableIncome: number,
  regionCode: RegionCode,
  year: TaxYear,
  municipal: MunicipalTaxInput,
): MunicipalTaxResult & {
  readonly regionalTax: number;
  readonly regionalTaxRate: number;
  readonly regionalMarginalRate: number;
} {
  const rules = regionalRules(regionCode, year);
  return {
    regionalTax: calculateRegionalTax(taxableIncome, rules),
    regionalTaxRate: getEffectiveRegionalRate(taxableIncome, rules),
    regionalMarginalRate: getRegionalMarginalRate(taxableIncome, rules),
    ...calculateMunicipal(taxableIncome, municipal),
  };
}
