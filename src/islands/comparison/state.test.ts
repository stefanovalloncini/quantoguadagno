import { describe, expect, it } from "vitest";
import {
  adoptField,
  checkComparison,
  comparisonDefaults,
  setCondition,
  setOffer,
} from "./state.ts";

const DEFAULTS = comparisonDefaults("it");

describe("comparisonDefaults", () => {
  it("keeps the old tool's two offers on 13 mensilità and the home conditions", () => {
    expect(DEFAULTS.offers).toEqual({
      a: { gross: "30.000", paymentFrequency: 13 },
      b: { gross: "35.000", paymentFrequency: 13 },
    });
    expect(DEFAULTS.conditions).toEqual({
      year: 2026,
      region: "lombardia",
      comune: null,
      municipalRate: "0,8",
      contractType: "indeterminato",
      isPublicEmployee: false,
      insuredBefore1996: false,
      hasSpouse: false,
      childrenOver21: "0",
      otherDependents: "0",
    });
    expect(comparisonDefaults("en").offers.b.gross).toBe("35,000");
  });
});

describe("setOffer and setCondition", () => {
  it("change one offer only", () => {
    const next = setOffer(DEFAULTS, "b", "paymentFrequency", 14);
    expect(next.offers.b.paymentFrequency).toBe(14);
    expect(next.offers.a).toBe(DEFAULTS.offers.a);
    expect(setOffer(DEFAULTS, "a", "gross", "30.000")).toBe(DEFAULTS);
  });

  it("clears the comune when the region changes, as on the home calculator", () => {
    const withComune = setCondition(DEFAULTS, "comune", "F205");
    const moved = setCondition(withComune, "region", "lazio");
    expect(moved.conditions.region).toBe("lazio");
    expect(moved.conditions.comune).toBeNull();
    expect(setCondition(DEFAULTS, "year", DEFAULTS.conditions.year)).toBe(DEFAULTS);
  });

  it("gives each offer its gross and mensilità over the shared conditions", () => {
    let state = setCondition(DEFAULTS, "hasSpouse", true);
    state = setOffer(setOffer(state, "b", "gross", "38k"), "b", "paymentFrequency", 14);
    const { offers } = checkComparison(state, "it");
    expect(offers.b).toMatchObject({
      amount: { mode: "gross", grossAnnual: 38_000 },
      paymentFrequency: 14,
      dependents: { hasSpouse: true, spouseIncome: 0, childrenOver21: 0, otherDependents: 0 },
    });
    expect(offers.a?.paymentFrequency).toBe(13);
  });
});

describe("checkComparison", () => {
  it("accepts the defaults", () => {
    const check = checkComparison(DEFAULTS, "it");
    expect(check.errors).toEqual({});
    expect(check.offers.a?.amount).toEqual({ mode: "gross", grossAnnual: 30_000 });
    expect(check.offers.b?.amount).toEqual({ mode: "gross", grossAnnual: 35_000 });
  });

  it("names the offer whose RAL is missing and keeps the other one", () => {
    const check = checkComparison(setOffer(DEFAULTS, "a", "gross", ""), "it");
    expect(check.errors).toEqual({ grossA: { key: "field.error.ral.required" } });
    expect(check.offers.a).toBeNull();
    expect(check.offers.b).not.toBeNull();
  });

  it("reports a shared field once and stops both offers", () => {
    const check = checkComparison(setCondition(DEFAULTS, "childrenOver21", "due"), "it");
    expect(check.errors).toEqual({ childrenOver21: { key: "field.error.integer" } });
    expect(check.offers).toEqual({ a: null, b: null });
  });
});

describe("adoptField", () => {
  it("adopts typed RAL, a chosen mensilità and shared conditions", () => {
    expect(adoptField(DEFAULTS, "grossB", "38k").offers.b.gross).toBe("38k");
    expect(adoptField(DEFAULTS, "paymentFrequencyB", "14").offers.b.paymentFrequency).toBe(14);
    expect(adoptField(DEFAULTS, "year", "2025").conditions.year).toBe(2025);
    expect(adoptField(DEFAULTS, "hasSpouse", true).conditions.hasSpouse).toBe(true);
  });

  it("ignores unknown names and values it cannot use", () => {
    expect(adoptField(DEFAULTS, "paymentFrequencyA", "11")).toBe(DEFAULTS);
    expect(adoptField(DEFAULTS, "grossA", true)).toBe(DEFAULTS);
    expect(adoptField(DEFAULTS, "welfare", "500")).toBe(DEFAULTS);
    expect(adoptField(DEFAULTS, "bogus", "1")).toBe(DEFAULTS);
  });
});
