import { describe, expect, it } from "vitest";
import { calculateCompoundInterest } from "@/domain/compoundInterest.ts";
import { computeCompoundInterest } from "./compute.ts";
import { DEFAULT_STATE } from "./state.ts";

describe("computeCompoundInterest", () => {
  it("matches calling the engine directly for the defaults", () => {
    expect(computeCompoundInterest(DEFAULT_STATE)).toEqual(
      calculateCompoundInterest(DEFAULT_STATE),
    );
  });

  it("matches calling the engine directly for a custom state", () => {
    const state = {
      principal: 50_000,
      annualRate: 0.08,
      years: 10,
      contribution: 500,
      contributionFrequency: "yearly" as const,
      compoundingFrequency: "daily" as const,
      inflationRate: 0.03,
    };
    expect(computeCompoundInterest(state)).toEqual(calculateCompoundInterest(state));
  });

  it("falls back to the defaults instead of propagating NaN from an unparsable field", () => {
    const result = computeCompoundInterest({ ...DEFAULT_STATE, annualRate: Number.NaN });
    expect(Number.isFinite(result.finalNominal)).toBe(true);
    expect(result).toEqual(computeCompoundInterest(DEFAULT_STATE));
  });

  it("clamps a value above its maximum instead of feeding it straight to the engine", () => {
    const result = computeCompoundInterest({ ...DEFAULT_STATE, years: 1_000 });
    expect(result.schedule).toHaveLength(61);
  });
});
