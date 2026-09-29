import { describe, expect, it } from "vitest";
import { REGIONS_LIST, SUPPORTED_YEARS } from "@/data/index.ts";

const cases = REGIONS_LIST.flatMap((region) =>
  SUPPORTED_YEARS.map((year) => [region.name, year, region.rules[year]] as const),
);

describe("addizionale regionale: forma delle tabelle", () => {
  it.each(cases)("%s %i: scaglioni da 0 a infinito, senza buchi", (_name, _year, rules) => {
    const brackets = rules.taxBrackets;
    expect(brackets.length).toBeGreaterThan(0);
    expect(brackets[0]?.min).toBe(0);
    expect(brackets[brackets.length - 1]?.max).toBeNull();
    brackets.forEach((bracket, i) => {
      const next = brackets[i + 1];
      if (next) expect(next.min).toBe(bracket.max);
      expect(bracket.rate).toBeGreaterThan(0);
      expect(bracket.rate).toBeLessThanOrEqual(0.0363);
    });
  });

  it.each(cases)(
    "%s %i: esenzioni, aliquote agevolate e detrazioni coerenti",
    (_name, _year, rules) => {
      if (rules.exemptionThreshold !== undefined) {
        expect(rules.exemptionThreshold).toBeGreaterThan(0);
      }
      if (rules.flatRate !== undefined) {
        expect(rules.flatRate.upToIncome).toBeGreaterThan(0);
        expect(rules.flatRate.rate).toBeGreaterThan(0);
      }
      for (const deduction of rules.taxDeductions ?? []) {
        expect(deduction.amount).toBeGreaterThan(0);
        if (deduction.above !== undefined && deduction.upTo !== undefined) {
          expect(deduction.upTo).toBeGreaterThan(deduction.above);
        }
      }
    },
  );
});
