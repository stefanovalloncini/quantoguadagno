import { describe, expect, it } from "vitest";
import { findComune, loadRegionComuni } from "@/data/index.ts";
import { calculateSalaryBreakdown } from "@/domain/composer.ts";
import { computeEmployee } from "@/islands/home/compute.ts";
import { checkEmployee } from "@/islands/home/state.ts";
import { computePayslip } from "./compute.ts";
import { payslipStateFromSearch } from "./url.ts";

const MILANO = findComune(await loadRegionComuni("lombardia"), "F205") ?? null;

describe("computePayslip", () => {
  it("computes the payslip the employee calculator shows for the same link", () => {
    const state = payslipStateFromSearch("?l=40000&y=2026", "it");
    const { values } = checkEmployee(state, "it");
    if (values === null) throw new Error("expected valid values");
    const { errors, result } = computePayslip(state, "it", null);
    expect(errors).toEqual({});
    expect(result).toEqual(computeEmployee(values, null));
    expect(result?.breakdown).toEqual(
      calculateSalaryBreakdown({
        grossAnnual: 40_000,
        taxYear: 2026,
        regionCode: "lombardia",
        municipalTaxRate: 0.008,
        contractType: "indeterminato",
        paymentFrequency: 13,
        companySize: "small",
        isPublicEmployee: false,
        insuredBefore1996: false,
        inpsOverride: null,
        dependents: null,
        expenseDeductions: null,
        fringeBenefits: null,
        specialConditions: null,
        premioRisultato: null,
      }),
    );
  });

  it("solves the gross of a link shared from the net", () => {
    const { result } = computePayslip(payslipStateFromSearch("?s=n&n=1800", "it"), "it", null);
    expect(Math.abs((result?.breakdown.netAnnual ?? 0) - 1_800 * 13)).toBeLessThan(2);
  });

  it("applies the comune's rule once it is loaded", () => {
    const state = payslipStateFromSearch("?l=22000&k=F205", "it");
    expect(computePayslip(state, "it", MILANO).result?.breakdown.municipalTax).toBe(0);
    expect(computePayslip(state, "it", null).result?.breakdown.municipalTax).toBeGreaterThan(0);
  });

  it("reports the fields of a link it cannot compute", () => {
    expect(computePayslip(payslipStateFromSearch("?c=5", "it"), "it", null)).toEqual({
      errors: {
        municipalRate: { key: "field.error.percentRange", values: { min: 0, max: 1.5 } },
      },
      result: null,
    });
  });
});
