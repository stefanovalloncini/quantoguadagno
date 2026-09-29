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

const MAX_ITERATIONS = 60;
const TOLERANCE_EUR = 0.5;
const MIN_GROSS = 0;
const MAX_GROSS = 1_000_000;

/** Find the gross annual salary that produces the target net annual, via bisection. */
export function calculateInverseSalary(input: InverseSalaryInput): InverseSalaryResult {
  const target = Math.max(0, input.targetNetAnnual);

  let lo = MIN_GROSS;
  let hi = MAX_GROSS;
  let mid = (lo + hi) / 2;
  let breakdown = calculateSalaryBreakdown({ ...input.other, grossAnnual: mid });

  let i = 0;
  while (i < MAX_ITERATIONS) {
    breakdown = calculateSalaryBreakdown({ ...input.other, grossAnnual: mid });
    const diff = breakdown.netAnnual - target;
    if (Math.abs(diff) <= TOLERANCE_EUR) {
      return { grossAnnual: mid, breakdown, converged: true, iterations: i };
    }
    if (diff > 0) hi = mid;
    else lo = mid;
    mid = (lo + hi) / 2;
    i += 1;
  }

  return {
    grossAnnual: mid,
    breakdown,
    converged: false,
    iterations: i,
  };
}
