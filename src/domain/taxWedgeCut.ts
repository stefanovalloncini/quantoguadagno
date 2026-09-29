import type {
  DetrazioneAggiuntivaConfig,
  SommaAggiuntivaBracket,
  TaxWedgeCutConfig,
} from "@/data/index.ts";
import { linearPhaseOut } from "./_math.ts";

export type { DetrazioneAggiuntivaConfig, SommaAggiuntivaBracket, TaxWedgeCutConfig };

export interface TaxWedgeCutResult {
  readonly sommaAggiuntiva: number;
  readonly detrazioneAggiuntiva: number;
  readonly total: number;
}

export function calculateSommaAggiuntiva(taxableIncome: number, cfg: TaxWedgeCutConfig): number {
  if (taxableIncome <= 0) return 0;
  for (const bracket of cfg.sommaAggiuntiva) {
    if (taxableIncome <= bracket.maxIncome) return taxableIncome * bracket.rate;
  }
  return 0;
}

export function calculateDetrazioneAggiuntiva(
  taxableIncome: number,
  irpefGross: number,
  cfg: TaxWedgeCutConfig,
): number {
  if (irpefGross <= 0) return 0;
  const last = cfg.sommaAggiuntiva[cfg.sommaAggiuntiva.length - 1];
  if (!last) return 0;
  if (taxableIncome <= last.maxIncome) return 0;
  if (taxableIncome > cfg.detrazioneAggiuntiva.phaseOutEnd) return 0;

  const { maxDeduction, fullDeductionThreshold, phaseOutEnd } = cfg.detrazioneAggiuntiva;
  const deduction =
    taxableIncome <= fullDeductionThreshold
      ? maxDeduction
      : maxDeduction * linearPhaseOut(taxableIncome, fullDeductionThreshold, phaseOutEnd);

  return Math.min(deduction, irpefGross);
}

export function calculateTaxWedgeCut(
  taxableIncome: number,
  irpefGross: number,
  cfg: TaxWedgeCutConfig,
): TaxWedgeCutResult {
  const sommaAggiuntiva = calculateSommaAggiuntiva(taxableIncome, cfg);
  const detrazioneAggiuntiva = calculateDetrazioneAggiuntiva(taxableIncome, irpefGross, cfg);
  return {
    sommaAggiuntiva,
    detrazioneAggiuntiva,
    total: sommaAggiuntiva + detrazioneAggiuntiva,
  };
}
