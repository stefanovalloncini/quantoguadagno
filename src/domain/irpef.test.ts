import { describe, it, expect } from "vitest";
import { applyProgressiveBrackets, getMarginalRate } from "./irpef.ts";
import { getTaxConfig } from "./taxConfig.ts";

// Real shipped brackets: 2024 = 23/35/43, 2026 = 23/33/43 (second scaglione cut).
const BRACKETS_2024 = getTaxConfig(2024).irpefBrackets;
const BRACKETS_2026 = getTaxConfig(2026).irpefBrackets;

describe("applyProgressiveBrackets — IRPEF (Art. 11 TUIR, D.Lgs. 216/2023)", () => {
  it("taxes within the first bracket at 23%", () => {
    expect(applyProgressiveBrackets(20_000, BRACKETS_2024)).toBeCloseTo(4600, 2);
  });

  it("2024: 50.000 € → 14.140 € (28.000×23% + 22.000×35%)", () => {
    expect(applyProgressiveBrackets(50_000, BRACKETS_2024)).toBeCloseTo(14_140, 2);
  });

  it("2024: 60.000 € → 18.440 € (+ 10.000×43%)", () => {
    expect(applyProgressiveBrackets(60_000, BRACKETS_2024)).toBeCloseTo(18_440, 2);
  });

  it("2026: 40.000 € → 10.400 € (28.000×23% + 12.000×33%)", () => {
    expect(applyProgressiveBrackets(40_000, BRACKETS_2026)).toBeCloseTo(10_400, 2);
  });

  it("returns 0 for non-positive income", () => {
    expect(applyProgressiveBrackets(0, BRACKETS_2024)).toBe(0);
    expect(applyProgressiveBrackets(-5000, BRACKETS_2024)).toBe(0);
  });
});

describe("getMarginalRate", () => {
  it("returns the rate of the bracket the income falls in", () => {
    expect(getMarginalRate(20_000, BRACKETS_2024)).toBe(0.23);
    expect(getMarginalRate(40_000, BRACKETS_2024)).toBe(0.35);
    expect(getMarginalRate(80_000, BRACKETS_2024)).toBe(0.43);
  });

  it("reflects the 2026 second-bracket cut to 33%", () => {
    expect(getMarginalRate(40_000, BRACKETS_2026)).toBe(0.33);
  });

  it("falls back to the last bracket's rate when income clears every bounded bracket", () => {
    const bounded = [
      { min: 0, max: 1000, rate: 0.1 },
      { min: 1000, max: 2000, rate: 0.2 },
    ];
    expect(getMarginalRate(5000, bounded)).toBe(0.2);
  });

  it("returns 0 for an empty bracket set", () => {
    expect(getMarginalRate(5000, [])).toBe(0);
  });
});
