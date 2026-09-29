import { describe, expect, it } from "vitest";
import { employerCostBreakdown } from "@/islands/home/derive.ts";
import { computeEmployerCost } from "./compute.ts";
import { deriveEmployerCost, employerCostAssumptions, employerCostLedger } from "./derive.ts";
import type { EmployerCostValues } from "./state.ts";

const VALUES: EmployerCostValues = {
  grossAnnual: 30_000,
  taxYear: 2026,
  contractType: "indeterminato",
  regionCode: "lombardia",
  comune: null,
  municipalRate: 0.008,
  paymentFrequency: 13,
};

function cents(amount: number): number {
  return Math.round(amount * 100);
}

describe("deriveEmployerCost", () => {
  it("gives the cost breakdown with the gross and the net it pays for", () => {
    const result = computeEmployerCost(VALUES, null);
    const derived = deriveEmployerCost(result);
    expect(derived).toEqual({
      cost: employerCostBreakdown(result.breakdown),
      ledger: employerCostLedger(employerCostBreakdown(result.breakdown)),
      grossAnnual: 30_000,
      netAnnual: result.breakdown.netAnnual,
      netMonthly: result.breakdown.netMonthly,
      assumptions: employerCostAssumptions(result),
    });
    expect(derived.cost.total).toBe(result.breakdown.totalEmployerCost);
    expect(derived.cost.employerInps).toBeGreaterThan(0);
    expect(derived.cost.tfr).toBeGreaterThan(0);
    expect(derived.cost.otherCosts.length).toBeGreaterThan(0);
    expect(derived.cost.costPerNetEuro).toBeGreaterThan(1);
  });

  it("adds the NASpI surcharge for a fixed-term contract", () => {
    const fixedTerm = deriveEmployerCost(
      computeEmployerCost({ ...VALUES, contractType: "determinato" }, null),
    );
    expect(fixedTerm.cost.otherCosts.map((line) => line.id)).toContain("naspiAdditional");
  });

  it.each([30_000, 31_234.57, 47_777.77, 123_456.78])(
    "builds a cost ledger whose rows add up to the total for %d €",
    (grossAnnual) => {
      const { ledger } = deriveEmployerCost(computeEmployerCost({ ...VALUES, grossAnnual }, null));
      const others = ledger.others.reduce((sum, line) => sum + cents(line.amount), 0);
      expect(cents(ledger.othersTotal)).toBe(others);
      expect(cents(ledger.total)).toBe(
        cents(ledger.gross) + cents(ledger.inps) + cents(ledger.tfr) + others,
      );
      expect(Math.abs(ledger.total - ledger.totalMonthly * 12)).toBeLessThan(0.06);
    },
  );

  it("rounds each line before adding, in the engine as in the ledger", () => {
    const result = computeEmployerCost({ ...VALUES, grossAnnual: 20_004 }, null);
    const { ledger } = deriveEmployerCost(result);
    expect(result.breakdown.totalEmployerCost).toBe(26_958.88);
    expect(result.breakdown.totalOtherEmployerCosts).toBe(810.17);
    expect(ledger.othersTotal).toBe(810.17);
    expect(ledger.total).toBe(26_958.88);
    expect(ledger.totalMonthly).toBe(2_246.57);
  });

  it("lists what the estimate assumes, each with the field that changes it", () => {
    expect(employerCostAssumptions(computeEmployerCost(VALUES, null))).toEqual([
      { id: "year", value: 2026, fieldToEdit: "year" },
      { id: "contract", value: "indeterminato", fieldToEdit: "contractType" },
      { id: "region", value: "lombardia", fieldToEdit: "region" },
      { id: "municipalRate", value: 0.008, fieldToEdit: "municipalRate" },
      { id: "paymentFrequency", value: 13, fieldToEdit: "paymentFrequency" },
    ]);
  });
});
