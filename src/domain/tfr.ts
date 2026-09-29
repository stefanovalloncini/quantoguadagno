import type { TfrConfig } from "@/data/index.ts";
import { round, sumOfCents } from "./_math.ts";

export interface TfrYear {
  readonly year: number;
  readonly quota: number;
  readonly revaluation: number; // net of imposta sostitutiva
  readonly stock: number;
}

export interface TfrProjection {
  readonly annualQuota: number;
  readonly totalQuote: number;
  readonly totalRevaluation: number; // net of the 17% substitute tax
  readonly totalRevaluationTax: number;
  readonly finalStock: number;
  readonly schedule: readonly TfrYear[];
}

// Accumulated TFR over a number of years. Each year a quota of RAL/13.5 is set
// aside (Art. 2120 c.c.); the existing stock is revalued by 1.5% fixed + 75% of
// the ISTAT FOI inflation, net of the 17% imposta sostitutiva (DL 47/2014). The
// current year's quota is not revalued until the following year. This is the
// accumulated severance before the final tassazione separata at payout.
export function projectTfr(
  ral: number,
  years: number,
  inflationRate: number,
  cfg: TfrConfig,
): TfrProjection {
  const quota = ral > 0 ? ral * (1 / cfg.accrualDivisor - cfg.ivsContributionRate) : 0;
  const revaluationRate = cfg.fixedRevaluationRate + cfg.inflationPercentage * inflationRate;

  const annualQuota = round(quota);
  const schedule: TfrYear[] = [];
  const taxes: number[] = [];
  let stock = 0;

  const n = Math.max(0, Math.floor(years));
  for (let y = 1; y <= n; y++) {
    const grossRevaluation = round(stock * revaluationRate);
    const tax = round(grossRevaluation * cfg.revaluationTaxRate);
    const netRevaluation = sumOfCents([grossRevaluation, -tax]);
    stock = sumOfCents([stock, annualQuota, netRevaluation]);
    taxes.push(tax);
    schedule.push({ year: y, quota: annualQuota, revaluation: netRevaluation, stock });
  }

  return {
    annualQuota,
    totalQuote: sumOfCents(schedule.map((row) => row.quota)),
    totalRevaluation: sumOfCents(schedule.map((row) => row.revaluation)),
    totalRevaluationTax: sumOfCents(taxes),
    finalStock: stock,
    schedule,
  };
}
