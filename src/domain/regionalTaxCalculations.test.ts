import { describe, it, expect } from "vitest";
import {
  calculateRegionalTax,
  getEffectiveRegionalRate,
  getRegionalMarginalRate,
  calculateLocalTaxes,
  regionalRules,
} from "@/domain/regionalTaxCalculations.ts";
import type { RegionCode, TaxYear } from "@/data/index.ts";

const tax = (region: RegionCode, year: TaxYear, income: number) =>
  calculateRegionalTax(income, regionalRules(region, year));

describe("calculateRegionalTax", () => {
  it("applies Lombardia progressive brackets for 30k income", () => {
    // Brackets: 0–15k at 1.23%, 15k–28k at 1.58%, 28k–50k at 1.72%
    // 15000 * 0.0123 = 184.50
    // 13000 * 0.0158 = 205.40
    // 2000 * 0.0172 = 34.40
    // Total = 424.30
    expect(tax("lombardia", 2026, 30_000)).toBeCloseTo(424.3, 2);
  });

  it("returns 0 for Valle d'Aosta below exemption threshold (15k)", () => {
    expect(tax("valle-daosta", 2026, 14_999)).toBe(0);
  });

  it("returns 0 for zero income", () => {
    expect(tax("lombardia", 2026, 0)).toBe(0);
  });
});

describe("Lazio: 1,73% su tutto il reddito fino a 28.000, poi detrazione di 60 €", () => {
  it("fino a 28.000 l'aliquota è 1,73% sull'intero reddito", () => {
    expect(tax("lazio", 2026, 20_000)).toBeCloseTo(346, 2);
    expect(tax("lazio", 2026, 28_000)).toBeCloseTo(484.4, 2);
  });

  it("nel 2026 la detrazione vale tra 28.001 e 30.000", () => {
    expect(tax("lazio", 2026, 29_000)).toBeCloseTo(665.7, 2);
    expect(tax("lazio", 2026, 31_000)).toBeCloseTo(792.3, 2);
  });

  it("nel 2025 la detrazione vale fino a 35.000", () => {
    expect(tax("lazio", 2025, 31_000)).toBeCloseTo(732.3, 2);
  });
});

describe("Friuli-Venezia Giulia: 0,70% fino a 15.000, poi 1,23% sull'intero reddito", () => {
  it("non è progressiva", () => {
    expect(tax("friuli-venezia-giulia", 2026, 15_000)).toBeCloseTo(105, 2);
    expect(tax("friuli-venezia-giulia", 2026, 20_000)).toBeCloseTo(246, 2);
  });
});

describe("Umbria: dal 2025 aliquota di base fino a 28.000 e detrazione di 150 € fino a 50.000", () => {
  it("nel 2024 valgono gli scaglioni precedenti", () => {
    expect(tax("umbria", 2024, 20_000)).toBeCloseTo(265.5, 2);
  });

  it("dal 2025 fino a 28.000 si paga l'1,23% su tutto il reddito", () => {
    expect(tax("umbria", 2025, 20_000)).toBeCloseTo(246, 2);
  });

  it("dal 2025 tra 28.001 e 50.000 si toglie la detrazione di 150 €", () => {
    expect(tax("umbria", 2025, 40_000)).toBeCloseTo(876.5, 2);
    expect(tax("umbria", 2025, 60_000)).toBeCloseTo(1671.5, 2);
  });
});

describe("aliquote che cambiano da un anno all'altro", () => {
  it.each([
    ["emilia-romagna", 2024, 694],
    ["emilia-romagna", 2025, 802],
    ["emilia-romagna", 2026, 784],
    ["piemonte", 2025, 849.9],
    ["piemonte", 2026, 988.6],
    ["puglia", 2025, 581],
    ["puglia", 2026, 864],
    ["abruzzo", 2024, 692],
    ["abruzzo", 2025, 812],
  ] as const)("%s %i, reddito 40.000 → %d €", (region, year, expected) => {
    expect(tax(region, year, 40_000)).toBeCloseTo(expected, 2);
  });
});

describe("Bolzano detrazione of 430,50 euro", () => {
  // Brackets 1,23% to 50.000, 1,73% above. The detrazione comes off the tax,
  // so the surcharge is zero until the brackets produce more than 430,50,
  // which happens at exactly 430,50 / 0,0123 = 35.000 euro.
  const vectors: readonly (readonly [number, number])[] = [
    [20_000, 0],
    [35_000, 0],
    [60_000, 307.5],
    [75_000, 492],
    [90_000, 751.5],
    [95_000, 1268.5],
  ];

  for (const [income, expected] of vectors) {
    it(`charges ${String(expected)} euro on a taxable income of ${String(income)}`, () => {
      expect(tax("bolzano", 2026, income)).toBeCloseTo(expected, 2);
    });
  }

  it("adds up to 125 € more above 50.000, reached at 75.000", () => {
    const rules = regionalRules("bolzano", 2026);
    const at75 = calculateRegionalTax(75_000, rules);
    const at80 = calculateRegionalTax(80_000, rules);
    expect(at80 - at75).toBeCloseTo(5000 * 0.0173, 2);
  });

  it("in 2024 the 430,50 € applied at every income", () => {
    expect(tax("bolzano", 2024, 95_000)).toBeCloseTo(838, 2);
  });

  it("reports no marginal rate while the detrazione still covers the tax", () => {
    const rules = regionalRules("bolzano", 2026);
    expect(getRegionalMarginalRate(30_000, rules)).toBe(0);
    expect(getRegionalMarginalRate(40_000, rules)).toBeCloseTo(0.0123, 4);
    expect(getRegionalMarginalRate(80_000, rules)).toBeCloseTo(0.0173, 4);
  });
});

describe("Trento keeps its base deduction", () => {
  it("charges nothing at the threshold and the full brackets one euro above", () => {
    expect(tax("trento", 2026, 30_000)).toBe(0);
    expect(tax("trento", 2026, 30_001)).toBeCloseTo(369.01, 2);
  });
});

describe("getEffectiveRegionalRate", () => {
  it("returns 0 for zero income", () => {
    expect(getEffectiveRegionalRate(0, regionalRules("lombardia", 2026))).toBe(0);
  });

  it("returns a rate between 0 and max bracket rate for typical income", () => {
    const rate = getEffectiveRegionalRate(30_000, regionalRules("lombardia", 2026));
    expect(rate).toBeGreaterThan(0);
    expect(rate).toBeLessThan(0.0173);
  });
});

describe("getRegionalMarginalRate with a flat rate", () => {
  it("uses the flat rate inside the relief band", () => {
    expect(getRegionalMarginalRate(20_000, regionalRules("lazio", 2026))).toBeCloseTo(0.0173, 4);
    expect(getRegionalMarginalRate(40_000, regionalRules("lazio", 2026))).toBeCloseTo(0.0333, 4);
  });
});

describe("calculateLocalTaxes", () => {
  it("combines regional and municipal taxes correctly", () => {
    const result = calculateLocalTaxes(30_000, "lombardia", 2026, 0.008);
    expect(result.regionalTax).toBeCloseTo(424.3, 1);
    expect(result.municipalTax).toBeCloseTo(240, 1);
    expect(result.regionalTaxRate).toBeGreaterThan(0);
  });
});
