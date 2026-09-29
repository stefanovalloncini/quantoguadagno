import { calculateRegimeImpatriatiAdjustment } from "@/domain/specialConditionsCalculations.ts";
import { getTaxConfig } from "@/domain/taxConfig.ts";
import type { EmployeeResult } from "./compute.ts";

export interface ImpatriatiBase {
  readonly exempt: number;
  readonly taxed: number;
  readonly exemptionRate: number;
  readonly maxEligibleIncome: number;
  readonly wholeIncomeEligible: boolean;
}

export function impatriatiBase(result: EmployeeResult): ImpatriatiBase | null {
  const regime = result.input.specialConditions?.regimeImpatriati;
  if (regime?.enabled !== true) return null;
  const config = getTaxConfig(result.values.taxYear).regimeImpatriati;
  const income = result.breakdown.taxableIncome;
  const adjustment = calculateRegimeImpatriatiAdjustment(income, regime, config);
  if (adjustment.exemptedIncome <= 0) return null;
  return {
    exempt: adjustment.exemptedIncome,
    taxed: adjustment.adjustedTaxableIncome,
    exemptionRate: adjustment.exemptionRate,
    maxEligibleIncome: config.maxEligibleIncome,
    wholeIncomeEligible: income <= config.maxEligibleIncome,
  };
}

export function irpefBaseOf(result: EmployeeResult): number {
  return impatriatiBase(result)?.taxed ?? result.breakdown.taxableIncome;
}
