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
});
