import { calculateSalaryBreakdown, type SalaryInput } from "./composer.ts";

export const RAISE_STEPS: readonly number[] = [1_000, 2_000, 5_000, 10_000];

export interface RaiseStep {
  readonly increment: number;
  readonly grossAnnual: number;
  readonly netAnnual: number;
  readonly netGain: number;
  /** Net gain over the raise: how much of the extra gross reaches the payslip. */
  readonly keptShare: number;
  readonly marginalTaxRate: number;
}

export interface RaiseImpact {
  readonly baseGrossAnnual: number;
  readonly baseNetAnnual: number;
  readonly baseMarginalTaxRate: number;
  readonly steps: readonly RaiseStep[];
}

export function calculateRaiseImpact(
  input: SalaryInput,
  increments: readonly number[] = RAISE_STEPS,
): RaiseImpact {
  const base = calculateSalaryBreakdown(input);

  const steps = increments.map((increment) => {
    const grossAnnual = input.grossAnnual + increment;
    const raised = calculateSalaryBreakdown({ ...input, grossAnnual });
    const netGain = raised.netAnnual - base.netAnnual;
    return {
      increment,
      grossAnnual,
      netAnnual: raised.netAnnual,
      netGain,
      keptShare: increment > 0 ? netGain / increment : 0,
      marginalTaxRate: raised.marginalTaxRate,
    };
  });

  return {
    baseGrossAnnual: input.grossAnnual,
    baseNetAnnual: base.netAnnual,
    baseMarginalTaxRate: base.marginalTaxRate,
    steps,
  };
}
