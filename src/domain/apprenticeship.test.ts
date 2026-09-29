import { describe, expect, it } from "vitest";
import { calculateApprenticeship, DEFAULT_APPRENTICESHIP_PROGRESSION } from "@/domain/index.ts";

describe("calculateApprenticeship", () => {
  it("produces a schedule with the requested number of years", () => {
    const r = calculateApprenticeship({
      targetGrossAnnual: 28_000,
      years: 3,
      progression: DEFAULT_APPRENTICESHIP_PROGRESSION,
    });
    expect(r.schedule).toHaveLength(3);
  });

  it("first year applies the first progression percentage", () => {
    const r = calculateApprenticeship({
      targetGrossAnnual: 28_000,
      years: 3,
      progression: DEFAULT_APPRENTICESHIP_PROGRESSION,
    });
    expect(r.schedule[0]?.percentageOfTarget).toBe(0.85);
    expect(r.schedule[0]?.grossAnnual).toBeCloseTo(28_000 * 0.85, 2);
  });

  it("clamps years to the 1-5 range", () => {
    expect(
      calculateApprenticeship({
        targetGrossAnnual: 28_000,
        years: 10,
        progression: DEFAULT_APPRENTICESHIP_PROGRESSION,
      }).years,
    ).toBe(5);
    expect(
      calculateApprenticeship({
        targetGrossAnnual: 28_000,
        years: 0,
        progression: DEFAULT_APPRENTICESHIP_PROGRESSION,
      }).years,
    ).toBe(1);
  });

  it("falls back to the last progression entry if asked for more years than entries", () => {
    const r = calculateApprenticeship({
      targetGrossAnnual: 30_000,
      years: 5,
      progression: [0.8, 0.9],
    });
    expect(r.schedule[4]?.percentageOfTarget).toBe(0.9);
  });
});
