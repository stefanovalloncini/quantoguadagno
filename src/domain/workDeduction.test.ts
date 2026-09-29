import { describe, it, expect } from "vitest";
import { calculateWorkDeduction } from "./workDeduction.ts";
import { getTaxConfig } from "./taxConfig.ts";

const CFG = getTaxConfig(2026).workDeduction;

describe("calculateWorkDeduction — detrazione lavoro dipendente (Art. 13 TUIR)", () => {
  it("reddito fino a 15.000 → detrazione massima 1.955 €", () => {
    expect(calculateWorkDeduction(12_000, CFG)).toBe(1955);
  });

  it("reddito 20.000 → 1.910 + 1.190 × (28.000−20.000)/13.000", () => {
    expect(calculateWorkDeduction(20_000, CFG)).toBeCloseTo(1910 + 1190 * (8000 / 13_000), 2);
  });

  it("reddito 30.000 → 1.910 × (50.000−30.000)/22.000 + 65 € (bonus 25k–35k)", () => {
    expect(calculateWorkDeduction(30_000, CFG)).toBeCloseTo(1910 * (20_000 / 22_000) + 65, 2);
  });

  it("reddito 35.000 → include il bonus di 65 €", () => {
    expect(calculateWorkDeduction(35_000, CFG)).toBeCloseTo(1910 * (15_000 / 22_000) + 65, 2);
  });

  it("reddito 36.000 → niente bonus (oltre 35.000)", () => {
    expect(calculateWorkDeduction(36_000, CFG)).toBeCloseTo(1910 * (14_000 / 22_000), 2);
  });

  it("reddito oltre 50.000 → 0", () => {
    expect(calculateWorkDeduction(60_000, CFG)).toBe(0);
  });

  it("reddito non positivo → 0", () => {
    expect(calculateWorkDeduction(0, CFG)).toBe(0);
  });
});
