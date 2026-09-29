import { describe, it, expect } from "vitest";
import { projectTfr } from "./tfr.ts";
import { getTaxConfig } from "./taxConfig.ts";

const CFG = getTaxConfig(2026).tfr;

describe("projectTfr — accumulo TFR (Art. 2120 c.c.)", () => {
  it("quota annua = RAL / 13,5 − 0,50% di contributo IVS (art. 3 c. 16 L. 297/1982)", () => {
    const r = projectTfr(30_000, 1, 0.02, CFG);
    expect(r.annualQuota).toBeCloseTo(2072.22, 2);
  });

  it("il primo anno non ha rivalutazione (stock iniziale zero)", () => {
    const r = projectTfr(30_000, 1, 0.02, CFG);
    expect(r.schedule).toHaveLength(1);
    expect(r.schedule[0]?.revaluation).toBe(0);
    expect(r.finalStock).toBeCloseTo(2072.22, 2);
  });

  it("3 anni, inflazione 2% → rivalutazione netta su quote precedenti", () => {
    // revalRate = 1,5% + 75%×2% = 3%; imposta sostitutiva 17%
    const r = projectTfr(30_000, 3, 0.02, CFG);
    expect(r.totalQuote).toBe(6216.66);
    expect(r.finalStock).toBe(6372.74);
    expect(r.totalRevaluationTax).toBeCloseTo(31.97, 2);
    expect(r.schedule).toHaveLength(3);
  });

  it("ogni totale è la somma delle righe arrotondate che mostra", () => {
    const cents = (amount: number) => Math.round(amount * 100);
    for (const [ral, years, inflation] of [
      [30_000, 3, 0.02],
      [41_234.57, 17, 0.013],
      [87_654.32, 40, 0.057],
    ] as const) {
      const r = projectTfr(ral, years, inflation, CFG);
      let stock = 0;
      for (const row of r.schedule) {
        stock += cents(row.quota) + cents(row.revaluation);
        expect(cents(row.stock)).toBe(stock);
      }
      const sum = (key: "quota" | "revaluation") =>
        r.schedule.reduce((total, row) => total + cents(row[key]), 0);
      expect(cents(r.totalQuote)).toBe(sum("quota"));
      expect(cents(r.totalRevaluation)).toBe(sum("revaluation"));
      expect(cents(r.finalStock)).toBe(cents(r.totalQuote) + cents(r.totalRevaluation));
    }
  });

  it("inflazione più alta accumula più TFR", () => {
    const low = projectTfr(30_000, 10, 0.0, CFG);
    const high = projectTfr(30_000, 10, 0.04, CFG);
    expect(high.finalStock).toBeGreaterThan(low.finalStock);
    // a inflazione zero resta solo l'1,5% fisso
    expect(low.totalRevaluation).toBeGreaterThan(0);
  });

  it("RAL non positiva → tutto a zero", () => {
    const r = projectTfr(0, 5, 0.02, CFG);
    expect(r.annualQuota).toBe(0);
    expect(r.finalStock).toBe(0);
  });

  it("zero anni → nessun accantonamento", () => {
    const r = projectTfr(30_000, 0, 0.02, CFG);
    expect(r.finalStock).toBe(0);
    expect(r.schedule).toHaveLength(0);
  });
});
