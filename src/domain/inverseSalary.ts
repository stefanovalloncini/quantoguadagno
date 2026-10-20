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
const STEP = 10;
const UNIT = 1;
const CENT = 0.01;
const HALF_CENT = CENT / 2;
// Between two gross amounts net pay rises by less than the distance between them, except where
// it jumps. The biggest jump up is the trattamento integrativo switching on (1.200 EUR) once IRPEF
// lorda exceeds the work deduction; this allowance covers it and the small regional steps.
const LARGEST_UPWARD_JUMP = 2_000;

interface Point {
  readonly gross: number;
  readonly breakdown: SalaryBreakdown;
}

function toCent(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Find the smallest gross annual salary whose net reaches the target.
 *
 * Net pay is not monotonic in gross pay: it drops where the trattamento integrativo or the
 * 2024 contribution cut stop, or where a municipal exemption ends, and it jumps up where the
 * trattamento integrativo starts. Far from the target we skip stretches too short to close the
 * gap even with that jump. Near it we walk in short steps and, wherever net drops within a
 * step, also try the highest point just before the drop, so a narrow peak above the target is
 * not missed.
 */
export function calculateInverseSalary(input: InverseSalaryInput): InverseSalaryResult {
  const target = Math.max(0, input.targetNetAnnual);
  let iterations = 0;
  const at = (gross: number): Point => {
    iterations += 1;
    return { gross, breakdown: calculateSalaryBreakdown({ ...input.other, grossAnnual: gross }) };
  };
  const reaches = (point: Point) => point.breakdown.netAnnual >= target;
  const result = (point: Point): InverseSalaryResult => ({
    grossAnnual: point.gross,
    breakdown: point.breakdown,
    converged: point.breakdown.netAnnual - target <= TOLERANCE_EUR,
    iterations,
  });

  // The first point that reaches the target in (low, high], when net rises steadily in between.
  const settle = (low: Point, high: Point): Point => {
    let below = low;
    let above = high;
    while (above.gross - below.gross > CENT) {
      const mid = toCent((below.gross + above.gross) / 2);
      if (mid <= below.gross || mid >= above.gross) break;
      const point = at(mid);
      if (reaches(point)) above = point;
      else below = point;
    }
    return above;
  };

  // The last point before net falls below where it stood at low.
  const lastBeforeDrop = (low: Point, high: Point): Point => {
    const level = low.breakdown.netAnnual;
    let before = low;
    let after = high;
    while (after.gross - before.gross > CENT) {
      const mid = toCent((before.gross + after.gross) / 2);
      if (mid <= before.gross || mid >= after.gross) break;
      const point = at(mid);
      if (point.breakdown.netAnnual >= level) before = point;
      else after = point;
    }
    return before;
  };

  // The first point in (low, high] that reaches the target, euro by euro.
  const firstWithin = (low: Point, high: Point): Point | null => {
    if (reaches(high)) {
      if (high.gross - low.gross <= UNIT + HALF_CENT) return settle(low, high);
      let from = low;
      for (let gross = low.gross + UNIT; gross < high.gross - HALF_CENT; gross += UNIT) {
        const to = at(toCent(gross));
        const found = firstWithin(from, to);
        if (found !== null) return found;
        from = to;
      }
      return firstWithin(from, high);
    }
    if (high.breakdown.netAnnual < low.breakdown.netAnnual) {
      const top = lastBeforeDrop(low, high);
      if (reaches(top)) return settle(low, top);
    }
    return null;
  };

  const ceiling = at(MAX_GROSS);
  if (!reaches(ceiling)) return { ...result(ceiling), converged: false };

  let low = at(0);
  if (reaches(low)) return result(low);
  while (low.gross < MAX_GROSS) {
    const safe = target - low.breakdown.netAnnual - LARGEST_UPWARD_JUMP;
    if (safe >= STEP) {
      const gross = Math.min(MAX_GROSS, toCent(low.gross + safe));
      low = gross === MAX_GROSS ? ceiling : at(gross);
      if (reaches(low)) return result(low);
      continue;
    }
    const gross = Math.min(MAX_GROSS, toCent(low.gross + STEP));
    const high = gross === MAX_GROSS ? ceiling : at(gross);
    const found = firstWithin(low, high);
    if (found !== null) return result(found);
    low = high;
  }
  return result(ceiling);
}
