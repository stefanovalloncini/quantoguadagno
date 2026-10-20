import { describe, it, expect } from "vitest";
import {
  calculateSommaAggiuntiva,
  calculateDetrazioneAggiuntiva,
  calculateTaxWedgeCut,
  sommaAggiuntivaRate,
} from "./taxWedgeCut.ts";
import { getTaxConfig } from "./taxConfig.ts";

const CFG = getTaxConfig(2025).taxWedgeCut;
if (!CFG) throw new Error("the 2025 config must define taxWedgeCut");
const BIG_IRPEF = 10_000;

// Taglio del cuneo fiscale — L. 207/2024, reso strutturale dalla L. 199/2025.
describe("calculateSommaAggiuntiva", () => {
  it("7,1% fino a 8.500 €", () => {
    expect(calculateSommaAggiuntiva(8000, CFG)).toBeCloseTo(8000 * 0.071, 2);
  });

  it("5,3% tra 8.500 e 15.000 €", () => {
    expect(calculateSommaAggiuntiva(12_000, CFG)).toBeCloseTo(12_000 * 0.053, 2);
  });

  it("4,8% tra 15.000 e 20.000 €", () => {
    expect(calculateSommaAggiuntiva(18_000, CFG)).toBeCloseTo(18_000 * 0.048, 2);
  });

  it("non spetta oltre 20.000 €", () => {
    expect(calculateSommaAggiuntiva(25_000, CFG)).toBe(0);
  });

  it("0 per reddito non positivo", () => {
    expect(calculateSommaAggiuntiva(0, CFG)).toBe(0);
  });
});

describe("sommaAggiuntivaRate", () => {
  it("returns the percentage of the bracket the income falls in", () => {
    expect(sommaAggiuntivaRate(8500, CFG)).toBe(0.071);
    expect(sommaAggiuntivaRate(13_621.5, CFG)).toBe(0.053);
    expect(sommaAggiuntivaRate(20_000, CFG)).toBe(0.048);
  });

  it("returns 0 above 20.000 € and for a non-positive income", () => {
    expect(sommaAggiuntivaRate(20_000.01, CFG)).toBe(0);
    expect(sommaAggiuntivaRate(0, CFG)).toBe(0);
  });
});

describe("calculateDetrazioneAggiuntiva", () => {
  it("non spetta entro 20.000 € (subentra la somma aggiuntiva)", () => {
    expect(calculateDetrazioneAggiuntiva(18_000, BIG_IRPEF, CFG)).toBe(0);
  });

  it("piena (1.000 €) fino a 32.000 €", () => {
    expect(calculateDetrazioneAggiuntiva(25_000, BIG_IRPEF, CFG)).toBe(1000);
  });

  it("decresce linearmente tra 32.000 e 40.000 € (36.000 → 500 €)", () => {
    expect(calculateDetrazioneAggiuntiva(36_000, BIG_IRPEF, CFG)).toBeCloseTo(500, 2);
  });

  it("azzerata oltre 40.000 €", () => {
    expect(calculateDetrazioneAggiuntiva(41_000, BIG_IRPEF, CFG)).toBe(0);
  });

  it("non supera l'IRPEF lorda", () => {
    expect(calculateDetrazioneAggiuntiva(25_000, 300, CFG)).toBe(300);
  });

  it("0 se IRPEF lorda nulla", () => {
    expect(calculateDetrazioneAggiuntiva(25_000, 0, CFG)).toBe(0);
  });
});

describe("calculateTaxWedgeCut", () => {
  it("somma il contributo e la detrazione", () => {
    const r = calculateTaxWedgeCut(18_000, BIG_IRPEF, CFG);
    expect(r.sommaAggiuntiva).toBeCloseTo(18_000 * 0.048, 2);
    expect(r.detrazioneAggiuntiva).toBe(0);
    expect(r.total).toBeCloseTo(r.sommaAggiuntiva + r.detrazioneAggiuntiva, 2);
  });
});
