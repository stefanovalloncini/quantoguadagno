import { describe, expect, it } from "vitest";
import {
  adoptField,
  DEFAULT_STATE,
  updateAnnualRate,
  updateCompoundingFrequency,
  updateContribution,
  updateContributionFrequency,
  updateInflationRate,
  updatePrincipal,
  updateYears,
  validate,
  type CompoundInterestState,
} from "./state.ts";

describe("DEFAULT_STATE", () => {
  it("matches the values the old tool started with", () => {
    expect(DEFAULT_STATE).toEqual({
      principal: 10_000,
      annualRate: 0.05,
      years: 20,
      contribution: 200,
      contributionFrequency: "monthly",
      compoundingFrequency: "monthly",
      inflationRate: 0.02,
    });
  });
});

describe("pure updaters", () => {
  it("only change the targeted field", () => {
    expect(updatePrincipal(DEFAULT_STATE, 50_000)).toEqual({ ...DEFAULT_STATE, principal: 50_000 });
    expect(updateAnnualRate(DEFAULT_STATE, 0.08)).toEqual({ ...DEFAULT_STATE, annualRate: 0.08 });
    expect(updateYears(DEFAULT_STATE, 10)).toEqual({ ...DEFAULT_STATE, years: 10 });
    expect(updateContribution(DEFAULT_STATE, 500)).toEqual({
      ...DEFAULT_STATE,
      contribution: 500,
    });
    expect(updateContributionFrequency(DEFAULT_STATE, "yearly")).toEqual({
      ...DEFAULT_STATE,
      contributionFrequency: "yearly",
    });
    expect(updateCompoundingFrequency(DEFAULT_STATE, "daily")).toEqual({
      ...DEFAULT_STATE,
      compoundingFrequency: "daily",
    });
    expect(updateInflationRate(DEFAULT_STATE, 0.03)).toEqual({
      ...DEFAULT_STATE,
      inflationRate: 0.03,
    });
  });

  it("do not mutate the input state", () => {
    const before = { ...DEFAULT_STATE };
    updatePrincipal(DEFAULT_STATE, 1);
    expect(DEFAULT_STATE).toEqual(before);
  });
});

describe("validate", () => {
  it("returns no errors for the defaults", () => {
    expect(validate(DEFAULT_STATE)).toEqual({});
  });

  it("flags a principal outside 0..10,000,000", () => {
    expect(validate({ ...DEFAULT_STATE, principal: -1 })).toHaveProperty("principal");
    expect(validate({ ...DEFAULT_STATE, principal: 10_000_001 })).toHaveProperty("principal");
    expect(validate({ ...DEFAULT_STATE, principal: Number.NaN })).toHaveProperty("principal");
    expect(validate({ ...DEFAULT_STATE, principal: 0 })).toEqual({});
  });

  it("flags a contribution outside 0..1,000,000", () => {
    expect(validate({ ...DEFAULT_STATE, contribution: -1 })).toHaveProperty("contribution");
    expect(validate({ ...DEFAULT_STATE, contribution: 1_000_001 })).toHaveProperty("contribution");
  });

  it("flags years outside 1..60 or non-integer years", () => {
    expect(validate({ ...DEFAULT_STATE, years: 0 })).toHaveProperty("years");
    expect(validate({ ...DEFAULT_STATE, years: 61 })).toHaveProperty("years");
    expect(validate({ ...DEFAULT_STATE, years: 5.5 })).toHaveProperty("years");
    expect(validate({ ...DEFAULT_STATE, years: 1 })).toEqual({});
    expect(validate({ ...DEFAULT_STATE, years: 60 })).toEqual({});
  });

  it("flags an annual rate outside 0%..50%", () => {
    expect(validate({ ...DEFAULT_STATE, annualRate: -0.01 })).toHaveProperty("annualRate");
    expect(validate({ ...DEFAULT_STATE, annualRate: 0.51 })).toHaveProperty("annualRate");
  });

  it("flags an inflation rate outside 0%..20%", () => {
    expect(validate({ ...DEFAULT_STATE, inflationRate: -0.01 })).toHaveProperty("inflationRate");
    expect(validate({ ...DEFAULT_STATE, inflationRate: 0.21 })).toHaveProperty("inflationRate");
  });
});

describe("adoptField", () => {
  const base: CompoundInterestState = DEFAULT_STATE;

  it("parses a money field with parseMoneyInput, locale-aware", () => {
    expect(adoptField(base, "principal", "35.000", "it").principal).toBe(35_000);
    expect(adoptField(base, "principal", "35k", "it").principal).toBe(35_000);
    expect(adoptField(base, "contribution", "1,5k", "en").contribution).toBe(1_500);
  });

  it("keeps the previous value when a money field cannot be parsed", () => {
    expect(adoptField(base, "principal", "abc", "it")).toEqual(base);
  });

  it("parses percent fields as plain numbers divided by 100", () => {
    expect(adoptField(base, "annualRate", "8", "it").annualRate).toBeCloseTo(0.08);
    expect(adoptField(base, "inflationRate", "3.5", "en").inflationRate).toBeCloseTo(0.035);
  });

  it("parses a percent field with the Italian decimal comma", () => {
    expect(adoptField(base, "annualRate", "0,8", "it").annualRate).toBeCloseTo(0.008);
    expect(adoptField(base, "inflationRate", "3,5", "it").inflationRate).toBeCloseTo(0.035);
  });

  it("keeps the previous value when a percent field is not a number", () => {
    expect(adoptField(base, "annualRate", "abc", "it")).toEqual(base);
  });

  it("adopts a valid contribution and compounding frequency", () => {
    expect(adoptField(base, "contributionFrequency", "yearly", "it").contributionFrequency).toBe(
      "yearly",
    );
    expect(adoptField(base, "compoundingFrequency", "daily", "it").compoundingFrequency).toBe(
      "daily",
    );
  });

  it("ignores an invalid enum value", () => {
    expect(adoptField(base, "contributionFrequency", "bogus", "it")).toEqual(base);
    expect(adoptField(base, "compoundingFrequency", "bogus", "it")).toEqual(base);
  });

  it("ignores an unknown field name", () => {
    expect(adoptField(base, "somethingElse", "1", "it")).toEqual(base);
  });

  it("parses years as a plain integer", () => {
    expect(adoptField(base, "years", "15", "it").years).toBe(15);
  });
});
