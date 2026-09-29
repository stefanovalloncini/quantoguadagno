import { describe, expect, it } from "vitest";
import { calculateNaspi, type NaspiInput } from "./naspi.ts";
import { getNaspiConfig, getTaxConfig } from "./taxConfig.ts";

const baseInput = (overrides: Partial<NaspiInput> = {}): NaspiInput => ({
  grossPay4Years: 100_000,
  weeksContribution4Years: 200,
  age: 40,
  voluntaryResignationInLast12Months: false,
  weeksAfterVoluntaryResignation: 0,
  config: getNaspiConfig(2026),
  ...overrides,
});

describe("NASpI eligibility", () => {
  it("rejects under 13 weeks of contribution", () => {
    const r = calculateNaspi(baseInput({ weeksContribution4Years: 10 }));
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain("insufficient-weeks");
  });

  it("rejects if voluntary resignation in 12 months and fewer than 13 new weeks", () => {
    const r = calculateNaspi(
      baseInput({
        voluntaryResignationInLast12Months: true,
        weeksAfterVoluntaryResignation: 10,
      }),
    );
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain("voluntary-resignation-lockout");
  });

  it("admits if 13+ weeks accrued after voluntary resignation", () => {
    const r = calculateNaspi(
      baseInput({
        voluntaryResignationInLast12Months: true,
        weeksAfterVoluntaryResignation: 15,
      }),
    );
    expect(r.eligible).toBe(true);
  });
});

describe("NASpI monthly amount — 75/25 split", () => {
  it("returns 0.75 × R when R is below the soglia", () => {
    const r = calculateNaspi(baseInput({ grossPay4Years: 46_000, weeksContribution4Years: 200 }));
    expect(r.referenceMonthlyPay).toBeCloseTo(996.67, 1);
    expect(r.monthlyAmount).toBeCloseTo(747.5, 1);
  });

  it("returns 0.75 × soglia + 0.25 × excess when R is above the soglia", () => {
    const r = calculateNaspi(baseInput());
    expect(r.referenceMonthlyPay).toBeCloseTo(2_166.67, 1);
    expect(r.monthlyAmount).toBeCloseTo(1_270.03, 1);
  });

  it("caps at the massimale for high R", () => {
    const r = calculateNaspi(baseInput({ grossPay4Years: 300_000 }));
    expect(r.monthlyAmount).toBe(1_584.7);
    expect(r.capped).toBe(true);
  });
});

describe("NASpI duration", () => {
  it("is min(weeks/2, 104)", () => {
    expect(calculateNaspi(baseInput({ weeksContribution4Years: 200 })).durationWeeks).toBe(100);
    expect(calculateNaspi(baseInput({ weeksContribution4Years: 250 })).durationWeeks).toBe(104);
    expect(calculateNaspi(baseInput({ weeksContribution4Years: 25 })).durationWeeks).toBe(12);
  });
});

describe("NASpI decalage schedule", () => {
  it("is flat through month 5 then drops 3 % monthly for under-55", () => {
    const r = calculateNaspi(baseInput());
    expect(r.schedule[0]?.amount).toBeCloseTo(r.monthlyAmount, 1);
    expect(r.schedule[4]?.amount).toBeCloseTo(r.monthlyAmount, 1);
    expect(r.schedule[5]?.amount).toBeCloseTo(r.monthlyAmount * 0.97, 1);
    expect(r.schedule[6]?.amount).toBeCloseTo(r.monthlyAmount * 0.97 * 0.97, 1);
  });

  it("starts décalage at month 8 for age ≥ 55", () => {
    const r = calculateNaspi(baseInput({ age: 55 }));
    expect(r.schedule[6]?.amount).toBeCloseTo(r.monthlyAmount, 1);
    expect(r.schedule[7]?.amount).toBeCloseTo(r.monthlyAmount * 0.97, 1);
  });
});

describe("NASpI net (post-IRPEF)", () => {
  const brackets2026 = getTaxConfig(2026).irpefBrackets;

  it("returns net equal to gross when no brackets are provided", () => {
    const r = calculateNaspi(baseInput());
    expect(r.totalNet).toBe(r.totalGross);
    expect(r.monthlyAmountNet).toBe(r.monthlyAmount);
    expect(r.effectiveIrpefRate).toBe(0);
  });

  it("applies progressive IRPEF when brackets are provided", () => {
    const r = calculateNaspi(baseInput({ irpefBrackets: brackets2026 }));
    expect(r.totalNet).toBeLessThan(r.totalGross);
    expect(r.monthlyAmountNet).toBeLessThan(r.monthlyAmount);
    expect(r.effectiveIrpefRate).toBeGreaterThan(0);
    expect(r.effectiveIrpefRate).toBeLessThan(0.5);
  });

  it("schedule rows include net amounts proportional to gross", () => {
    const r = calculateNaspi(baseInput({ irpefBrackets: brackets2026 }));
    const ratio = r.totalNet / r.totalGross;
    for (const row of r.schedule) {
      expect(row.amountNet / row.amount).toBeCloseTo(ratio, 3);
    }
  });
});

describe("NASpI totals", () => {
  it("totalGross matches the sum of the schedule", () => {
    const r = calculateNaspi(baseInput());
    const sum = r.schedule.reduce((acc, m) => acc + m.amount, 0);
    expect(r.totalGross).toBeCloseTo(sum, 1);
  });

  it("totals are the cent sums of the rounded monthly lines", () => {
    const brackets = getTaxConfig(2026).irpefBrackets;
    for (const grossPay4Years of [41_234.57, 83_333.33, 99_999.99, 123_456.78]) {
      for (const input of [
        baseInput({ grossPay4Years }),
        baseInput({ grossPay4Years, irpefBrackets: brackets }),
      ]) {
        const r = calculateNaspi(input);
        const centsOf = (amount: number) => Math.round(amount * 100);
        const grossCents = r.schedule.reduce((sum, row) => sum + centsOf(row.amount), 0);
        const netCents = r.schedule.reduce((sum, row) => sum + centsOf(row.amountNet), 0);
        expect(centsOf(r.totalGross)).toBe(grossCents);
        expect(centsOf(r.totalNet)).toBe(netCents);
      }
    }
  });

  it("returns zeros when ineligible", () => {
    const r = calculateNaspi(baseInput({ weeksContribution4Years: 0 }));
    expect(r.monthlyAmount).toBe(0);
    expect(r.totalGross).toBe(0);
    expect(r.durationWeeks).toBe(0);
    expect(r.schedule).toHaveLength(0);
  });
});
