import { describe, it, expect } from "vitest";
import {
  calculateTFR,
  calculateOtherEmployerCosts,
  calculateEmployerInps,
} from "./employerCostCalculations.ts";
import { getTaxConfig } from "./taxConfig.ts";

const cfg = getTaxConfig(2025);

describe("calculateTFR", () => {
  it("quota annua = RAL / 13,5 − 0,50% di contributo IVS (art. 3 c. 16 L. 297/1982)", () => {
    const result = calculateTFR(40_000, cfg.tfr);
    expect(result.annual).toBeCloseTo(40_000 / 13.5 - 200, 2);
    expect(result.monthly).toBeCloseTo(result.annual / 12, 2);
  });

  it("aliquota effettiva ≈ 6,91%", () => {
    const result = calculateTFR(1, cfg.tfr);
    expect(result.rate).toBeCloseTo(0.0691, 4);
  });
});

describe("calculateOtherEmployerCosts", () => {
  it("naspiAdditional is zero for indeterminato", () => {
    const result = calculateOtherEmployerCosts(40_000, "indeterminato", cfg.otherEmployerCosts);
    expect(result.naspiAdditional).toBe(0);
  });

  it("naspiAdditional is non-zero for determinato", () => {
    const result = calculateOtherEmployerCosts(40_000, "determinato", cfg.otherEmployerCosts);
    expect(result.naspiAdditional).toBeGreaterThan(0);
  });

  it("total equals sum of all components", () => {
    const result = calculateOtherEmployerCosts(40_000, "indeterminato", cfg.otherEmployerCosts);
    const sum =
      result.inail +
      result.maternity +
      result.naspi +
      result.naspiAdditional +
      result.cig +
      result.other;
    expect(result.total).toBeCloseTo(sum, 5);
  });
});

describe("calculateEmployerInps", () => {
  it("uses apprenticeship rate for apprendistato contract", () => {
    const standard = calculateEmployerInps(40_000, "indeterminato", cfg.employerInps);
    const apprentice = calculateEmployerInps(40_000, "apprendistato", cfg.employerInps);
    expect(apprentice.rate).toBe(cfg.employerInps.apprenticeshipRate);
    expect(apprentice.contribution).toBeLessThan(standard.contribution);
  });

  it("contribution = gross * rate", () => {
    const result = calculateEmployerInps(50_000, "indeterminato", cfg.employerInps);
    expect(result.contribution).toBeCloseTo(50_000 * cfg.employerInps.rate, 2);
  });
});
