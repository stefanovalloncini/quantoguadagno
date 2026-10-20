import { calculateSalaryBreakdown, type SalaryBreakdown, type SalaryInput } from "./composer.ts";

export interface InverseSalaryInput {
  readonly targetNetAnnual: number;
  /** All non-grossAnnual fields are used; grossAnnual is ignored. */
  readonly other: Omit<SalaryInput, "grossAnnual">;
}

export interface InverseSalaryResult {
  readonly grossAnnual: number;
  readonly breakdown: SalaryBreakdown;
  readonly converged: boolean;
  readonly iterations: number;
}

const TOLERANCE_EUR = 0.5;
const MAX_GROSS = 1_000_000;
const MIN_STEP = 10;
const CENT = 0.01;
// Net pay never rises faster than gross pay, except for a few small upward steps (the cuneo
// switching from somma integrativa to detrazione at 20.000 EUR, some regional deductions).
// This allowance covers their sum with room to spare.
const UPWARD_STEPS_ALLOWANCE = 500;

/**
 * Find the smallest gross annual salary whose net reaches the target.
 *
 * Net pay is not monotonic in gross pay: losing the trattamento integrativo or crossing a
 * municipal exemption makes it drop for a stretch, so plain bisection could settle past a drop
 * and ask for more than needed. We walk up from zero instead, skipping stretches too short to
 * close the gap to the target, then narrow the last step down to the cent.
 */
export function calculateInverseSalary(input: InverseSalaryInput): InverseSalaryResult {
  const target = Math.max(0, input.targetNetAnnual);
  let iterations = 0;
  const netAt = (grossAnnual: number): SalaryBreakdown => {
    iterations += 1;
    return calculateSalaryBreakdown({ ...input.other, grossAnnual });
  };

  const ceiling = netAt(MAX_GROSS);
  if (ceiling.netAnnual < target) {
    return { grossAnnual: MAX_GROSS, breakdown: ceiling, converged: false, iterations };
  }

  let below = 0;
  let above = 0;
  let breakdown = netAt(above);
  while (breakdown.netAnnual < target) {
    const gap = target - breakdown.netAnnual;
    below = above;
    above = Math.min(MAX_GROSS, above + Math.max(MIN_STEP, gap - UPWARD_STEPS_ALLOWANCE));
    breakdown = above === MAX_GROSS ? ceiling : netAt(above);
  }
  if (above === 0) {
    return { grossAnnual: 0, breakdown, converged: true, iterations };
  }

  while (above - below > CENT) {
    const mid = Math.round(((below + above) / 2) * 100) / 100;
    if (mid <= below || mid >= above) break;
    const candidate = netAt(mid);
    if (candidate.netAnnual >= target) {
      above = mid;
      breakdown = candidate;
    } else {
      below = mid;
    }
  }

  return {
    grossAnnual: above,
    breakdown,
    converged: breakdown.netAnnual - target <= TOLERANCE_EUR,
    iterations,
  };
}
