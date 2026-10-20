import { describe, expect, it } from "vitest";
import { SUPPORTED_YEARS } from "@/data/index.ts";
import { calculateSelfEmployedDeduction } from "./selfEmployedDeduction.ts";
import { getTaxConfig } from "./taxConfig.ts";

const cfg = getTaxConfig(2026).selfEmployedDeduction;

describe("detrazione per lavoro autonomo e impresa minore (art. 13 c. 5 TUIR)", () => {
  it.each([
    [1, 1265],
    [5_500, 1265],
    [6_000, 1247.94],
    [16_000, 957.97],
    [28_000, 500],
    [35_000, 340.9],
    [40_000, 227.25],
    [50_000, 0],
    [60_000, 0],
  ])("con reddito complessivo %d € vale %d €", (income, expected) => {
    expect(calculateSelfEmployedDeduction(income, cfg)).toBe(expected);
  });

  it("non spetta senza reddito", () => {
    expect(calculateSelfEmployedDeduction(0, cfg)).toBe(0);
    expect(calculateSelfEmployedDeduction(-3_000, cfg)).toBe(0);
  });

  it("tronca il quoziente alla quarta cifra decimale invece di arrotondarlo", () => {
    // (28.000 − 16.000) / 22.500 = 0,53333…: 765 × 0,5333 = 407,97, non 408,00
    expect(calculateSelfEmployedDeduction(16_000, cfg)).toBe(957.97);
    // (50.000 − 49.999,99) / 22.000 = 0,00000045…: le prime quattro cifre sono zero
    expect(calculateSelfEmployedDeduction(49_999.99, cfg)).toBe(0);
    // (28.000 − 5.500,01) / 22.500 = 0,99999…: resta 0,9999
    expect(calculateSelfEmployedDeduction(5_500.01, cfg)).toBe(1264.92);
  });

  it("aggiunge 50 € oltre 11.000 € e fino a 17.000 € compresi", () => {
    expect(calculateSelfEmployedDeduction(11_000, cfg)).toBe(1077.96);
    expect(calculateSelfEmployedDeduction(11_000.01, cfg)).toBe(1127.96);
    expect(calculateSelfEmployedDeduction(17_000, cfg)).toBe(923.93);
    expect(calculateSelfEmployedDeduction(17_000.01, cfg)).toBe(873.93);
  });

  it("scende senza salti dove cambiano le formule", () => {
    for (const year of SUPPORTED_YEARS) {
      const yearly = getTaxConfig(year).selfEmployedDeduction;
      expect(calculateSelfEmployedDeduction(5_500, yearly)).toBe(1265);
      expect(calculateSelfEmployedDeduction(28_000, yearly)).toBe(500);
      expect(calculateSelfEmployedDeduction(28_000.01, yearly)).toBe(499.95);
    }
  });
});
