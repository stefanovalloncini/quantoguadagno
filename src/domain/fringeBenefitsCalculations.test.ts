import { describe, it, expect } from "vitest";
import {
  calculateCompanyCarBenefit,
  calculateMealVouchersBenefit,
  calculateHealthInsuranceBenefit,
  calculateWelfareBenefit,
  calculateFringeBenefits,
  hasFringeBenefits,
} from "./fringeBenefitsCalculations.ts";
import { getTaxConfig } from "./taxConfig.ts";

const TAX_CONFIG_2024 = getTaxConfig(2024);
const TAX_CONFIG_2025 = getTaxConfig(2025);
const TAX_CONFIG_2026 = getTaxConfig(2026);

const CFG = TAX_CONFIG_2025.fringeBenefits;

// Per-year exemption thresholds pinned to law, so a stale copy (the 2024
// values were once the 2023 regime) can't slip back in.
// Welfare: L. 213/2023 (2024), L. 207/2024 (2025-2027). Meal: Art. 51 c.2 TUIR.
describe("fringe-benefit exemption thresholds by year", () => {
  it("2024: welfare €1.000/€2.000, buoni pasto €8/giorno", () => {
    const fb = TAX_CONFIG_2024.fringeBenefits;
    expect(fb.welfareThresholdGeneral).toBe(1000);
    expect(fb.welfareThresholdWithChildren).toBe(2000);
    expect(fb.mealVouchersDailyThreshold).toBe(8);
  });

  it("2025: welfare €1.000/€2.000, buoni pasto €8/giorno", () => {
    const fb = TAX_CONFIG_2025.fringeBenefits;
    expect(fb.welfareThresholdGeneral).toBe(1000);
    expect(fb.welfareThresholdWithChildren).toBe(2000);
    expect(fb.mealVouchersDailyThreshold).toBe(8);
  });

  it("2026: welfare €1.000/€2.000, buoni pasto €10/giorno", () => {
    const fb = TAX_CONFIG_2026.fringeBenefits;
    expect(fb.welfareThresholdGeneral).toBe(1000);
    expect(fb.welfareThresholdWithChildren).toBe(2000);
    expect(fb.mealVouchersDailyThreshold).toBe(10);
  });

  it("buoni pasto cartacei €4/giorno in ogni anno (L. 160/2019)", () => {
    for (const cfg of [TAX_CONFIG_2024, TAX_CONFIG_2025, TAX_CONFIG_2026]) {
      expect(cfg.fringeBenefits.mealVouchersPaperThreshold).toBe(4);
    }
  });

  it("health-insurance exemption €3.615,20 in every year (Art. 51 c.2 lett. a)", () => {
    for (const cfg of [TAX_CONFIG_2024, TAX_CONFIG_2025, TAX_CONFIG_2026]) {
      expect(cfg.fringeBenefits.healthInsuranceThreshold).toBeCloseTo(3615.2, 2);
    }
  });
});

// Auto vetture in uso promiscuo — Art. 51 c.4 lett. a TUIR.
// Dal 2025 la L. 207/2024 introduce le percentuali per alimentazione
// (BEV 10%, PHEV 20%, altri 50%) per i contratti stipulati dall'1/1/2025.
describe("calculateCompanyCarBenefit", () => {
  it("modalità semplice: il valore annuo è interamente imponibile", () => {
    const r = calculateCompanyCarBenefit({ mode: "simple", annualBenefitValue: 3000 }, CFG);
    expect(r.grossValue).toBe(3000);
    expect(r.taxableValue).toBe(3000);
  });

  it("modalità semplice senza valore → zero", () => {
    const r = calculateCompanyCarBenefit({ mode: "simple" }, CFG);
    expect(r.grossValue).toBe(0);
    expect(r.taxableValue).toBe(0);
  });

  it("auto BEV: 10% di 15.000 km × costo ACI", () => {
    const r = calculateCompanyCarBenefit(
      { mode: "detailed", aciCostPerKm: 0.4, powertrainType: "bev" },
      CFG,
    );
    expect(r.grossValue).toBeCloseTo(6000, 2);
    expect(r.taxableValue).toBeCloseTo(600, 2);
    expect(r.powertrainCategory).toBe("bev");
    expect(r.taxablePercentage).toBe(0.1);
  });

  it("auto PHEV: 20% imponibile", () => {
    const r = calculateCompanyCarBenefit(
      { mode: "detailed", aciCostPerKm: 0.4, powertrainType: "phev" },
      CFG,
    );
    expect(r.taxableValue).toBeCloseTo(1200, 2);
    expect(r.taxablePercentage).toBe(0.2);
  });

  it("auto termica: 50% imponibile", () => {
    const r = calculateCompanyCarBenefit(
      { mode: "detailed", aciCostPerKm: 0.4, powertrainType: "other" },
      CFG,
    );
    expect(r.taxableValue).toBeCloseTo(3000, 2);
    expect(r.taxablePercentage).toBe(0.5);
  });

  it("senza alimentazione ricade sulle fasce CO2 (regime ante-2025)", () => {
    const lowEmission = calculateCompanyCarBenefit(
      { mode: "detailed", aciCostPerKm: 0.4, co2Emissions: 120 },
      CFG,
    );
    expect(lowEmission.co2Category).toBe("low");
    expect(lowEmission.taxablePercentage).toBe(0.3);
    expect(lowEmission.taxableValue).toBeCloseTo(1800, 2);

    const highEmission = calculateCompanyCarBenefit(
      { mode: "detailed", aciCostPerKm: 0.4, co2Emissions: 220 },
      CFG,
    );
    expect(highEmission.co2Category).toBe("high");
    expect(highEmission.taxablePercentage).toBe(0.6);
  });

  it("modalità dettagliata usa i km convenzionali di default (15.000)", () => {
    const r = calculateCompanyCarBenefit(
      { mode: "detailed", aciCostPerKm: 1, powertrainType: "other" },
      CFG,
    );
    expect(r.grossValue).toBe(15_000);
  });

  it("nessuna auto → zero", () => {
    const r = calculateCompanyCarBenefit(undefined, CFG);
    expect(r.grossValue).toBe(0);
    expect(r.taxableValue).toBe(0);
  });
});

// Buoni pasto — Art. 51 c.2 lett. c TUIR. Soglia 2025: €8/giorno (elettronici).
describe("calculateMealVouchersBenefit", () => {
  it("valore pari alla soglia → nessun imponibile", () => {
    const r = calculateMealVouchersBenefit({ dailyValue: 8, workingDaysPerMonth: 22 }, CFG);
    expect(r.annualValue).toBe(2112); // 8 × 22 × 12
    expect(r.taxableValue).toBe(0);
    expect(r.taxFreeThreshold).toBe(2112);
  });

  it("valore oltre soglia: imponibile solo l'eccedenza giornaliera", () => {
    const r = calculateMealVouchersBenefit({ dailyValue: 10, workingDaysPerMonth: 22 }, CFG);
    expect(r.annualValue).toBe(2640); // 10 × 264
    expect(r.taxableValue).toBe(528); // (10 − 8) × 264
    expect(r.taxFreeThreshold).toBe(2112);
  });

  it("rispetta i giorni lavorativi indicati", () => {
    const r = calculateMealVouchersBenefit({ dailyValue: 8, workingDaysPerMonth: 20 }, CFG);
    expect(r.annualValue).toBe(1920); // 8 × 20 × 12
  });

  it("nessun buono → solo soglia con default 22 giorni", () => {
    const r = calculateMealVouchersBenefit(undefined, CFG);
    expect(r.annualValue).toBe(0);
    expect(r.taxableValue).toBe(0);
    expect(r.taxFreeThreshold).toBe(2112);
  });

  it("buoni cartacei: soglia €4/giorno, non €8", () => {
    const paper = calculateMealVouchersBenefit(
      { dailyValue: 6, workingDaysPerMonth: 22, type: "paper" },
      CFG,
    );
    expect(paper.taxFreeThreshold).toBe(1056); // 4 × 264
    expect(paper.taxableValue).toBe(528); // (6 − 4) × 264

    const electronic = calculateMealVouchersBenefit(
      { dailyValue: 6, workingDaysPerMonth: 22, type: "electronic" },
      CFG,
    );
    expect(electronic.taxableValue).toBe(0); // 6 ≤ soglia 8
  });
});

// Assistenza sanitaria — Art. 51 c.2 lett. a TUIR. Soglia €3.615,20.
describe("calculateHealthInsuranceBenefit", () => {
  it("premio entro soglia → nessun imponibile", () => {
    const r = calculateHealthInsuranceBenefit({ annualPremium: 3000 }, CFG);
    expect(r.taxableValue).toBe(0);
    expect(r.taxFreeThreshold).toBeCloseTo(3615.2, 2);
  });

  it("premio oltre soglia → imponibile l'eccedenza", () => {
    const r = calculateHealthInsuranceBenefit({ annualPremium: 5000 }, CFG);
    expect(r.taxableValue).toBeCloseTo(1384.8, 2);
  });

  it("nessuna polizza → zero", () => {
    const r = calculateHealthInsuranceBenefit(undefined, CFG);
    expect(r.annualValue).toBe(0);
    expect(r.taxableValue).toBe(0);
  });
});

// Welfare — Art. 51 c.3 TUIR. Soglia 2025: €1.000, €2.000 con figli a carico (L. 207/2024).
describe("calculateWelfareBenefit", () => {
  it("entro soglia generale → nessun imponibile", () => {
    const r = calculateWelfareBenefit({ annualAmount: 800, hasDependentChildren: false }, CFG);
    expect(r.taxFreeThreshold).toBe(1000);
    expect(r.taxableValue).toBe(0);
  });

  it("oltre soglia generale → imponibile l'intero valore", () => {
    const r = calculateWelfareBenefit({ annualAmount: 1500, hasDependentChildren: false }, CFG);
    expect(r.taxableValue).toBe(1500);
  });

  it("esattamente alla soglia → nessun imponibile", () => {
    const r = calculateWelfareBenefit({ annualAmount: 1000, hasDependentChildren: false }, CFG);
    expect(r.taxableValue).toBe(0);
  });

  it("con figli la soglia raddoppia a €2.000", () => {
    const r = calculateWelfareBenefit({ annualAmount: 1500, hasDependentChildren: true }, CFG);
    expect(r.taxFreeThreshold).toBe(2000);
    expect(r.taxableValue).toBe(0);
  });

  it("con figli, oltre €2.000 → imponibile l'intero valore", () => {
    const r = calculateWelfareBenefit({ annualAmount: 2500, hasDependentChildren: true }, CFG);
    expect(r.taxableValue).toBe(2500);
  });

  it("nessun welfare → soglia generale di default", () => {
    const r = calculateWelfareBenefit(undefined, CFG);
    expect(r.annualValue).toBe(0);
    expect(r.taxFreeThreshold).toBe(1000);
  });
});

describe("calculateFringeBenefits — aggregazione", () => {
  it("somma valori lordi, imponibili e quota esente delle componenti", () => {
    const r = calculateFringeBenefits(
      {
        mealVouchers: { dailyValue: 10, workingDaysPerMonth: 22 },
        welfare: { annualAmount: 1500, hasDependentChildren: false },
      },
      CFG,
    );
    expect(r.totalGrossBenefit).toBe(4140); // 2640 + 1500
    expect(r.taxableAmount).toBe(2028); // 528 + 1500
    expect(r.taxFreeAmount).toBe(2112); // 4140 − 2028
  });

  it("input vuoto → tutto a zero", () => {
    const r = calculateFringeBenefits(undefined, CFG);
    expect(r.totalGrossBenefit).toBe(0);
    expect(r.taxableAmount).toBe(0);
    expect(r.taxFreeAmount).toBe(0);
  });
});

describe("hasFringeBenefits", () => {
  it("undefined → false", () => {
    expect(hasFringeBenefits(undefined)).toBe(false);
  });

  it("oggetto senza componenti → false", () => {
    expect(hasFringeBenefits({})).toBe(false);
  });

  it("almeno una componente → true", () => {
    expect(hasFringeBenefits({ welfare: { annualAmount: 500, hasDependentChildren: false } })).toBe(
      true,
    );
  });
});
