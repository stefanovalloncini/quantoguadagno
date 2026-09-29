import { describe, expect, it } from "vitest";
import {
  MAX_INFLATION_RATE,
  MAX_RAL,
  MAX_YEARS,
  MIN_RAL,
  MIN_YEARS,
  TFR_DEFAULTS,
  parseRal,
  updateInflationRate,
  updateRal,
  updateYears,
  validateTfr,
} from "./state.ts";

describe("TFR_DEFAULTS", () => {
  it("matches the OLD tool defaults", () => {
    expect(TFR_DEFAULTS).toEqual({ ral: "30000", years: 10, inflationRate: 0.02 });
  });
});

describe("updaters", () => {
  it("each updater only changes its own field", () => {
    expect(updateRal(TFR_DEFAULTS, "45000")).toEqual({ ...TFR_DEFAULTS, ral: "45000" });
    expect(updateYears(TFR_DEFAULTS, 20)).toEqual({ ...TFR_DEFAULTS, years: 20 });
    expect(updateInflationRate(TFR_DEFAULTS, 0.05)).toEqual({
      ...TFR_DEFAULTS,
      inflationRate: 0.05,
    });
  });
});

describe("parseRal", () => {
  it("parses via the shared i18n money parser", () => {
    expect(parseRal(updateRal(TFR_DEFAULTS, "54.000"), "it")).toBe(54_000);
    expect(parseRal(updateRal(TFR_DEFAULTS, "54k"), "it")).toBe(54_000);
  });
});

describe("validateTfr", () => {
  it("has no errors for the defaults", () => {
    expect(validateTfr(TFR_DEFAULTS, "it")).toEqual({});
  });

  it("flags an unparseable or non-positive RAL", () => {
    const ralError = { key: "field.error.ral.range", values: { min: MIN_RAL, max: MAX_RAL } };
    expect(validateTfr(updateRal(TFR_DEFAULTS, "abc"), "it").ral).toEqual(ralError);
    expect(validateTfr(updateRal(TFR_DEFAULTS, "0"), "it").ral).toEqual(ralError);
  });

  it("flags a RAL above the maximum", () => {
    expect(validateTfr(updateRal(TFR_DEFAULTS, String(MAX_RAL + 1)), "it").ral).toEqual({
      key: "field.error.ral.range",
      values: { min: MIN_RAL, max: MAX_RAL },
    });
  });

  it("flags years outside 1-50", () => {
    const yearsError = {
      key: "field.error.integerRange",
      values: { min: MIN_YEARS, max: MAX_YEARS },
    };
    expect(validateTfr(updateYears(TFR_DEFAULTS, 0), "it").years).toEqual(yearsError);
    expect(validateTfr(updateYears(TFR_DEFAULTS, MAX_YEARS + 1), "it").years).toEqual(yearsError);
    expect(validateTfr(updateYears(TFR_DEFAULTS, 5.5), "it").years).toEqual(yearsError);
  });

  it("flags an inflation rate outside 0%-20%", () => {
    const inflationError = {
      key: "field.error.percentRange",
      values: { min: 0, max: MAX_INFLATION_RATE * 100 },
    };
    expect(validateTfr(updateInflationRate(TFR_DEFAULTS, -0.01), "it").inflationRate).toEqual(
      inflationError,
    );
    expect(
      validateTfr(updateInflationRate(TFR_DEFAULTS, MAX_INFLATION_RATE + 0.01), "it").inflationRate,
    ).toEqual(inflationError);
  });
});
