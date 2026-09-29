import { describe, expect, it } from "vitest";
import { param, SUPPORTED_YEARS, yearStart } from "@/data/index.ts";
import { applyProgressiveBrackets } from "@/domain/index.ts";
import { bracketShares, inCents, methodExample, netSteps } from "./example.ts";

describe.each(SUPPORTED_YEARS)("esempio di Come calcoliamo il netto nel %s", (year) => {
  const example = methodExample(year);
  const { breakdown } = example;

  it("parte dal lordo e toglie i contributi per arrivare all’imponibile", () => {
    expect(inCents(breakdown.grossAnnual) - inCents(breakdown.inpsContribution)).toBe(
      inCents(breakdown.taxableIncome),
    );
  });

  it("scompone l’IRPEF lorda per scaglione e le parti tornano al centesimo", () => {
    const shareCents = example.shares.reduce((sum, share) => sum + inCents(share.tax), 0);
    expect(shareCents).toBe(inCents(breakdown.irpefGross));
    const amountCents = example.shares.reduce((sum, share) => sum + inCents(share.amount), 0);
    expect(amountCents).toBe(inCents(breakdown.taxableIncome));
  });

  it("toglie le detrazioni dall’IRPEF lorda per arrivare all’IRPEF netta", () => {
    expect(
      inCents(breakdown.irpefGross) -
        inCents(breakdown.irpefDeduction) -
        inCents(breakdown.dependentsDeduction) -
        inCents(breakdown.expenseDeduction) -
        inCents(breakdown.detrazioneAggiuntiva),
    ).toBe(inCents(breakdown.irpefNet));
  });

  it("arriva al netto annuo sommando le voci arrotondate", () => {
    const total = netSteps(breakdown).reduce(
      (sum, step) => sum + step.sign * inCents(step.amount),
      0,
    );
    expect(total).toBe(inCents(breakdown.netAnnual));
  });

  it("usa l’aliquota comunale del comune dell’esempio", () => {
    expect(example.comune.ruleYear).toBeLessThanOrEqual(year);
    expect(breakdown.municipalTax).toBeGreaterThan(0);
  });
});

describe("scaglioni dell’esempio", () => {
  it("coprono tutto il reddito anche quando cade in un solo scaglione", () => {
    const brackets = param("irpef.brackets", yearStart(2026));
    for (const income of [12_000, 28_000, 31_783.5, 50_000, 80_000]) {
      const shares = bracketShares(income, brackets);
      const tax = shares.reduce((sum, share) => sum + share.tax, 0);
      expect(tax).toBeCloseTo(applyProgressiveBrackets(income, brackets), 1);
      expect(shares.at(-1)?.position).not.toBe("first");
    }
  });
});
