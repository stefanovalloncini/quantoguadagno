import { describe, expect, it } from "vitest";
import type { ComunaleRule } from "@/data/index.ts";
import { calculateSalaryBreakdown, type SalaryInput } from "./composer.ts";
import {
  calculateMunicipal,
  calculateMunicipalTax,
  getEffectiveMunicipalRate,
  getMunicipalMarginalRate,
} from "./municipalTaxCalculations.ts";

const FLAT: ComunaleRule = { rate: 0.8 };

const BRACKETS: ComunaleRule = {
  brackets: [
    { upTo: 15_000, rate: 0.4 },
    { upTo: 28_000, rate: 0.65 },
    { upTo: 50_000, rate: 0.8 },
    { upTo: null, rate: 0.8 },
  ],
};

describe("addizionale comunale da delibera", () => {
  it("aliquota unica: percentuale su tutto l'imponibile IRPEF", () => {
    expect(calculateMunicipalTax(30_000, FLAT)).toBeCloseTo(240, 2);
  });

  it("scaglioni: ogni fascia alla sua aliquota, come l'IRPEF", () => {
    expect(calculateMunicipalTax(30_000, BRACKETS)).toBeCloseTo(
      15_000 * 0.004 + 13_000 * 0.0065 + 2000 * 0.008,
      2,
    );
    expect(calculateMunicipalTax(10_000, BRACKETS)).toBeCloseTo(40, 2);
    expect(calculateMunicipalTax(80_000, BRACKETS)).toBeCloseTo(
      15_000 * 0.004 + 13_000 * 0.0065 + 52_000 * 0.008,
      2,
    );
  });

  it("esenzione: niente fino alla soglia compresa, oltre si paga su tutto il reddito", () => {
    const rule: ComunaleRule = { rate: 0.5, exemption: 12_000 };
    expect(calculateMunicipalTax(11_999, rule)).toBe(0);
    expect(calculateMunicipalTax(12_000, rule)).toBe(0);
    expect(calculateMunicipalTax(12_000.01, rule)).toBeCloseTo(60, 2);
    expect(calculateMunicipalTax(20_000, rule)).toBeCloseTo(100, 2);
  });

  it("esenzione anche con gli scaglioni", () => {
    const rule: ComunaleRule = { ...BRACKETS, exemption: 10_000 };
    expect(calculateMunicipalTax(10_000, rule)).toBe(0);
    expect(calculateMunicipalTax(10_001, rule)).toBeCloseTo(40.004, 3);
  });

  it("imponibile nullo o negativo: nessuna addizionale", () => {
    expect(calculateMunicipalTax(0, FLAT)).toBe(0);
    expect(calculateMunicipalTax(-100, BRACKETS)).toBe(0);
    expect(getEffectiveMunicipalRate(0, FLAT)).toBe(0);
  });

  it("aliquota marginale: quella dello scaglione del prossimo euro, zero se esente", () => {
    expect(getMunicipalMarginalRate(30_000, FLAT)).toBeCloseTo(0.008, 10);
    expect(getMunicipalMarginalRate(14_999, BRACKETS)).toBeCloseTo(0.004, 10);
    expect(getMunicipalMarginalRate(15_000, BRACKETS)).toBeCloseTo(0.0065, 10);
    expect(getMunicipalMarginalRate(60_000, BRACKETS)).toBeCloseTo(0.008, 10);
    expect(getMunicipalMarginalRate(9_000, { rate: 0.8, exemption: 10_000 })).toBe(0);
  });

  it("aliquota effettiva: imposta diviso imponibile", () => {
    expect(getEffectiveMunicipalRate(30_000, BRACKETS)).toBeCloseTo(160.5 / 30_000, 10);
  });

  it("aliquota manuale: stesso calcolo di prima", () => {
    expect(calculateMunicipal(30_000, 0.008)).toEqual({
      municipalTax: 30_000 * 0.008,
      municipalTaxRate: 0.008,
      municipalMarginalRate: 0.008,
    });
  });
});

describe("calculateSalaryBreakdown con la delibera del comune", () => {
  const BASE: SalaryInput = {
    taxYear: 2026,
    grossAnnual: 35_000,
    regionCode: "lombardia",
    municipalTaxRate: 0.008,
    paymentFrequency: 13,
  };

  it("un'aliquota unica dà lo stesso cedolino dell'aliquota manuale", () => {
    const manual = calculateSalaryBreakdown(BASE);
    const rule = calculateSalaryBreakdown({ ...BASE, municipalTaxRate: FLAT });
    expect(rule).toEqual(manual);
    expect(rule.municipalTax).toBe(254.27);
    expect(rule.netAnnual).toBe(26_032.21);
  });

  it("scaglioni applicati all'imponibile del cedolino", () => {
    const r = calculateSalaryBreakdown({
      ...BASE,
      grossAnnual: 45_000,
      municipalTaxRate: BRACKETS,
    });
    const expected = 15_000 * 0.004 + 13_000 * 0.0065 + (r.taxableIncome - 28_000) * 0.008;
    expect(r.municipalTax).toBeCloseTo(expected, 2);
    expect(r.municipalTaxRate).toBeCloseTo(expected / r.taxableIncome, 4);
  });

  it("reddito sotto la soglia di esenzione: niente comunale, la regionale resta", () => {
    const r = calculateSalaryBreakdown({
      ...BASE,
      municipalTaxRate: { rate: 0.8, exemption: 40_000 },
    });
    const manual = calculateSalaryBreakdown(BASE);
    expect(r.municipalTax).toBe(0);
    expect(r.municipalTaxRate).toBe(0);
    expect(r.regionalTax).toBe(manual.regionalTax);
    expect(r.marginalTaxRate).toBeCloseTo(manual.marginalTaxRate - 0.008, 4);
    expect(r.netAnnual).toBeCloseTo(manual.netAnnual + manual.municipalTax, 2);
  });

  it("senza IRPEF netta la comunale non è dovuta nemmeno con la delibera", () => {
    const r = calculateSalaryBreakdown({ ...BASE, grossAnnual: 8000, municipalTaxRate: FLAT });
    expect(r.irpefNet).toBe(0);
    expect(r.municipalTax).toBe(0);
  });
});
