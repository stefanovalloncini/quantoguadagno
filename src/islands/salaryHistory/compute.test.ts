import { describe, expect, it } from "vitest";
import { calculateSalaryBreakdown } from "@/domain/index.ts";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import { adjustedValueFor, buildSalaryInput, computeHistoryNet, projectSalary } from "./compute.ts";
import { DEFAULT_ENTRY_SETTINGS, type SalaryEntry } from "./storage.ts";

const BASE: SalaryEntry = {
  id: "x",
  year: 2024,
  grossAnnual: 30_000,
  createdAt: "2024-06-01T00:00:00Z",
  settings: DEFAULT_ENTRY_SETTINGS,
};

describe("buildSalaryInput", () => {
  it("maps a supported-year entry to a SalaryInput", () => {
    const input = buildSalaryInput(BASE);
    expect(input).not.toBeNull();
    expect(input?.taxYear).toBe(2024);
    expect(input?.grossAnnual).toBe(30_000);
    expect(input?.regionCode).toBe("lombardia");
    expect(input?.contractType).toBe("indeterminato");
    expect(input?.paymentFrequency).toBe(13);
    expect(input?.municipalTaxRate).toBeCloseTo(0.008);
  });

  it("returns null for years without tax rules", () => {
    expect(buildSalaryInput({ ...BASE, year: 2015 })).toBeNull();
    expect(buildSalaryInput({ ...BASE, year: 2027 })).toBeNull();
  });

  it("passes through optional settings when present", () => {
    const dependents = {
      hasSpouse: true,
      spouseIncome: 0,
      childrenOver21: 1,
      otherDependents: 0,
    };
    const input = buildSalaryInput({
      ...BASE,
      settings: { ...DEFAULT_ENTRY_SETTINGS, dependents, companySize: "large" },
    });
    expect(input?.dependents).toEqual(dependents);
    expect(input?.companySize).toBe("large");
  });
});

describe("computeHistoryNet", () => {
  it("matches calling calculateSalaryBreakdown directly", () => {
    const direct = calculateSalaryBreakdown({
      grossAnnual: 30_000,
      taxYear: 2024,
      regionCode: "lombardia",
      municipalTaxRate: 0.008,
      contractType: "indeterminato",
      paymentFrequency: 13,
    });
    const viaMapper = computeHistoryNet(BASE);
    expect(viaMapper?.netAnnual).toBe(direct.netAnnual);
    expect(viaMapper?.netMonthly).toBe(direct.netMonthly);
    expect(viaMapper?.irpefNet).toBe(direct.irpefNet);
  });

  it("returns null for unsupported years", () => {
    expect(computeHistoryNet({ ...BASE, year: 2015 })).toBeNull();
  });
});

describe("adjustedValueFor", () => {
  it("matches calling adjustValueAcrossYears directly", () => {
    const adjusted = adjustedValueFor(BASE, 2026);
    expect(adjusted?.fromYear).toBe(2024);
    expect(adjusted?.toYear).toBe(2026);
    expect(adjusted?.nominal).toBe(30_000);
  });
});

describe("projectSalary", () => {
  const recent: SalaryEntry = { ...BASE, year: 2026 };

  it("returns one row per year up to the horizon", () => {
    const rows = projectSalary({ baseEntry: recent, horizonYears: 5, growthRate: 0.02 });
    expect(rows).toHaveLength(5);
    expect(rows.map((r) => r.year)).toEqual([2027, 2028, 2029, 2030, 2031]);
  });

  it("compounds gross by the growth rate each year", () => {
    const rows = projectSalary({ baseEntry: recent, horizonYears: 3, growthRate: 0.05 });
    expect(rows[0]?.grossAnnual).toBe(Math.round(30_000 * 1.05));
    expect(rows[1]?.grossAnnual).toBe(Math.round(30_000 * 1.05 ** 2));
    expect(rows[2]?.grossAnnual).toBe(Math.round(30_000 * 1.05 ** 3));
  });

  it("computes net using the latest supported tax rules", () => {
    const rows = projectSalary({ baseEntry: recent, horizonYears: 1, growthRate: 0 });
    const direct = calculateSalaryBreakdown({
      grossAnnual: 30_000,
      taxYear: LATEST_SUPPORTED_YEAR,
      regionCode: DEFAULT_ENTRY_SETTINGS.regionCode,
      municipalTaxRate: DEFAULT_ENTRY_SETTINGS.municipalTaxRate,
      contractType: DEFAULT_ENTRY_SETTINGS.contractType,
      paymentFrequency: DEFAULT_ENTRY_SETTINGS.paymentFrequency,
    });
    expect(rows[0]?.net?.netAnnual).toBe(direct.netAnnual);
  });

  it("returns an empty array when horizonYears is 0", () => {
    expect(projectSalary({ baseEntry: recent, horizonYears: 0, growthRate: 0.02 })).toEqual([]);
  });

  it("supports negative growth", () => {
    const rows = projectSalary({ baseEntry: recent, horizonYears: 2, growthRate: -0.05 });
    expect(rows[0]?.grossAnnual).toBe(Math.round(30_000 * 0.95));
    expect(rows[1]?.grossAnnual).toBe(Math.round(30_000 * 0.95 ** 2));
  });

  it("returns an empty array when the base entry has no supported tax rules", () => {
    expect(
      projectSalary({ baseEntry: { ...BASE, year: 2015 }, horizonYears: 3, growthRate: 0.02 }),
    ).toEqual([]);
  });
});
