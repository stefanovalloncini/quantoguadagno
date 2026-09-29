import { describe, expect, it } from "vitest";
import { calculateApprenticeship, DEFAULT_APPRENTICESHIP_PROGRESSION } from "@/domain/index.ts";
import { computeApprenticeship } from "./compute.ts";
import { APPRENTICESHIP_DEFAULTS, updateTargetGrossAnnual, updateYears } from "./state.ts";

describe("computeApprenticeship", () => {
  it("matches calling the engine directly for the defaults", () => {
    expect(computeApprenticeship(APPRENTICESHIP_DEFAULTS, "it")).toEqual(
      calculateApprenticeship({
        targetGrossAnnual: 28_000,
        years: 3,
        progression: DEFAULT_APPRENTICESHIP_PROGRESSION,
      }),
    );
  });

  it("parses a shorthand target amount before calling the engine", () => {
    const state = updateTargetGrossAnnual(APPRENTICESHIP_DEFAULTS, "35k");
    expect(computeApprenticeship(state, "it")).toEqual(
      calculateApprenticeship({
        targetGrossAnnual: 35_000,
        years: 3,
        progression: DEFAULT_APPRENTICESHIP_PROGRESSION,
      }),
    );
  });

  it("treats unparseable text as a zero target instead of throwing", () => {
    const state = updateTargetGrossAnnual(APPRENTICESHIP_DEFAULTS, "abc");
    const result = computeApprenticeship(state, "it");
    expect(result.targetGrossAnnual).toBe(0);
    expect(result.schedule.every((row) => row.grossAnnual === 0)).toBe(true);
  });

  it("falls back to the default years when years is not a finite integer", () => {
    const state = updateYears(APPRENTICESHIP_DEFAULTS, Number.NaN);
    expect(computeApprenticeship(state, "it").years).toBe(APPRENTICESHIP_DEFAULTS.years);
  });

  it("still clamps years to 5 when a caller pushes past the maximum", () => {
    const state = updateYears(APPRENTICESHIP_DEFAULTS, 9);
    expect(computeApprenticeship(state, "it").years).toBe(5);
  });
});
