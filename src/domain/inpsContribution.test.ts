import { describe, it, expect } from "vitest";
import { calculateEmployeeInps } from "./inpsContribution.ts";
import type { SalaryInput } from "./composerTypes.ts";
import { getTaxConfig } from "./taxConfig.ts";

const input = (overrides: Partial<SalaryInput> = {}): SalaryInput => ({
  grossAnnual: 30_000,
  taxYear: 2026,
  regionCode: "lombardia",
  municipalTaxRate: 0.008,
  ...overrides,
});

describe("calculateEmployeeInps", () => {
  it("applies the standard 9,19% rate below the ceiling (2026, no esonero)", () => {
    const r = calculateEmployeeInps(30_000, input(), getTaxConfig(2026));
    expect(r.standardRate).toBeCloseTo(0.0919, 4);
    expect(r.exemption).toBe(0);
    expect(r.contribution).toBeCloseTo(30_000 * 0.0919, 2);
    expect(r.effectiveRate).toBeCloseTo(0.0919, 4);
  });

  it("charges the higher rate on the slice above the pension ceiling", () => {
    const r = calculateEmployeeInps(80_000, input({ grossAnnual: 80_000 }), getTaxConfig(2026));
    expect(r.effectiveRate).toBeGreaterThan(0.0919);
    expect(r.effectiveRate).toBeLessThanOrEqual(0.1019);
  });

  it("applies the 2024 esonero: 20.000 € → 1.400 € off, leaving 438 €", () => {
    const r = calculateEmployeeInps(20_000, input({ taxYear: 2024 }), getTaxConfig(2024));
    expect(r.exemption).toBeCloseTo(1400, 0);
    expect(r.contribution).toBeCloseTo(20_000 * 0.0919 - 1400, 0);
  });

  it("annualises the 2024 esonero over 12 months for 14 mensilità", () => {
    const r = calculateEmployeeInps(
      20_000,
      input({ taxYear: 2024, paymentFrequency: 14 }),
      getTaxConfig(2024),
    );
    // (20.000 / 14) × 12 = 17.142,86 → 7% = 1.200 €.
    expect(r.exemption).toBeCloseTo(1200, 0);
  });

  it("returns a zero effective rate for zero gross", () => {
    const r = calculateEmployeeInps(0, input({ grossAnnual: 0 }), getTaxConfig(2026));
    expect(r.contribution).toBe(0);
    expect(r.effectiveRate).toBe(0);
    expect(r.exemption).toBe(0);
  });
});
