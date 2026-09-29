import { describe, it, expect } from "vitest";
import {
  adjustValueAcrossYears,
  cumulativeInflation,
  frozenSalaryRealValue,
  raiseNeededToKeepPace,
} from "./inflation.ts";

describe("adjustValueAcrossYears", () => {
  it("returns the nominal value unchanged when the two years coincide", () => {
    const result = adjustValueAcrossYears(30_000, 2024, 2024);
    expect(result?.nominal).toBe(30_000);
    expect(result?.adjusted).toBe(30_000);
    expect(result?.factor).toBe(1);
  });

  it("inflates a 2020 wage forward to 2026", () => {
    const result = adjustValueAcrossYears(30_000, 2020, 2026);
    expect(result).not.toBeNull();
    // FOI 2020 = 102.4, FOI 2026 = 124.1 → factor ~ 1.2119
    if (result === null) return;
    expect(result.factor).toBeGreaterThan(1.2);
    expect(result.factor).toBeLessThan(1.23);
    expect(result.adjusted).toBeGreaterThan(36_000);
    expect(result.adjusted).toBeLessThan(37_000);
  });

  it("deflates a 2026 wage back to 2020", () => {
    const result = adjustValueAcrossYears(30_000, 2026, 2020);
    expect(result).not.toBeNull();
    if (result === null) return;
    expect(result.factor).toBeLessThan(1);
    expect(result.adjusted).toBeLessThan(30_000);
  });

  it("returns null when the from-year is missing", () => {
    expect(adjustValueAcrossYears(30_000, 1999, 2026)).toBeNull();
  });

  it("returns null when the to-year is missing", () => {
    expect(adjustValueAcrossYears(30_000, 2020, 2030)).toBeNull();
  });
});

describe("cumulativeInflation", () => {
  it("returns 0 when years coincide", () => {
    expect(cumulativeInflation(2024, 2024)).toBe(0);
  });

  it("returns a positive number when inflation occurred", () => {
    const rate = cumulativeInflation(2020, 2024);
    expect(rate).not.toBeNull();
    if (rate === null) return;
    expect(rate).toBeGreaterThan(0.15);
  });

  it("returns null for missing years", () => {
    expect(cumulativeInflation(1990, 2026)).toBeNull();
  });
});

// FOI, base 2015 = 100: 2020 = 102,4  2021 = 104,2  2022 = 112,5
//                       2023 = 118,6  2024 = 119,7  2025 = 121,4  2026 = 124,1
describe("raiseNeededToKeepPace", () => {
  it("asks for the raise that restores the 2020 purchasing power in 2026", () => {
    // 124,1 / 102,4 = 1,2119140625
    const result = raiseNeededToKeepPace(30_000, 2020, 2026);
    expect(result).not.toBeNull();
    if (result === null) return;
    expect(result.grossNeeded).toBeCloseTo(36_357.42, 2);
    expect(result.raiseAmount).toBeCloseTo(6_357.42, 2);
    expect(result.raisePercent).toBeCloseTo(0.2119140625, 8);
  });

  it("works over a shorter span", () => {
    // 124,1 / 112,5 = 1,1031111111111112
    const result = raiseNeededToKeepPace(25_000, 2022, 2026);
    expect(result?.grossNeeded).toBeCloseTo(27_577.78, 2);
    expect(result?.raiseAmount).toBeCloseTo(2_577.78, 2);
    expect(result?.raisePercent).toBeCloseTo(0.1031111111, 8);
  });

  it("asks for nothing when the two years coincide", () => {
    const result = raiseNeededToKeepPace(30_000, 2026, 2026);
    expect(result?.grossNeeded).toBe(30_000);
    expect(result?.raiseAmount).toBe(0);
    expect(result?.raisePercent).toBe(0);
  });

  it("returns null when a year is outside the series", () => {
    expect(raiseNeededToKeepPace(30_000, 1999, 2026)).toBeNull();
    expect(raiseNeededToKeepPace(30_000, 2020, 2031)).toBeNull();
  });
});

describe("frozenSalaryRealValue", () => {
  it("walks the FOI series year by year from the starting year", () => {
    const result = frozenSalaryRealValue(30_000, 2021, 5);
    expect(result).not.toBeNull();
    if (result === null) return;

    expect(result.years.map((y) => y.year)).toEqual([2021, 2022, 2023, 2024, 2025, 2026]);
    expect(result.years[0]?.realValue).toBe(30_000);
    expect(result.years[0]?.loss).toBe(0);
    expect(result.years[1]?.realValue).toBeCloseTo(27_786.67, 2);
    expect(result.years[1]?.loss).toBeCloseTo(2_213.33, 2);
    expect(result.years[2]?.realValue).toBeCloseTo(26_357.5, 2);
    expect(result.years[3]?.realValue).toBeCloseTo(26_115.29, 2);
    expect(result.years[4]?.realValue).toBeCloseTo(25_749.59, 2);
    expect(result.years[5]?.realValue).toBeCloseTo(25_189.36, 2);
    expect(result.years[5]?.lossRate).toBeCloseTo(0.160354553, 8);
  });

  it("stops at the last year the series covers instead of extrapolating", () => {
    const result = frozenSalaryRealValue(40_000, 2023, 5);
    expect(result).not.toBeNull();
    if (result === null) return;

    expect(result.years.map((y) => y.year)).toEqual([2023, 2024, 2025, 2026]);
    expect(result.lastYear).toBe(2026);
    expect(result.truncated).toBe(true);
    expect(result.years[1]?.realValue).toBeCloseTo(39_632.41, 2);
    expect(result.years[2]?.realValue).toBeCloseTo(39_077.43, 2);
    expect(result.years[3]?.realValue).toBeCloseTo(38_227.24, 2);
  });

  it("is not truncated when the horizon lands on the last covered year", () => {
    const result = frozenSalaryRealValue(30_000, 2021, 5);
    expect(result?.truncated).toBe(false);
    expect(result?.lastYear).toBe(2026);
  });

  it("returns null when the starting year is outside the series", () => {
    expect(frozenSalaryRealValue(30_000, 1999, 5)).toBeNull();
  });

  it("returns the starting year alone for a zero-year horizon", () => {
    const result = frozenSalaryRealValue(30_000, 2021, 0);
    expect(result?.years).toHaveLength(1);
    expect(result?.truncated).toBe(false);
  });
});
