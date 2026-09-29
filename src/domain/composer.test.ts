import { describe, it, expect } from "vitest";
import { calculateSalaryBreakdown, type SalaryInput } from "./composer.ts";

// Base case: 30k RAL, Toscana, 14 mensilità, 2026, comunale 0,2%.
// Same input is run through five INPS variants to lock employee contribution
// against the rates published in INPS Circolare n. 6/2026.
const BASE: SalaryInput = {
  grossAnnual: 30_000,
  taxYear: 2026,
  regionCode: "toscana",
  municipalTaxRate: 0.002,
  contractType: "indeterminato",
  paymentFrequency: 14,
};

describe("calculateSalaryBreakdown — INPS contribution by variant", () => {
  it("small company, indeterminato → 9,19% × 30.000 = 2.757 €", () => {
    const r = calculateSalaryBreakdown(BASE);
    expect(r.inpsContribution).toBe(2757);
    expect(r.inpsRate).toBeCloseTo(0.0919, 4);
  });

  it("azienda > 15 dipendenti → 9,49% × 30.000 = 2.847 €", () => {
    const r = calculateSalaryBreakdown({ ...BASE, companySize: "large" });
    expect(r.inpsContribution).toBe(2847);
    expect(r.inpsRate).toBeCloseTo(0.0949, 4);
  });

  it("dipendente pubblico → 8,80% × 30.000 = 2.640 €", () => {
    const r = calculateSalaryBreakdown({ ...BASE, isPublicEmployee: true });
    expect(r.inpsContribution).toBe(2640);
    expect(r.inpsRate).toBeCloseTo(0.088, 4);
  });

  it("apprendistato → 5,84% × 30.000 = 1.752 €", () => {
    const r = calculateSalaryBreakdown({ ...BASE, contractType: "apprendistato" });
    expect(r.inpsContribution).toBe(1752);
    expect(r.inpsRate).toBeCloseTo(0.0584, 4);
  });

  it("override → uses the provided employee rate exactly", () => {
    const r = calculateSalaryBreakdown({
      ...BASE,
      inpsOverride: { employeeRate: 0.0975, employerRate: 0.25 },
    });
    expect(r.inpsContribution).toBe(Math.round(30_000 * 0.0975));
    expect(r.inpsRate).toBeCloseTo(0.0975, 4);
    expect(r.employerInps).toBe(Math.round(30_000 * 0.25));
    expect(r.employerInpsRate).toBeCloseTo(0.25, 4);
  });
});

describe("calculateSalaryBreakdown — invariants", () => {
  it("changing companySize moves taxable income by the CIGS delta", () => {
    const small = calculateSalaryBreakdown(BASE);
    const large = calculateSalaryBreakdown({ ...BASE, companySize: "large" });
    const expectedDelta = Math.round(30_000 * 0.003);
    expect(small.inpsContribution + expectedDelta).toBe(large.inpsContribution);
    expect(small.taxableIncome - expectedDelta).toBe(large.taxableIncome);
  });

  it("override does not affect taxable income via fringe-benefits path", () => {
    const r = calculateSalaryBreakdown({
      ...BASE,
      inpsOverride: { employeeRate: 0.0919, employerRate: 0.2381 },
    });
    const base = calculateSalaryBreakdown(BASE);
    expect(r.inpsContribution).toBe(base.inpsContribution);
    expect(r.taxableIncome).toBe(base.taxableIncome);
  });

  it("netAnnual reconciles with gross minus taxes plus monetary credits", () => {
    const r = calculateSalaryBreakdown({ ...BASE, companySize: "large" });
    // Only the somma aggiuntiva and trattamento integrativo are *paid back* in cash;
    // the detrazione aggiuntiva is folded into irpefNet (already inside totalTaxes).
    const cashCredits = r.trattamentoIntegrativo + r.sommaAggiuntiva;
    expect(r.netAnnual + r.totalTaxes - cashCredits).toBe(r.grossAnnual);
  });
});

describe("calculateSalaryBreakdown — aliquota marginale", () => {
  it("BASE 30k Toscana → IRPEF 23% + Toscana 1,43% + comunale 0,2% = 24,63%", () => {
    // taxableIncome ≈ 27.243 → IRPEF bracket 0 (23%), Toscana bracket 1 (1,43%)
    const r = calculateSalaryBreakdown(BASE);
    expect(r.marginalTaxRate).toBeCloseTo(0.23 + 0.0143 + 0.002, 4);
  });

  it("40k Toscana → IRPEF 33% + Toscana 3,32% + comunale 0,2% = 36,52%", () => {
    // taxableIncome ≈ 36.324 → IRPEF bracket 1, Toscana bracket 2
    const r = calculateSalaryBreakdown({ ...BASE, grossAnnual: 40_000 });
    expect(r.marginalTaxRate).toBeCloseTo(0.33 + 0.0332 + 0.002, 4);
  });

  it("60k Toscana → IRPEF 43% + Toscana 3,33% + comunale 0,2% = 46,53%", () => {
    // taxableIncome ≈ 54.486 → IRPEF top bracket, Toscana top bracket
    const r = calculateSalaryBreakdown({ ...BASE, grossAnnual: 60_000 });
    expect(r.marginalTaxRate).toBeCloseTo(0.43 + 0.0333 + 0.002, 4);
  });

  it("Valle d'Aosta below 15k exemption → regional marginal is zero", () => {
    // taxableIncome ≈ 12.713 sits under the 15.000 soglia; only IRPEF bites.
    const r = calculateSalaryBreakdown({
      ...BASE,
      grossAnnual: 14_000,
      regionCode: "valle-daosta",
      municipalTaxRate: 0,
    });
    expect(r.marginalTaxRate).toBeCloseTo(0.23, 4);
  });

  it("Lombardia 30k, no comunale → IRPEF 23% + Lombardia 1,58%", () => {
    // taxableIncome ≈ 27.243 → Lombardia bracket 1 (15.000–28.000 = 1,58%)
    const r = calculateSalaryBreakdown({ ...BASE, regionCode: "lombardia", municipalTaxRate: 0 });
    expect(r.marginalTaxRate).toBeCloseTo(0.23 + 0.0158, 4);
  });
});
