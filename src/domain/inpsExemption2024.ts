import type { InpsExemption2024Config, InpsExemptionBracket } from "@/data/index.ts";

export type { InpsExemption2024Config, InpsExemptionBracket };

const ORDINARY_MONTHS = 12;

export function calculateInpsExemption2024(
  grossAnnual: number,
  paymentFrequency: number,
  cfg: InpsExemption2024Config,
): number {
  if (grossAnnual <= 0 || paymentFrequency <= 0) return 0;
  const monthly = grossAnnual / paymentFrequency;

  for (const bracket of cfg.brackets) {
    if (monthly <= bracket.maxMonthlyIncome) {
      return monthly * ORDINARY_MONTHS * bracket.exemptionRate;
    }
  }
  return 0;
}
