import type { TrattamentoIntegrativoConfig } from "@/data/index.ts";

export type { TrattamentoIntegrativoConfig };

export interface TrattamentoIntegrativoInput {
  readonly income: number;
  readonly grossTax: number;
  readonly baseWorkDeduction: number;
  readonly eligibleDeductions: number;
}

export function calculateTrattamentoIntegrativo(
  input: TrattamentoIntegrativoInput,
  cfg: TrattamentoIntegrativoConfig,
): number {
  const { income, grossTax, baseWorkDeduction, eligibleDeductions } = input;
  if (income <= 0 || income > cfg.partialBonusThreshold) return 0;

  if (income <= cfg.fullBonusThreshold) {
    const capiente = grossTax > baseWorkDeduction - cfg.capienzaAllowance;
    return capiente ? cfg.maxAnnualBonus : 0;
  }

  const surplus = eligibleDeductions - grossTax;
  if (surplus <= 0) return 0;
  return Math.min(cfg.maxAnnualBonus, surplus);
}
