import { describe, it, expect } from "vitest";
import {
  isMadreLavoratriceEligible,
  calculateMadreLavoratriceExemption,
  calculateRegimeImpatriatiAdjustment,
  calculateRegimeImpatriatiSavings,
} from "./specialConditionsCalculations.ts";
import { getTaxConfig } from "./taxConfig.ts";

const MADRE = getTaxConfig(2026).madreLavoratrice;
const IMPATRIATI = getTaxConfig(2026).regimeImpatriati;

// Esonero contributivo madri lavoratrici — L. 207/2024 art. 1 c.219-220.
// Spetta con almeno 3 figli finché il più piccolo non compie 18 anni.
describe("isMadreLavoratriceEligible", () => {
  it("non attivo → non spettante", () => {
    expect(
      isMadreLavoratriceEligible(
        { enabled: false, numberOfChildren: 3, youngestChildAge: 5 },
        MADRE,
      ),
    ).toBe(false);
  });

  it("3 figli, più piccolo di 18 anni → spettante", () => {
    expect(
      isMadreLavoratriceEligible(
        { enabled: true, numberOfChildren: 3, youngestChildAge: 5 },
        MADRE,
      ),
    ).toBe(true);
  });

  it("2 figli → non spettante", () => {
    expect(
      isMadreLavoratriceEligible(
        { enabled: true, numberOfChildren: 2, youngestChildAge: 5 },
        MADRE,
      ),
    ).toBe(false);
  });

  it("figlio più piccolo già 18enne → non spettante", () => {
    expect(
      isMadreLavoratriceEligible(
        { enabled: true, numberOfChildren: 3, youngestChildAge: 18 },
        MADRE,
      ),
    ).toBe(false);
  });
});

describe("calculateMadreLavoratriceExemption", () => {
  it("non spettante → 0", () => {
    const r = calculateMadreLavoratriceExemption(
      2000,
      { enabled: true, numberOfChildren: 2, youngestChildAge: 5 },
      MADRE,
    );
    expect(r).toBe(0);
  });

  it("spettante, contributi sotto il massimale → esonero pari ai contributi", () => {
    const r = calculateMadreLavoratriceExemption(
      2000,
      { enabled: true, numberOfChildren: 3, youngestChildAge: 5 },
      MADRE,
    );
    expect(r).toBeCloseTo(2000, 2);
  });

  it("spettante, contributi oltre il massimale → cap a €3.000", () => {
    const r = calculateMadreLavoratriceExemption(
      4000,
      { enabled: true, numberOfChildren: 3, youngestChildAge: 5 },
      MADRE,
    );
    expect(r).toBeCloseTo(3000, 2);
  });
});

// Regime impatriati — D.Lgs. 209/2023 art. 5. Esenzione 50% (60% con figli minori),
// reddito agevolabile fino a €600.000.
describe("calculateRegimeImpatriatiAdjustment", () => {
  it("non attivo → reddito invariato", () => {
    const r = calculateRegimeImpatriatiAdjustment(50_000, undefined, IMPATRIATI);
    expect(r.adjustedTaxableIncome).toBe(50_000);
    expect(r.exemptionRate).toBe(0);
    expect(r.exemptedIncome).toBe(0);
  });

  it("esenzione standard 50%", () => {
    const r = calculateRegimeImpatriatiAdjustment(
      50_000,
      { enabled: true, hasMinorChildren: false },
      IMPATRIATI,
    );
    expect(r.exemptionRate).toBe(0.5);
    expect(r.exemptedIncome).toBeCloseTo(25_000, 2);
    expect(r.adjustedTaxableIncome).toBeCloseTo(25_000, 2);
  });

  it("con figli minori esenzione 60%", () => {
    const r = calculateRegimeImpatriatiAdjustment(
      50_000,
      { enabled: true, hasMinorChildren: true },
      IMPATRIATI,
    );
    expect(r.exemptionRate).toBe(0.6);
    expect(r.exemptedIncome).toBeCloseTo(30_000, 2);
    expect(r.adjustedTaxableIncome).toBeCloseTo(20_000, 2);
  });

  it("reddito oltre €600.000: l'esenzione si applica solo alla quota agevolabile", () => {
    const r = calculateRegimeImpatriatiAdjustment(
      700_000,
      { enabled: true, hasMinorChildren: false },
      IMPATRIATI,
    );
    expect(r.exemptedIncome).toBeCloseTo(300_000, 2); // 50% di 600.000
    expect(r.adjustedTaxableIncome).toBeCloseTo(400_000, 2); // 700.000 − 300.000
  });
});

describe("calculateRegimeImpatriatiSavings", () => {
  it("differenza fra IRPEF piena e ridotta", () => {
    expect(calculateRegimeImpatriatiSavings(15_000, 6000)).toBe(9000);
  });

  it("mai negativo", () => {
    expect(calculateRegimeImpatriatiSavings(6000, 15_000)).toBe(0);
  });
});
