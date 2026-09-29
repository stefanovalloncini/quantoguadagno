import { describe, it, expect } from "vitest";
import type { InpsConfig } from "./taxConfig.ts";
import { resolveInpsRates, resolveEmployerInpsRate } from "./inpsRates.ts";

const CFG: InpsConfig = {
  standardRate: 0.0919,
  aboveCeilingRate: 0.1019,
  ceiling: 56_224,
  massimale: 122_295,
  apprenticeshipRate: 0.0584,
  largeCompanyAdditionalRate: 0.003,
  publicEmployeeRate: 0.088,
};

describe("resolveInpsRates", () => {
  it("returns standard rate for indeterminato in a small company", () => {
    const rates = resolveInpsRates(CFG, { contractType: "indeterminato" });
    expect(rates.standardRate).toBe(0.0919);
    expect(rates.aboveCeilingRate).toBe(0.1019);
  });

  it("adds CIGS 0,30% for indeterminato in azienda > 15 dipendenti", () => {
    const rates = resolveInpsRates(CFG, {
      contractType: "indeterminato",
      companySize: "large",
    });
    expect(rates.standardRate).toBeCloseTo(0.0949, 4);
    expect(rates.aboveCeilingRate).toBeCloseTo(0.1049, 4);
  });

  it("uses apprenticeship rate regardless of company size", () => {
    const rates = resolveInpsRates(CFG, {
      contractType: "apprendistato",
      companySize: "large",
    });
    expect(rates.standardRate).toBe(0.0584);
    expect(rates.aboveCeilingRate).toBe(0.0584);
  });

  it("uses public employee rate 8,80% for dipendenti pubblici", () => {
    const rates = resolveInpsRates(CFG, {
      contractType: "indeterminato",
      isPublicEmployee: true,
    });
    expect(rates.standardRate).toBe(0.088);
    expect(rates.aboveCeilingRate).toBe(0.088);
  });

  it("public employee flag wins over large company addizionale", () => {
    const rates = resolveInpsRates(CFG, {
      contractType: "indeterminato",
      companySize: "large",
      isPublicEmployee: true,
    });
    expect(rates.standardRate).toBe(0.088);
  });

  it("public employee flag wins over apprendistato", () => {
    const rates = resolveInpsRates(CFG, {
      contractType: "apprendistato",
      isPublicEmployee: true,
    });
    expect(rates.standardRate).toBe(0.088);
  });

  it("override beats every other branch", () => {
    const rates = resolveInpsRates(CFG, {
      contractType: "apprendistato",
      isPublicEmployee: true,
      companySize: "large",
      override: { employeeRate: 0.075, employerRate: 0.22 },
    });
    expect(rates.standardRate).toBe(0.075);
    expect(rates.aboveCeilingRate).toBe(0.075);
  });

  it("falls back to standard when largeCompanyAdditionalRate is absent", () => {
    const cfgNoCigs: InpsConfig = {
      standardRate: 0.0919,
      aboveCeilingRate: 0.1019,
      ceiling: 56_224,
      massimale: 122_295,
    };
    const rates = resolveInpsRates(cfgNoCigs, {
      contractType: "indeterminato",
      companySize: "large",
    });
    expect(rates.standardRate).toBe(0.0919);
  });

  it("falls back to standard when isPublicEmployee but publicEmployeeRate is absent", () => {
    const cfgNoPublic: InpsConfig = {
      standardRate: 0.0919,
      aboveCeilingRate: 0.1019,
      ceiling: 56_224,
      massimale: 122_295,
    };
    const rates = resolveInpsRates(cfgNoPublic, {
      contractType: "indeterminato",
      isPublicEmployee: true,
    });
    expect(rates.standardRate).toBe(0.0919);
  });
});

describe("resolveEmployerInpsRate", () => {
  const EMPLOYER = { rate: 0.2381, apprenticeshipRate: 0.1181 };

  it("returns the standard rate for indeterminato", () => {
    expect(resolveEmployerInpsRate(EMPLOYER, "indeterminato")).toBe(0.2381);
  });

  it("returns the apprenticeship rate for apprendistato", () => {
    expect(resolveEmployerInpsRate(EMPLOYER, "apprendistato")).toBe(0.1181);
  });

  it("override wins over contract type", () => {
    const rate = resolveEmployerInpsRate(EMPLOYER, "apprendistato", {
      employeeRate: 0.0949,
      employerRate: 0.25,
    });
    expect(rate).toBe(0.25);
  });
});
