import { describe, expect, it } from "vitest";
import {
  APPRENTICESHIP_DEFAULTS,
  MAX_TARGET_GROSS_ANNUAL,
  parseTargetGrossAnnual,
  updateTargetGrossAnnual,
  updateYears,
  validateApprenticeship,
} from "./state.ts";

describe("APPRENTICESHIP_DEFAULTS", () => {
  it("matches the OLD tool defaults (RAL 28.000, 3 years)", () => {
    expect(APPRENTICESHIP_DEFAULTS).toEqual({ targetGrossAnnual: "28000", years: 3 });
  });
});

describe("updateTargetGrossAnnual", () => {
  it("stores the raw text as typed", () => {
    const next = updateTargetGrossAnnual(APPRENTICESHIP_DEFAULTS, "35.000");
    expect(next.targetGrossAnnual).toBe("35.000");
    expect(next.years).toBe(APPRENTICESHIP_DEFAULTS.years);
  });
});

describe("updateYears", () => {
  it("replaces the years field only", () => {
    const next = updateYears(APPRENTICESHIP_DEFAULTS, 5);
    expect(next).toEqual({ ...APPRENTICESHIP_DEFAULTS, years: 5 });
  });
});

describe("parseTargetGrossAnnual", () => {
  it("parses money shorthand accepted by the shared i18n parser", () => {
    expect(
      parseTargetGrossAnnual({ ...APPRENTICESHIP_DEFAULTS, targetGrossAnnual: "35k" }, "it"),
    ).toBe(35_000);
    expect(
      parseTargetGrossAnnual({ ...APPRENTICESHIP_DEFAULTS, targetGrossAnnual: "35.5k" }, "it"),
    ).toBe(35_500);
  });

  it("returns null for unparseable text", () => {
    expect(
      parseTargetGrossAnnual({ ...APPRENTICESHIP_DEFAULTS, targetGrossAnnual: "abc" }, "it"),
    ).toBeNull();
  });
});

describe("validateApprenticeship", () => {
  it("has no errors for the defaults", () => {
    expect(validateApprenticeship(APPRENTICESHIP_DEFAULTS, "it")).toEqual({});
  });

  it("flags an unparseable target", () => {
    const state = updateTargetGrossAnnual(APPRENTICESHIP_DEFAULTS, "abc");
    expect(validateApprenticeship(state, "it").targetGrossAnnual).toEqual({
      key: "field.error.moneyRange",
      values: { min: 1, max: 1_000_000 },
    });
  });

  it("flags a target of zero or below", () => {
    const state = updateTargetGrossAnnual(APPRENTICESHIP_DEFAULTS, "0");
    expect(validateApprenticeship(state, "it").targetGrossAnnual).toEqual({
      key: "field.error.moneyRange",
      values: { min: 1, max: 1_000_000 },
    });
  });

  it("flags a target above the maximum", () => {
    const state = updateTargetGrossAnnual(
      APPRENTICESHIP_DEFAULTS,
      String(MAX_TARGET_GROSS_ANNUAL + 1),
    );
    expect(validateApprenticeship(state, "it").targetGrossAnnual).toEqual({
      key: "field.error.moneyRange",
      values: { min: 1, max: 1_000_000 },
    });
  });

  it("flags years outside 1-5", () => {
    const yearsError = { key: "field.error.integerRange", values: { min: 1, max: 5 } };
    expect(validateApprenticeship(updateYears(APPRENTICESHIP_DEFAULTS, 0), "it").years).toEqual(
      yearsError,
    );
    expect(validateApprenticeship(updateYears(APPRENTICESHIP_DEFAULTS, 6), "it").years).toEqual(
      yearsError,
    );
    expect(validateApprenticeship(updateYears(APPRENTICESHIP_DEFAULTS, 2.5), "it").years).toEqual(
      yearsError,
    );
  });
});
