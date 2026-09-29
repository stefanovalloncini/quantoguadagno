import type { WorkDeductionConfig } from "@/data/index.ts";

export type { WorkDeductionConfig };

export function calculateBaseWorkDeduction(
  taxableIncome: number,
  cfg: WorkDeductionConfig,
): number {
  if (taxableIncome <= 0) return 0;

  const [t1, t2, t3] = cfg.thresholds;

  if (taxableIncome <= t1) return cfg.baseDeduction;
  if (taxableIncome <= t2) {
    const coef = (t2 - taxableIncome) / (t2 - t1);
    return cfg.midBracketFixed + cfg.additionalDeduction * coef;
  }
  if (taxableIncome <= t3) {
    const coef = (t3 - taxableIncome) / (t3 - t2);
    return cfg.midBracketFixed * coef;
  }
  return 0;
}

export function calculateWorkDeduction(taxableIncome: number, cfg: WorkDeductionConfig): number {
  const base = calculateBaseWorkDeduction(taxableIncome, cfg);
  const { above, upTo, amount } = cfg.midBracketBonus;
  const inBonusRange = taxableIncome > above && taxableIncome <= upTo;
  return inBonusRange ? base + amount : base;
}
