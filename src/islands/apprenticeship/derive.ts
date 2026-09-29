import {
  calculateSalaryBreakdown,
  type ApprenticeshipBreakdown,
  type ApprenticeshipYear,
} from "@/domain/index.ts";
import type { RegionCode, SupportedYear } from "@/data/index.ts";

export const ESTIMATE_TAX_YEAR: SupportedYear = 2026;
export const ESTIMATE_REGION_CODE: RegionCode = "lombardia";
export const ESTIMATE_MUNICIPAL_TAX_RATE = 0.008;
export const ESTIMATE_PAYMENT_FREQUENCY = 12;

export interface ApprenticeshipScheduleRow extends ApprenticeshipYear {
  readonly estimatedNetMonthly: number;
}

export interface ApprenticeshipDerived {
  readonly schedule: readonly ApprenticeshipScheduleRow[];
  readonly firstYear: ApprenticeshipScheduleRow | null;
  readonly lastYear: ApprenticeshipScheduleRow | null;
}

export function estimateMonthlyNet(
  grossAnnual: number,
  regionCode: RegionCode = ESTIMATE_REGION_CODE,
  municipalTaxRate: number = ESTIMATE_MUNICIPAL_TAX_RATE,
): number {
  return calculateSalaryBreakdown({
    grossAnnual,
    taxYear: ESTIMATE_TAX_YEAR,
    regionCode,
    municipalTaxRate,
    contractType: "apprendistato",
    paymentFrequency: ESTIMATE_PAYMENT_FREQUENCY,
  }).netMonthly;
}

export function deriveApprenticeship(
  result: ApprenticeshipBreakdown,
  regionCode: RegionCode = ESTIMATE_REGION_CODE,
  municipalTaxRate: number = ESTIMATE_MUNICIPAL_TAX_RATE,
): ApprenticeshipDerived {
  const schedule = result.schedule.map((row) => ({
    ...row,
    estimatedNetMonthly: estimateMonthlyNet(row.grossAnnual, regionCode, municipalTaxRate),
  }));

  return {
    schedule,
    firstYear: schedule[0] ?? null,
    lastYear: schedule[schedule.length - 1] ?? null,
  };
}
