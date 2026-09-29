import type { PdrSostitutivaConfig } from "@/data/index.ts";
import { getMarginalRate } from "./irpef.ts";
import type { IrpefBracket } from "./irpef.ts";

export interface PremioRisultatoInput {
  readonly amount: number;
}

export interface PremioRisultatoResult {
  readonly pdrGross: number;
  readonly pdrInps: number;
  readonly pdrTax: number;
  readonly pdrNet: number;
}

// Premio di risultato (Art. 1, comma 182-189, L. 208/2015 e successive proroghe).
// La parte entro il cap è tassata all'imposta sostitutiva (5% o 10% per anno).
// La parte eccedente il cap entra nell'imponibile ordinario IRPEF al margine.
export function calculatePremioRisultato(
  premio: PremioRisultatoInput | undefined,
  taxableIncome: number,
  inpsStandardRate: number,
  irpefBrackets: readonly IrpefBracket[],
  cfg: PdrSostitutivaConfig,
): PremioRisultatoResult {
  if (!premio || premio.amount <= 0) {
    return { pdrGross: 0, pdrInps: 0, pdrTax: 0, pdrNet: 0 };
  }

  const pdrGross = premio.amount;
  const pdrInps = pdrGross * inpsStandardRate;

  const eligibleGross = Math.min(pdrGross, cfg.maxAmount);
  const excessGross = Math.max(0, pdrGross - cfg.maxAmount);

  const substitutiveTax = eligibleGross * (1 - inpsStandardRate) * cfg.rate;

  const marginalRate = getMarginalRate(taxableIncome, irpefBrackets);
  const excessTax = excessGross * (1 - inpsStandardRate) * marginalRate;

  const pdrTax = substitutiveTax + excessTax;
  const pdrNet = pdrGross - pdrInps - pdrTax;

  return { pdrGross, pdrInps, pdrTax, pdrNet };
}
