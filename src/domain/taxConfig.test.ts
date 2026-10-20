import { describe, expect, it } from "vitest";
import {
  SUPPORTED_YEARS,
  type SelfEmployedDeductionConfig,
  type SupportedYear,
} from "@/data/index.ts";
import { getTaxConfig } from "./taxConfig.ts";

const EMPLOYEE_INPS: Record<SupportedYear, { ceiling: number; massimale: number }> = {
  2024: { ceiling: 55_008, massimale: 119_650 },
  2025: { ceiling: 55_448, massimale: 120_607 },
  2026: { ceiling: 56_224, massimale: 122_295 },
};

// Art. 13 c. 5, 5-ter e 6 TUIR (L. 234/2021), testo uguale su Normattiva nel 2024, 2025 e 2026.
const ART_13_C_5: SelfEmployedDeductionConfig = {
  thresholds: [5_500, 28_000, 50_000],
  baseDeduction: 1265,
  additionalDeduction: 765,
  midBracketFixed: 500,
  midBracketBonus: { above: 11_000, upTo: 17_000, amount: 50 },
  quotientDecimals: 4,
};

const SELF_EMPLOYED_DEDUCTION: Record<SupportedYear, SelfEmployedDeductionConfig> = {
  2024: ART_13_C_5,
  2025: ART_13_C_5,
  2026: ART_13_C_5,
};

const IRPEF_MIDDLE_RATE: Record<SupportedYear, number> = {
  2024: 0.35,
  2025: 0.35,
  2026: 0.33,
};

describe("parametri annuali dei dipendenti", () => {
  it.each(SUPPORTED_YEARS)("%i: prima fascia e massimale INPS dalle circolari", (year) => {
    const { inps } = getTaxConfig(year);
    expect(inps.ceiling).toBe(EMPLOYEE_INPS[year].ceiling);
    expect(inps.massimale).toBe(EMPLOYEE_INPS[year].massimale);
  });

  it.each(SUPPORTED_YEARS)("%i: scaglioni IRPEF 23% / %s / 43%", (year) => {
    const brackets = getTaxConfig(year).irpefBrackets;
    expect(brackets.map((b) => b.rate)).toEqual([0.23, IRPEF_MIDDLE_RATE[year], 0.43]);
    expect(brackets.map((b) => b.max)).toEqual([28_000, 50_000, null]);
  });

  it("taglio del cuneo dal 2025, esonero contributivo solo nel 2024", () => {
    expect(getTaxConfig(2024).taxWedgeCut).toBeNull();
    expect(getTaxConfig(2024).inpsExemption2024).not.toBeNull();
    expect(getTaxConfig(2025).taxWedgeCut).not.toBeNull();
    expect(getTaxConfig(2025).inpsExemption2024).toBeNull();
    expect(getTaxConfig(2026).taxWedgeCut).not.toBeNull();
  });

  it("limiti alle detrazioni per redditi alti: tetto dal 2025, −440 € solo dal 2026", () => {
    expect(getTaxConfig(2024).expenseDeductions.highIncomeCap).toBeUndefined();
    expect(getTaxConfig(2025).expenseDeductions.highIncomeCap).toBeDefined();
    expect(getTaxConfig(2025).expenseDeductions.highIncomeReduction).toBeUndefined();
    expect(getTaxConfig(2026).expenseDeductions.highIncomeReduction).toEqual({
      minIncome: 200_000,
      amount: 440,
    });
  });
});

describe("detrazione per lavoro autonomo e impresa minore", () => {
  it.each(SUPPORTED_YEARS)("%i: 1.265 € fino a 5.500 €, poi a scalare fino a 50.000 €", (year) => {
    expect(getTaxConfig(year).selfEmployedDeduction).toEqual(SELF_EMPLOYED_DEDUCTION[year]);
  });
});
