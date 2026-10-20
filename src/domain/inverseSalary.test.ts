import { describe, expect, it } from "vitest";
import { calculateInverseSalary } from "./inverseSalary.ts";
import { calculateSalaryBreakdown } from "./composer.ts";

const BASE = {
  taxYear: 2026 as const,
  regionCode: "lombardia" as const,
  municipalTaxRate: 0.008,
};

describe("calculateInverseSalary", () => {
  it("finds the gross that produces a given net (round trip)", () => {
    const grossAnnual = 30_000;
    const forward = calculateSalaryBreakdown({ ...BASE, grossAnnual });
    const inverse = calculateInverseSalary({
      targetNetAnnual: forward.netAnnual,
      other: BASE,
    });
    expect(inverse.converged).toBe(true);
    expect(Math.abs(inverse.grossAnnual - grossAnnual)).toBeLessThan(2);
    expect(Math.abs(inverse.breakdown.netAnnual - forward.netAnnual)).toBeLessThan(1);
  });

  it("returns a small gross when target net is 0", () => {
    const r = calculateInverseSalary({ targetNetAnnual: 0, other: BASE });
    expect(r.grossAnnual).toBeLessThan(500);
  });

  it("converges to a higher gross for a higher target net", () => {
    const r1 = calculateInverseSalary({ targetNetAnnual: 20_000, other: BASE });
    const r2 = calculateInverseSalary({ targetNetAnnual: 30_000, other: BASE });
    expect(r2.grossAnnual).toBeGreaterThan(r1.grossAnnual);
  });

  it("handles a target net of 40000 within tolerance", () => {
    const r = calculateInverseSalary({ targetNetAnnual: 40_000, other: BASE });
    expect(r.converged).toBe(true);
    expect(Math.abs(r.breakdown.netAnnual - 40_000)).toBeLessThan(1);
  });

  it("asks for the smallest gross when net pay drops past a threshold", () => {
    const other = { ...BASE, paymentFrequency: 13 as const };
    // Losing the trattamento integrativo at 15.000 EUR of income makes net pay fall: below that
    // point a lower gross already gives this net.
    const target = 15_150;
    const r = calculateInverseSalary({ targetNetAnnual: target, other });
    expect(r.converged).toBe(true);
    expect(r.breakdown.netAnnual).toBeGreaterThanOrEqual(target);
    expect(r.grossAnnual).toBeLessThan(16_520);
    const oneEuroLess = calculateSalaryBreakdown({ ...other, grossAnnual: r.grossAnnual - 1 });
    expect(oneEuroLess.netAnnual).toBeLessThan(target);
  });

  it.each([12_000, 22_000, 27_400, 35_000, 60_000])(
    "returns the first gross that reaches %i EUR of net",
    (target) => {
      const r = calculateInverseSalary({ targetNetAnnual: target, other: BASE });
      expect(r.converged).toBe(true);
      expect(r.breakdown.netAnnual).toBeGreaterThanOrEqual(target);
      for (
        let gross = Math.max(0, r.grossAnnual - 3_000);
        gross < r.grossAnnual - 0.5;
        gross += 5
      ) {
        expect(calculateSalaryBreakdown({ ...BASE, grossAnnual: gross }).netAnnual).toBeLessThan(
          target,
        );
      }
    },
  );

  // Each case once returned a gross past a narrow stretch where net already reached the target.
  it.each([
    { year: 2026, target: 10_200, below: 9_300 },
    { year: 2026, target: 15_190, below: 16_520 },
    { year: 2024, target: 25_996, below: 35_000 },
  ] as const)(
    "finds the narrow stretch before a drop: $target in $year",
    ({ year, target, below }) => {
      const other = { ...BASE, taxYear: year, paymentFrequency: 13 as const };
      const r = calculateInverseSalary({ targetNetAnnual: target, other });
      expect(r.breakdown.netAnnual).toBeGreaterThanOrEqual(target);
      expect(r.grossAnnual).toBeLessThan(below);
      const oneCentLess = calculateSalaryBreakdown({ ...other, grossAnnual: r.grossAnnual - 0.01 });
      expect(oneCentLess.netAnnual).toBeLessThan(target);
    },
  );

  it.each([2024, 2026] as const)(
    "is never beaten by a one-euro scan of every gross up to 70.000 EUR in %i",
    (year) => {
      const other = { ...BASE, taxYear: year, paymentFrequency: 13 as const };
      const nets: number[] = [];
      for (let gross = 0; gross <= 70_000; gross += 1) {
        nets.push(calculateSalaryBreakdown({ ...other, grossAnnual: gross }).netAnnual);
      }
      const highest = Math.max(...nets);
      for (let target = 101; target < highest; target += 89) {
        const scanned = nets.findIndex((net) => net >= target);
        const r = calculateInverseSalary({ targetNetAnnual: target, other });
        expect(r.breakdown.netAnnual).toBeGreaterThanOrEqual(target);
        expect(r.grossAnnual).toBeLessThanOrEqual(scanned + 0.05);
      }
    },
  );

  it("says it did not converge when no gross up to the cap reaches the target", () => {
    const r = calculateInverseSalary({ targetNetAnnual: 5_000_000, other: BASE });
    expect(r.converged).toBe(false);
  });
});
