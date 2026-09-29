import { describe, expect, it } from "vitest";
import { findComune, loadRegionComuni } from "@/data/index.ts";
import { calculateSalaryBreakdown } from "@/domain/composer.ts";
import { calculateInverseSalary } from "@/domain/inverseSalary.ts";
import { computeInverse } from "./compute.ts";
import { checkInverse, inverseDefaults, type InverseState } from "./state.ts";

const IT = inverseDefaults("it");
const MILANO = findComune(await loadRegionComuni("lombardia"), "F205") ?? null;

function valuesOf(patch: Partial<InverseState>) {
  const { values } = checkInverse({ ...IT, ...patch }, "it");
  if (values === null) throw new Error("expected valid values");
  return values;
}

describe("computeInverse", () => {
  it("settles on the lowest gross, to the cent, whose net reaches the target", () => {
    const result = computeInverse(valuesOf({}), null);
    const context = {
      taxYear: 2026,
      regionCode: "lombardia",
      municipalTaxRate: 0.008,
      contractType: "indeterminato",
      paymentFrequency: 13,
      companySize: "small",
      isPublicEmployee: false,
    } as const;
    const solved = calculateInverseSalary({ targetNetAnnual: 24_000, other: context });
    expect(result.converged).toBe(true);
    expect(Math.round(result.grossAnnual * 100)).toBe(result.grossAnnual * 100);
    expect(Math.abs(result.grossAnnual - solved.grossAnnual)).toBeLessThan(2);
    expect(result.breakdown).toEqual(
      calculateSalaryBreakdown({ ...context, grossAnnual: result.grossAnnual }),
    );
    expect(result.breakdown.netAnnual).toBeGreaterThanOrEqual(24_000);
    expect(result.breakdown.netAnnual - 24_000).toBeLessThan(0.05);
    const oneCentLess = calculateSalaryBreakdown({
      ...context,
      grossAnnual: (result.grossAnnual * 100 - 1) / 100,
    });
    expect(oneCentLess.netAnnual).toBeLessThan(24_000);
  });

  it("passes the form's choices to the solver", () => {
    const result = computeInverse(
      valuesOf({
        targetNetAnnual: "30.000",
        year: 2025,
        region: "lazio",
        municipalRate: "0,9",
        paymentFrequency: 14,
        contractType: "apprendistato",
        companySize: "large",
        isPublicEmployee: true,
      }),
      null,
    );
    expect(result.context).toEqual({
      taxYear: 2025,
      regionCode: "lazio",
      municipalTaxRate: 0.009,
      contractType: "apprendistato",
      paymentFrequency: 14,
      companySize: "large",
      isPublicEmployee: true,
    });
    expect(
      Math.abs(
        result.grossAnnual -
          calculateInverseSalary({ targetNetAnnual: 30_000, other: result.context }).grossAnnual,
      ),
    ).toBeLessThan(2);
    expect(result.breakdown.netAnnual).toBeGreaterThanOrEqual(30_000);
  });

  it("uses the comune's rule once it is loaded", () => {
    const manual = computeInverse(valuesOf({ comune: "F205" }), null);
    const milano = computeInverse(valuesOf({ comune: "F205" }), MILANO);
    expect(manual.municipal).toEqual({ kind: "manual", rate: 0.008 });
    expect(milano.municipal).toMatchObject({ kind: "comune", ruleYear: 2025 });
    expect(milano.context.municipalTaxRate).toEqual({ rate: 0.8, exemption: 23_000 });
    expect(Math.abs(milano.breakdown.netAnnual - 24_000)).toBeLessThanOrEqual(0.5);
  });
});
