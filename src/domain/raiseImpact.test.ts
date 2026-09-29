import { describe, expect, it } from "vitest";
import { calculateRaiseImpact, RAISE_STEPS } from "./raiseImpact.ts";
import type { SalaryInput } from "./composer.ts";

// Golden vectors read off calculateSalaryBreakdown for RAL 30.000, anno 2026,
// Lombardia, addizionale comunale 0,8%, 13 mensilità, tempo indeterminato,
// azienda fino a 15 dipendenti:
//   30.000 → netto 23.425,52   marginale 25,38%
//   31.000 → netto 24.005,41   marginale 35,52%
//   32.000 → netto 24.512,11   marginale 35,52%
//   35.000 → netto 26.032,21   marginale 35,52%
//   40.000 → netto 27.960,25   marginale 35,52%
const BASE: SalaryInput = {
  grossAnnual: 30_000,
  taxYear: 2026,
  regionCode: "lombardia",
  municipalTaxRate: 0.008,
  contractType: "indeterminato",
  paymentFrequency: 13,
  companySize: "small",
  isPublicEmployee: false,
};

describe("calculateRaiseImpact", () => {
  it("offers the four standard steps", () => {
    expect(RAISE_STEPS).toEqual([1_000, 2_000, 5_000, 10_000]);
    expect(calculateRaiseImpact(BASE).steps).toHaveLength(4);
  });

  it("reports the net the employee starts from", () => {
    const impact = calculateRaiseImpact(BASE);
    expect(impact.baseGrossAnnual).toBe(30_000);
    expect(impact.baseNetAnnual).toBeCloseTo(23_425.52, 2);
  });

  it("computes the new net and the net gain for each step", () => {
    const [one, two, five, ten] = calculateRaiseImpact(BASE).steps;

    expect(one?.grossAnnual).toBe(31_000);
    expect(one?.netAnnual).toBeCloseTo(24_005.41, 2);
    expect(one?.netGain).toBeCloseTo(579.89, 2);

    expect(two?.grossAnnual).toBe(32_000);
    expect(two?.netAnnual).toBeCloseTo(24_512.11, 2);
    expect(two?.netGain).toBeCloseTo(1_086.59, 2);

    expect(five?.netAnnual).toBeCloseTo(26_032.21, 2);
    expect(five?.netGain).toBeCloseTo(2_606.69, 2);

    expect(ten?.grossAnnual).toBe(40_000);
    expect(ten?.netAnnual).toBeCloseTo(27_960.25, 2);
    expect(ten?.netGain).toBeCloseTo(4_534.73, 2);
  });

  it("expresses the kept share as net gain over the raise", () => {
    const [one, , , ten] = calculateRaiseImpact(BASE).steps;
    expect(one?.keptShare).toBeCloseTo(0.57989, 5);
    expect(ten?.keptShare).toBeCloseTo(0.453473, 6);
  });

  it("reads the marginal rate at the raised income, not at the current one", () => {
    const impact = calculateRaiseImpact(BASE);
    expect(impact.baseMarginalTaxRate).toBeCloseTo(0.2538, 4);
    for (const step of impact.steps) {
      expect(step.marginalTaxRate).toBeCloseTo(0.3552, 4);
    }
  });

  it("keeps every other input in effect", () => {
    const lazio = calculateRaiseImpact({ ...BASE, regionCode: "lazio" });
    const lombardia = calculateRaiseImpact(BASE);
    expect(lazio.steps[0]?.netAnnual).not.toBeCloseTo(lombardia.steps[0]?.netAnnual ?? 0, 2);
  });

  it("accepts a custom set of steps", () => {
    const impact = calculateRaiseImpact(BASE, [1_000]);
    expect(impact.steps).toHaveLength(1);
    expect(impact.steps[0]?.increment).toBe(1_000);
  });
});
