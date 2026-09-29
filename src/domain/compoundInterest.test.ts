import { describe, expect, it } from "vitest";
import { calculateCompoundInterest } from "./compoundInterest.ts";

describe("calculateCompoundInterest", () => {
  it("returns the principal when rate and contributions are zero", () => {
    const r = calculateCompoundInterest({
      principal: 10_000,
      annualRate: 0,
      years: 10,
      contribution: 0,
      contributionFrequency: "monthly",
      compoundingFrequency: "monthly",
      inflationRate: 0,
    });
    expect(r.finalNominal).toBe(10_000);
    expect(r.finalReal).toBe(10_000);
    expect(r.totalContributions).toBe(0);
    expect(r.totalInterest).toBe(0);
    expect(r.schedule).toHaveLength(11);
  });

  it("compounds annually with no contributions (textbook)", () => {
    const r = calculateCompoundInterest({
      principal: 10_000,
      annualRate: 0.05,
      years: 20,
      contribution: 0,
      contributionFrequency: "monthly",
      compoundingFrequency: "annually",
      inflationRate: 0,
    });
    expect(r.finalNominal).toBeCloseTo(26_532.98, 1);
    expect(r.totalInterest).toBeCloseTo(16_532.98, 1);
  });

  it("compounds monthly with monthly contributions", () => {
    const r = calculateCompoundInterest({
      principal: 1_000,
      annualRate: 0.06,
      years: 5,
      contribution: 100,
      contributionFrequency: "monthly",
      compoundingFrequency: "monthly",
      inflationRate: 0,
    });
    expect(r.finalNominal).toBeCloseTo(8_325.85, 0);
    expect(r.totalContributions).toBe(6_000);
  });

  it("discounts the final balance by inflation when set", () => {
    const r = calculateCompoundInterest({
      principal: 10_000,
      annualRate: 0.05,
      years: 10,
      contribution: 0,
      contributionFrequency: "monthly",
      compoundingFrequency: "annually",
      inflationRate: 0.02,
    });
    expect(r.finalNominal).toBeCloseTo(16_288.95, 1);
    expect(r.finalReal).toBeCloseTo(13_362.61, 1);
  });

  it("clamps negative principal and rate to zero", () => {
    const r = calculateCompoundInterest({
      principal: -100,
      annualRate: -0.5,
      years: 5,
      contribution: 0,
      contributionFrequency: "monthly",
      compoundingFrequency: "monthly",
      inflationRate: 0,
    });
    expect(r.finalNominal).toBe(0);
    expect(r.schedule[0]?.nominalBalance).toBe(0);
  });

  it("schedule[i] is the balance at end of year i", () => {
    const r = calculateCompoundInterest({
      principal: 100,
      annualRate: 0.1,
      years: 3,
      contribution: 0,
      contributionFrequency: "monthly",
      compoundingFrequency: "annually",
      inflationRate: 0,
    });
    expect(r.schedule[0]?.nominalBalance).toBe(100);
    expect(r.schedule[1]?.nominalBalance).toBeCloseTo(110, 2);
    expect(r.schedule[2]?.nominalBalance).toBeCloseTo(121, 2);
    expect(r.schedule[3]?.nominalBalance).toBeCloseTo(133.1, 2);
  });

  it("supports yearly contributions", () => {
    const r = calculateCompoundInterest({
      principal: 0,
      annualRate: 0.05,
      years: 3,
      contribution: 1_000,
      contributionFrequency: "yearly",
      compoundingFrequency: "annually",
      inflationRate: 0,
    });
    expect(r.totalContributions).toBe(3_000);
    expect(r.finalNominal).toBeGreaterThan(3_000);
  });

  it("supports no contributions explicitly", () => {
    const r = calculateCompoundInterest({
      principal: 500,
      annualRate: 0.05,
      years: 5,
      contribution: 999,
      contributionFrequency: "none",
      compoundingFrequency: "annually",
      inflationRate: 0,
    });
    expect(r.totalContributions).toBe(0);
    expect(r.finalNominal).toBeCloseTo(638.14, 1);
  });
});
