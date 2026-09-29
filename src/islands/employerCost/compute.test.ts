import { describe, expect, it } from "vitest";
import { findComune, loadRegionComuni } from "@/data/index.ts";
import { calculateSalaryBreakdown } from "@/domain/composer.ts";
import { computeEmployerCost } from "./compute.ts";
import type { EmployerCostValues } from "./state.ts";

const MILANO = findComune(await loadRegionComuni("lombardia"), "F205") ?? null;

const VALUES: EmployerCostValues = {
  grossAnnual: 35_000,
  taxYear: 2025,
  contractType: "determinato",
  regionCode: "lombardia",
  comune: null,
  municipalRate: 0.008,
  paymentFrequency: 13,
};

describe("computeEmployerCost", () => {
  it("prices the gross with the same local taxes and mensilità as the employee calculator", () => {
    const result = computeEmployerCost(VALUES, null);
    const input = {
      grossAnnual: 35_000,
      taxYear: 2025,
      regionCode: "lombardia",
      municipalTaxRate: 0.008,
      contractType: "determinato",
      paymentFrequency: 13,
    } as const;
    expect(result.input).toEqual(input);
    expect(result.breakdown).toEqual(calculateSalaryBreakdown(input));
    expect(result.values).toBe(VALUES);
    expect(result.municipal).toEqual({ kind: "manual", rate: 0.008 });
  });

  it("keeps the company cost independent of where the employee lives", () => {
    const lombardia = computeEmployerCost(VALUES, null);
    const lazio = computeEmployerCost(
      { ...VALUES, regionCode: "lazio", municipalRate: 0, paymentFrequency: 14 },
      null,
    );
    expect(lazio.breakdown.totalEmployerCost).toBe(lombardia.breakdown.totalEmployerCost);
    expect(lazio.breakdown.netAnnual).not.toBe(lombardia.breakdown.netAnnual);
  });

  it("uses the comune's rule once it is loaded", () => {
    const manual = computeEmployerCost({ ...VALUES, comune: "F205" }, null);
    const milano = computeEmployerCost({ ...VALUES, comune: "F205" }, MILANO);
    expect(manual.municipal).toEqual({ kind: "manual", rate: 0.008 });
    expect(milano.municipal).toMatchObject({ kind: "comune", ruleYear: 2025 });
    expect(milano.input.municipalTaxRate).toEqual({ rate: 0.8, exemption: 23_000 });
  });

  it("charges the apprentice employer rate", () => {
    const apprentice = computeEmployerCost(
      { ...VALUES, grossAnnual: 30_000, taxYear: 2026, contractType: "apprendistato" },
      null,
    );
    const permanent = computeEmployerCost(
      { ...VALUES, grossAnnual: 30_000, taxYear: 2026, contractType: "indeterminato" },
      null,
    );
    expect(apprentice.breakdown.employerInpsRate).toBe(0.1181);
    expect(permanent.breakdown.employerInpsRate).toBe(0.2381);
    expect(apprentice.breakdown.totalEmployerCost).toBeLessThan(
      permanent.breakdown.totalEmployerCost,
    );
  });
});
