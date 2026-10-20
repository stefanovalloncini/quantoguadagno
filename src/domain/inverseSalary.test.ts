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

  it("says it did not converge when no gross up to the cap reaches the target", () => {
    const r = calculateInverseSalary({ targetNetAnnual: 5_000_000, other: BASE });
    expect(r.converged).toBe(false);
  });
});
