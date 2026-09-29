import type { RegimeImpatriatiConfig } from "@/data/index.ts";
import type { MadreLavoratriceConfig } from "./taxConfig.ts";
import { round } from "./_math.ts";

export interface RegimeImpatriatiInput {
  readonly enabled: boolean;
  readonly hasMinorChildren: boolean;
}

export interface MadreLavoratriceInput {
  readonly enabled: boolean;
  readonly numberOfChildren: number;
  readonly youngestChildAge: number;
}

export interface SpecialConditionsInput {
  readonly regimeImpatriati?: RegimeImpatriatiInput;
  readonly madreLavoratrice?: MadreLavoratriceInput;
}

export interface RegimeImpatriatiResult {
  readonly adjustedTaxableIncome: number;
  readonly exemptionRate: number;
  readonly exemptedIncome: number;
}

export function isMadreLavoratriceEligible(
  madreLavoratrice: MadreLavoratriceInput | undefined,
  cfg: MadreLavoratriceConfig,
): boolean {
  if (!madreLavoratrice?.enabled) return false;
  return (
    madreLavoratrice.numberOfChildren >= cfg.minChildrenFullExemption &&
    madreLavoratrice.youngestChildAge < cfg.maxYoungestChildAge
  );
}

export function calculateMadreLavoratriceExemption(
  inpsBeforeExemption: number,
  madreLavoratrice: MadreLavoratriceInput | undefined,
  cfg: MadreLavoratriceConfig,
): number {
  if (!isMadreLavoratriceEligible(madreLavoratrice, cfg)) return 0;
  return round(Math.min(inpsBeforeExemption, cfg.maxAnnualExemption));
}

export function calculateRegimeImpatriatiAdjustment(
  taxableIncome: number,
  regimeImpatriati: RegimeImpatriatiInput | undefined,
  cfg: RegimeImpatriatiConfig,
): RegimeImpatriatiResult {
  if (!regimeImpatriati?.enabled) {
    return { adjustedTaxableIncome: taxableIncome, exemptionRate: 0, exemptedIncome: 0 };
  }

  const exemptionRate = regimeImpatriati.hasMinorChildren
    ? cfg.withMinorChildrenExemptionRate
    : cfg.standardExemptionRate;

  const eligibleIncome = Math.min(taxableIncome, cfg.maxEligibleIncome);
  const exemptedIncome = round(eligibleIncome * exemptionRate);
  const adjustedTaxableIncome = round(taxableIncome - exemptedIncome);

  return { adjustedTaxableIncome, exemptionRate, exemptedIncome };
}

export function calculateRegimeImpatriatiSavings(
  irpefFullIncome: number,
  irpefReducedIncome: number,
): number {
  return Math.max(0, irpefFullIncome - irpefReducedIncome);
}
