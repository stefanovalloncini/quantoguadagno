import { describe, it, expect } from "vitest";
import { calculatePremioRisultato } from "./bonusCalculations.ts";
import type { IrpefBracket } from "./irpef.ts";

const IRPEF_2026: readonly IrpefBracket[] = [
  { min: 0, max: 28_000, rate: 0.23 },
  { min: 28_000, max: 50_000, rate: 0.33 },
  { min: 50_000, max: null, rate: 0.43 },
];

const PDR_2026 = { rate: 0.01, maxAmount: 5_000 };
const PDR_2025 = { rate: 0.05, maxAmount: 3_000 };
const INPS = 0.0919;

describe("calculatePremioRisultato — guard cases", () => {
  it("undefined premio → all zero", () => {
    const r = calculatePremioRisultato(undefined, 27_000, INPS, IRPEF_2026, PDR_2026);
    expect(r).toEqual({ pdrGross: 0, pdrInps: 0, pdrTax: 0, pdrNet: 0 });
  });

  it("premio with zero amount → all zero", () => {
    const r = calculatePremioRisultato({ amount: 0 }, 27_000, INPS, IRPEF_2026, PDR_2026);
    expect(r).toEqual({ pdrGross: 0, pdrInps: 0, pdrTax: 0, pdrNet: 0 });
  });
});

describe("calculatePremioRisultato — 2026 (1% within €5.000)", () => {
  it("premio 2.000 € under cap → sostitutiva 1% on premio net of INPS", () => {
    const r = calculatePremioRisultato({ amount: 2_000 }, 27_000, INPS, IRPEF_2026, PDR_2026);
    expect(r.pdrGross).toBe(2_000);
    expect(r.pdrInps).toBeCloseTo(183.8, 2);
    // 2000 * (1 - 0.0919) * 0.01 = 18.162
    expect(r.pdrTax).toBeCloseTo(18.162, 3);
    expect(r.pdrNet).toBeCloseTo(2_000 - 183.8 - 18.162, 2);
  });

  it("premio 5.000 € exactly at cap → fully sostitutiva, no excess", () => {
    const r = calculatePremioRisultato({ amount: 5_000 }, 27_000, INPS, IRPEF_2026, PDR_2026);
    expect(r.pdrInps).toBeCloseTo(459.5, 2);
    // 5000 * (1 - 0.0919) * 0.01 = 45.405
    expect(r.pdrTax).toBeCloseTo(45.405, 3);
  });

  it("premio 6.000 € above cap, IRPEF 23% margin → mixed taxation", () => {
    const r = calculatePremioRisultato({ amount: 6_000 }, 27_000, INPS, IRPEF_2026, PDR_2026);
    // substitutive on 5000: 5000 * 0.9081 * 0.01 = 45.405
    // excess 1000 at 23%: 1000 * 0.9081 * 0.23 = 208.863
    expect(r.pdrTax).toBeCloseTo(45.405 + 208.863, 2);
  });

  it("premio 6.000 € above cap, IRPEF 33% margin → higher excess tax", () => {
    const r = calculatePremioRisultato({ amount: 6_000 }, 40_000, INPS, IRPEF_2026, PDR_2026);
    // marginal at 40000 = 0.33
    // substitutive on 5000: 45.405
    // excess 1000 at 33%: 1000 * 0.9081 * 0.33 = 299.673
    expect(r.pdrTax).toBeCloseTo(45.405 + 299.673, 2);
  });

  it("premio 6.000 € above cap, IRPEF 43% margin → top-bracket excess tax", () => {
    const r = calculatePremioRisultato({ amount: 6_000 }, 60_000, INPS, IRPEF_2026, PDR_2026);
    // substitutive on 5000: 45.405; excess 1000 at 43%: 390.483
    expect(r.pdrTax).toBeCloseTo(45.405 + 390.483, 2);
  });
});

describe("calculatePremioRisultato — 2025 (5% within €3.000)", () => {
  it("premio 2.000 € under cap → sostitutiva 5%", () => {
    const r = calculatePremioRisultato({ amount: 2_000 }, 27_000, INPS, IRPEF_2026, PDR_2025);
    // 2000 * 0.9081 * 0.05 = 90.81
    expect(r.pdrTax).toBeCloseTo(90.81, 2);
  });

  it("premio 4.000 € above cap → mixed taxation", () => {
    const r = calculatePremioRisultato({ amount: 4_000 }, 27_000, INPS, IRPEF_2026, PDR_2025);
    // substitutive on 3000: 3000 * 0.9081 * 0.05 = 136.215
    // excess 1000 at 23%: 1000 * 0.9081 * 0.23 = 208.863
    expect(r.pdrTax).toBeCloseTo(136.215 + 208.863, 2);
  });
});

describe("calculatePremioRisultato — INPS always applies to full gross", () => {
  it("INPS = gross * standardRate regardless of cap split", () => {
    const small = calculatePremioRisultato({ amount: 2_000 }, 27_000, INPS, IRPEF_2026, PDR_2026);
    const big = calculatePremioRisultato({ amount: 10_000 }, 27_000, INPS, IRPEF_2026, PDR_2026);
    expect(small.pdrInps).toBeCloseTo(2_000 * INPS, 3);
    expect(big.pdrInps).toBeCloseTo(10_000 * INPS, 3);
  });
});
