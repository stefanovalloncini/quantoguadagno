import { describe, expect, it } from "vitest";
import { findComune, loadRegionComuni } from "@/data/index.ts";
import { computeEmployee } from "@/islands/home/compute.ts";
import { checkEmployee, employeeDefaults } from "@/islands/home/state.ts";
import { computeOffer } from "./compute.ts";
import { checkComparison, comparisonDefaults, setCondition, setOffer } from "./state.ts";

const MILANO = findComune(await loadRegionComuni("lombardia"), "F205") ?? null;

function offerValues(gross: string, count: 13 | 14, comune: string | null = null) {
  let state = setOffer(comparisonDefaults("it"), "a", "gross", gross);
  state = setOffer(state, "a", "paymentFrequency", count);
  state = setCondition(state, "comune", comune);
  const values = checkComparison(state, "it").offers.a;
  if (values === null) throw new Error("expected a valid offer");
  return values;
}

describe("computeOffer", () => {
  it("computes an offer exactly as the home calculator would", () => {
    const home = checkEmployee(
      { ...employeeDefaults("it"), gross: "38.000", paymentFrequency: 14 },
      "it",
    ).values;
    if (home === null) throw new Error("expected valid home values");
    expect(computeOffer(offerValues("38.000", 14), null)?.breakdown).toEqual(
      computeEmployee(home, null).breakdown,
    );
  });

  it("gives the reference figures of the approved boards", () => {
    expect(computeOffer(offerValues("35.000", 13), MILANO)?.breakdown.netAnnual).toBe(26_032.21);
    const b = computeOffer(offerValues("38.000", 14, "F205"), MILANO);
    expect(b?.breakdown.netAnnual).toBe(27_238.87);
    expect(b?.breakdown.netMonthly).toBe(1_945.63);
    expect(b?.municipal).toMatchObject({ kind: "comune", ruleYear: 2025 });
    expect(computeOffer(offerValues("35.000", 14), null)?.breakdown.netMonthly).toBe(1_859.44);
  });

  it("uses the comune's exemption once its rule is loaded", () => {
    const low = offerValues("22.000", 13, "F205");
    expect(computeOffer(low, MILANO)?.breakdown.municipalTax).toBe(0);
    expect(computeOffer(low, null)?.breakdown.municipalTax).toBeGreaterThan(0);
  });

  it("has no result for an offer it cannot compute", () => {
    expect(computeOffer(null, null)).toBeNull();
  });
});
