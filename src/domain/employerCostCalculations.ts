import type { OtherEmployerCostsConfig, TfrConfig } from "@/data/index.ts";
import type { EmployerInpsConfig } from "./taxConfig.ts";
import type { InpsRateOverride } from "./inpsRates.ts";

export type ContractType = "indeterminato" | "determinato" | "apprendistato";

export interface TfrResult {
  readonly annual: number;
  readonly monthly: number;
  readonly rate: number;
}

export interface OtherEmployerCostsResult {
  readonly inail: number;
  readonly maternity: number;
  readonly naspi: number;
  readonly naspiAdditional: number;
  readonly cig: number;
  readonly other: number;
  readonly total: number;
}

export interface EmployerInpsResult {
  readonly contribution: number;
  readonly rate: number;
}

// TFR (Trattamento di Fine Rapporto) — Art. 2120 c.c.
// The accrual divisor is 13.5, giving a rate of ~7.41% of gross.
export function calculateTFR(grossAnnual: number, cfg: TfrConfig): TfrResult {
  const rate = 1 / cfg.accrualDivisor - cfg.ivsContributionRate;
  const annual = Math.max(0, grossAnnual) * rate;
  return {
    annual,
    monthly: annual / 12,
    rate,
  };
}

export function calculateOtherEmployerCosts(
  grossAnnual: number,
  contractType: ContractType,
  cfg: OtherEmployerCostsConfig,
): OtherEmployerCostsResult {
  const inail = grossAnnual * cfg.inailRate;
  const maternity = grossAnnual * cfg.maternityRate;
  const naspi = grossAnnual * cfg.naspiRate;
  const naspiAdditional =
    contractType === "determinato" ? grossAnnual * cfg.naspiAdditionalDeterminatoRate : 0;
  const cig = grossAnnual * cfg.cigRate;
  const other = grossAnnual * cfg.otherRate;

  return {
    inail,
    maternity,
    naspi,
    naspiAdditional,
    cig,
    other,
    total: inail + maternity + naspi + naspiAdditional + cig + other,
  };
}

export function calculateEmployerInps(
  grossAnnual: number,
  contractType: ContractType,
  cfg: EmployerInpsConfig,
  override?: InpsRateOverride,
): EmployerInpsResult {
  if (override) {
    return { contribution: grossAnnual * override.employerRate, rate: override.employerRate };
  }
  const rate = contractType === "apprendistato" ? cfg.apprenticeshipRate : cfg.rate;
  return { contribution: grossAnnual * rate, rate };
}
