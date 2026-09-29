import { describe, expect, it } from "vitest";
import { calculateApprenticeship, calculateSalaryBreakdown } from "@/domain/index.ts";
import {
  deriveApprenticeship,
  ESTIMATE_MUNICIPAL_TAX_RATE,
  ESTIMATE_REGION_CODE,
  ESTIMATE_TAX_YEAR,
  estimateMonthlyNet,
} from "./derive.ts";

const RESULT = calculateApprenticeship({
  targetGrossAnnual: 28_000,
  years: 3,
  progression: [0.85, 0.9, 0.95, 1, 1],
});

describe("estimateMonthlyNet", () => {
  it("matches calling the composer directly with the estimate assumptions", () => {
    expect(estimateMonthlyNet(23_800)).toBe(
      calculateSalaryBreakdown({
        grossAnnual: 23_800,
        taxYear: ESTIMATE_TAX_YEAR,
        regionCode: ESTIMATE_REGION_CODE,
        municipalTaxRate: ESTIMATE_MUNICIPAL_TAX_RATE,
        contractType: "apprendistato",
        paymentFrequency: 12,
      }).netMonthly,
    );
  });
});

describe("deriveApprenticeship", () => {
  it("attaches an estimated monthly net to every schedule row", () => {
    const derived = deriveApprenticeship(RESULT);
    expect(derived.schedule).toHaveLength(RESULT.schedule.length);
    derived.schedule.forEach((row, index) => {
      const source = RESULT.schedule[index];
      expect(source).toBeDefined();
      expect(row.estimatedNetMonthly).toBe(estimateMonthlyNet(row.grossAnnual));
      expect(row.grossAnnual).toBe(source?.grossAnnual);
    });
  });

  it("picks out the first and last year of the schedule", () => {
    const derived = deriveApprenticeship(RESULT);
    expect(derived.firstYear?.year).toBe(1);
    expect(derived.lastYear?.year).toBe(3);
  });

  it("returns null first/last for an empty schedule", () => {
    const derived = deriveApprenticeship({ targetGrossAnnual: 0, years: 0, schedule: [] });
    expect(derived.schedule).toHaveLength(0);
    expect(derived.firstYear).toBeNull();
    expect(derived.lastYear).toBeNull();
  });
});
