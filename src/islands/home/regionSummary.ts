import {
  regionRules,
  type RegionalTaxDeduction,
  type RegionCode,
  type SupportedYear,
} from "@/data/index.ts";

export type RegionalDeductionSummary =
  | { readonly kind: "phaseIn"; readonly amount: number; readonly above: number }
  | {
      readonly kind: "band";
      readonly amount: number;
      readonly above: number;
      readonly upTo: number;
    }
  | { readonly kind: "upTo"; readonly amount: number; readonly upTo: number }
  | { readonly kind: "all"; readonly amount: number };

export interface RegionSummary {
  readonly region: RegionCode;
  readonly exemptionThreshold: number | null;
  readonly flatRate: { readonly rate: number; readonly upToIncome: number } | null;
  readonly rates: readonly number[];
  readonly minRate: number;
  readonly maxRate: number;
  readonly deductions: readonly RegionalDeductionSummary[];
}

function deductionSummary(deduction: RegionalTaxDeduction): RegionalDeductionSummary {
  const { amount, above, upTo, phaseInOver } = deduction;
  if (phaseInOver !== undefined && above !== undefined) return { kind: "phaseIn", amount, above };
  if (above !== undefined && upTo !== undefined) return { kind: "band", amount, above, upTo };
  if (upTo !== undefined) return { kind: "upTo", amount, upTo };
  return { kind: "all", amount };
}

export function regionSummary(region: RegionCode, year: SupportedYear): RegionSummary {
  const rules = regionRules(region, year);
  const rates = rules.taxBrackets.map((bracket) => bracket.rate);
  return {
    region,
    exemptionThreshold: rules.exemptionThreshold ?? null,
    flatRate: rules.flatRate ?? null,
    rates,
    minRate: Math.min(...rates),
    maxRate: Math.max(...rates),
    deductions: (rules.taxDeductions ?? []).map(deductionSummary),
  };
}
