import { describe, it, expect } from "vitest";
import { compareSalaries } from "./salaryComparison.ts";
import type { SalaryInput } from "./composerTypes.ts";

function offer(grossAnnual: number): SalaryInput {
  return { grossAnnual, taxYear: 2026, regionCode: "lombardia", municipalTaxRate: 0.008 };
}

describe("compareSalaries", () => {
  it("flags the higher-net offer as the winner", () => {
    const r = compareSalaries(offer(30_000), offer(40_000));
    expect(r.b.netAnnual).toBeGreaterThan(r.a.netAnnual);
    expect(r.winner).toBe("b");
    expect(r.netAnnualDelta).toBeCloseTo(r.b.netAnnual - r.a.netAnnual, 2);
    expect(r.netMonthlyDelta).toBeCloseTo(r.b.netMonthly - r.a.netMonthly, 2);
    expect(r.grossAnnualDelta).toBe(10_000);
  });

  it("flags offer A when it pays more", () => {
    const r = compareSalaries(offer(45_000), offer(30_000));
    expect(r.winner).toBe("a");
    expect(r.netAnnualDelta).toBeLessThan(0);
  });

  it("reports a tie for identical offers", () => {
    const r = compareSalaries(offer(35_000), offer(35_000));
    expect(r.winner).toBe("equal");
    expect(r.netAnnualDelta).toBe(0);
    expect(r.netMonthlyDelta).toBe(0);
  });
});
