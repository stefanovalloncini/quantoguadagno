import { describe, it, expect } from "vitest";
import {
  calculateDependentsDeduction,
  calculateExpenseDeduction,
  calculatePensionFundDeduction,
} from "./deductionCalculations.ts";
import { getTaxConfig } from "./taxConfig.ts";

const TAX_CONFIG_2024 = getTaxConfig(2024);
const TAX_CONFIG_2025 = getTaxConfig(2025);
const TAX_CONFIG_2026 = getTaxConfig(2026);

const CFG = TAX_CONFIG_2026.dependentsDeduction;

const EXP = TAX_CONFIG_2024.expenseDeductions;

function expenses(pensionFund: number) {
  return { mortgageInterest: 0, medicalExpenses: 0, otherDeductions: 0, pensionFund };
}

// Previdenza complementare — onere deducibile, massimale €5.164,57 (D.Lgs. 252/2005).
describe("calculatePensionFundDeduction", () => {
  it("deduce l'intero versamento entro il massimale", () => {
    expect(calculatePensionFundDeduction(expenses(2000), EXP)).toBe(2000);
  });

  it("cap al massimale €5.164,57", () => {
    expect(calculatePensionFundDeduction(expenses(8000), EXP)).toBeCloseTo(5164.57, 2);
  });

  it("nessun versamento → 0", () => {
    expect(calculatePensionFundDeduction(expenses(0), EXP)).toBe(0);
    expect(calculatePensionFundDeduction(undefined, EXP)).toBe(0);
  });
});

describe("calculateDependentsDeduction — senza familiari a carico", () => {
  it("nessun familiare → 0", () => {
    expect(calculateDependentsDeduction(40_000, undefined, CFG)).toBe(0);
  });
});

function dependents(otherDependents: number) {
  return { hasSpouse: false, childrenOver21: 0, otherDependents };
}

describe("calculateDependentsDeduction — altri familiari (TUIR art. 12 c.4-bis)", () => {
  it("1 altro familiare, reddito 0 → 750 € pieno", () => {
    const r = calculateDependentsDeduction(0, dependents(1), CFG);
    expect(r).toBeCloseTo(750, 2);
  });

  it("1 altro familiare, reddito 40.000 → 375 € (50% phase-out)", () => {
    const r = calculateDependentsDeduction(40_000, dependents(1), CFG);
    expect(r).toBeCloseTo(375, 2);
  });

  it("1 altro familiare, reddito 60.000 → 187,5 € (25% residuo)", () => {
    const r = calculateDependentsDeduction(60_000, dependents(1), CFG);
    expect(r).toBeCloseTo(750 * (20_000 / 80_000), 2);
  });

  it("1 altro familiare, reddito 80.000 → 0", () => {
    const r = calculateDependentsDeduction(80_000, dependents(1), CFG);
    expect(r).toBeCloseTo(0, 2);
  });

  it("1 altro familiare, reddito 100.000 → 0 (oltre soglia)", () => {
    const r = calculateDependentsDeduction(100_000, dependents(1), CFG);
    expect(r).toBe(0);
  });

  it("2 altri familiari, reddito 30.000 → 937,5 €", () => {
    const r = calculateDependentsDeduction(30_000, dependents(2), CFG);
    expect(r).toBeCloseTo(2 * 750 * (50_000 / 80_000), 2);
  });

  it("0 altri familiari → 0 indipendentemente dal reddito", () => {
    expect(calculateDependentsDeduction(30_000, dependents(0), CFG)).toBe(0);
    expect(calculateDependentsDeduction(0, dependents(0), CFG)).toBe(0);
  });
});

function spouse(spouseIncome?: number) {
  return {
    hasSpouse: true,
    childrenOver21: 0,
    otherDependents: 0,
    ...(spouseIncome !== undefined && { spouseIncome }),
  };
}

describe("calculateDependentsDeduction — coniuge a carico (TUIR art. 12 c.1 lett. a)", () => {
  it("fino a 15.000: 800 − 110 × reddito / 15.000", () => {
    expect(calculateDependentsDeduction(0, spouse(), CFG)).toBe(800);
    expect(calculateDependentsDeduction(12_000, spouse(), CFG)).toBeCloseTo(712, 2);
    expect(calculateDependentsDeduction(15_000, spouse(), CFG)).toBeCloseTo(690, 2);
  });

  it("da 15.000 a 40.000: 690 €", () => {
    expect(calculateDependentsDeduction(20_000, spouse(), CFG)).toBe(690);
    expect(calculateDependentsDeduction(40_000, spouse(), CFG)).toBe(690);
  });

  it("maggiorazioni tra 29.000 e 35.200", () => {
    expect(calculateDependentsDeduction(29_100, spouse(), CFG)).toBe(700);
    expect(calculateDependentsDeduction(30_000, spouse(), CFG)).toBe(710);
    expect(calculateDependentsDeduction(35_000, spouse(), CFG)).toBe(720);
    expect(calculateDependentsDeduction(35_150, spouse(), CFG)).toBe(700);
  });

  it("da 40.000 a 80.000: 690 × (80.000 − reddito) / 40.000", () => {
    expect(calculateDependentsDeduction(60_000, spouse(), CFG)).toBeCloseTo(345, 2);
    expect(calculateDependentsDeduction(80_000, spouse(), CFG)).toBe(0);
  });

  it("oltre 80.000 → 0", () => {
    expect(calculateDependentsDeduction(100_000, spouse(), CFG)).toBe(0);
  });

  it("coniuge con reddito oltre il limite di carico → 0", () => {
    expect(calculateDependentsDeduction(20_000, spouse(3000), CFG)).toBe(0);
    expect(calculateDependentsDeduction(20_000, spouse(2000), CFG)).toBe(690);
  });
});

function children(childrenOver21: number) {
  return { hasSpouse: false, childrenOver21, otherDependents: 0 };
}

describe("calculateDependentsDeduction — figli (TUIR art. 12 c.1 lett. c)", () => {
  it("un figlio: 950 × (95.000 − reddito) / 95.000", () => {
    expect(calculateDependentsDeduction(0, children(1), CFG)).toBe(950);
    expect(calculateDependentsDeduction(30_000, children(1), CFG)).toBeCloseTo(650, 2);
    expect(calculateDependentsDeduction(95_000, children(1), CFG)).toBe(0);
  });

  it("due figli: la soglia sale di 15.000 per ogni figlio dopo il primo", () => {
    expect(calculateDependentsDeduction(30_000, children(2), CFG)).toBeCloseTo(
      1900 * (80_000 / 110_000),
      2,
    );
    expect(calculateDependentsDeduction(100_000, children(2), CFG)).toBeCloseTo(
      1900 * (10_000 / 110_000),
      2,
    );
    expect(calculateDependentsDeduction(110_000, children(2), CFG)).toBe(0);
  });
});

function expenseInput(mortgageInterest: number, medicalExpenses: number, otherDeductions: number) {
  return { mortgageInterest, medicalExpenses, otherDeductions };
}

function totalExpenseDeduction(
  input: ReturnType<typeof expenseInput> | undefined,
  income: number,
  childrenCount = 0,
  cfg = EXP,
) {
  return calculateExpenseDeduction(input, income, childrenCount, cfg).total;
}

describe("calculateExpenseDeduction — detrazioni al 19% (TUIR art. 15)", () => {
  it("interessi sul mutuo: 19% fino al tetto di 4.000 €", () => {
    expect(totalExpenseDeduction(expenseInput(5000, 0, 0), 50_000)).toBeCloseTo(760, 2);
    expect(totalExpenseDeduction(expenseInput(2000, 0, 0), 50_000)).toBeCloseTo(380, 2);
  });

  it("spese sanitarie: 19% sulla parte oltre la franchigia di 129,11 €", () => {
    expect(totalExpenseDeduction(expenseInput(0, 1000, 0), 50_000)).toBeCloseTo(
      (1000 - 129.11) * 0.19,
      2,
    );
    expect(totalExpenseDeduction(expenseInput(0, 100, 0), 50_000)).toBe(0);
    expect(totalExpenseDeduction(expenseInput(0, 129.11, 0), 50_000)).toBe(0);
  });

  it("altre detrazioni al 19%", () => {
    expect(totalExpenseDeduction(expenseInput(0, 0, 1000), 50_000)).toBeCloseTo(190, 2);
  });

  it("restituisce a parte la detrazione per gli interessi sul mutuo", () => {
    const r = calculateExpenseDeduction(expenseInput(2000, 1000, 1000), 50_000, 0, EXP);
    expect(r.mortgageInterest).toBeCloseTo(380, 2);
  });

  it("nessuna spesa → 0", () => {
    expect(calculateExpenseDeduction(undefined, 50_000, 0, EXP)).toEqual({
      total: 0,
      mortgageInterest: 0,
    });
  });
});

describe("calculateExpenseDeduction — riduzione tra 120.000 e 240.000 (art. 15 c. 3-bis e 3-ter)", () => {
  const cfg = TAX_CONFIG_2024.expenseDeductions;

  it("le altre spese si riducono in proporzione", () => {
    expect(totalExpenseDeduction(expenseInput(0, 0, 1000), 180_000, 0, cfg)).toBeCloseTo(95, 2);
    expect(totalExpenseDeduction(expenseInput(0, 0, 1000), 240_000, 0, cfg)).toBe(0);
  });

  it("interessi sul mutuo e spese sanitarie restano interi", () => {
    expect(totalExpenseDeduction(expenseInput(1000, 0, 0), 180_000, 0, cfg)).toBeCloseTo(190, 2);
    expect(totalExpenseDeduction(expenseInput(0, 1000, 0), 250_000, 0, cfg)).toBeCloseTo(
      (1000 - 129.11) * 0.19,
      2,
    );
  });
});

describe("calculateExpenseDeduction — tetto oltre 75.000 in base ai figli (art. 16-ter, dal 2025)", () => {
  const cfg = TAX_CONFIG_2025.expenseDeductions;

  it("tra 75.000 e 100.000 il tetto è 14.000 × coefficiente", () => {
    expect(totalExpenseDeduction(expenseInput(0, 0, 10_000), 90_000, 0, cfg)).toBeCloseTo(
      7000 * 0.19,
      2,
    );
    expect(totalExpenseDeduction(expenseInput(0, 0, 10_000), 90_000, 3, cfg)).toBeCloseTo(
      10_000 * 0.19,
      2,
    );
  });

  it("oltre 100.000 il tetto è 8.000 × coefficiente", () => {
    expect(totalExpenseDeduction(expenseInput(0, 0, 10_000), 110_000, 1, cfg)).toBeCloseTo(
      5600 * 0.19,
      2,
    );
  });

  it("nel 2024 il tetto non esiste", () => {
    const cfg2024 = TAX_CONFIG_2024.expenseDeductions;
    expect(totalExpenseDeduction(expenseInput(0, 0, 10_000), 90_000, 0, cfg2024)).toBeCloseTo(
      1900,
      2,
    );
  });
});

describe("calculateExpenseDeduction — riduzione di 440 € oltre 200.000 (L. 199/2025)", () => {
  it("nel 2026 toglie 440 € dalle detrazioni diverse dalle spese sanitarie", () => {
    const cfg = TAX_CONFIG_2026.expenseDeductions;
    expect(totalExpenseDeduction(expenseInput(4000, 0, 0), 210_000, 0, cfg)).toBeCloseTo(320, 2);
    expect(totalExpenseDeduction(expenseInput(0, 1000, 0), 210_000, 0, cfg)).toBeCloseTo(
      (1000 - 129.11) * 0.19,
      2,
    );
  });

  it("nel 2025 non si applica", () => {
    const cfg = TAX_CONFIG_2025.expenseDeductions;
    expect(totalExpenseDeduction(expenseInput(4000, 0, 0), 210_000, 0, cfg)).toBeCloseTo(760, 2);
  });
});
