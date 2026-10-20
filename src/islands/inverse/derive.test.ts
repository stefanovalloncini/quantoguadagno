import { describe, expect, it } from "vitest";
import { computeInverse } from "./compute.ts";
import { deriveInverse, inverseLines, inverseSummary } from "./derive.ts";
import { checkInverse, inverseDefaults, type InverseState } from "./state.ts";

function resultOf(patch: Partial<InverseState> = {}) {
  const { values } = checkInverse({ ...inverseDefaults("it"), ...patch }, "it");
  if (values === null) throw new Error("expected valid values");
  return computeInverse(values, null);
}

const RESULT = resultOf();

describe("inverseSummary", () => {
  it("leads with the gross that reaches the target", () => {
    const summary = inverseSummary(RESULT);
    expect(summary).toMatchObject({
      targetNetAnnual: 24_000,
      grossAnnual: RESULT.grossAnnual,
      grossMonthly: RESULT.breakdown.grossMonthly,
      netAnnual: RESULT.breakdown.netAnnual,
      netMonthly: RESULT.breakdown.netMonthly,
      converged: true,
    });
    expect(Math.abs(summary.gap)).toBeLessThanOrEqual(0.5);
  });
});

function cents(amount: number): number {
  return Math.round(amount * 100);
}

describe("inverseLines", () => {
  it("lists every line from the gross to the net, surcharges included", () => {
    const { breakdown: b } = RESULT;
    expect(inverseLines(RESULT)).toEqual([
      { id: "gross", kind: "plain", amount: b.grossAnnual },
      { id: "inps", kind: "deducted", amount: b.inpsContribution, rate: b.inpsRate },
      { id: "taxable", kind: "subtotal", amount: b.taxableIncome },
      { id: "irpef", kind: "deducted", amount: b.irpefNet },
      { id: "regional", kind: "deducted", amount: b.regionalTax },
      { id: "municipal", kind: "deducted", amount: b.municipalTax },
      { id: "net", kind: "total", amount: b.netAnnual },
    ]);
  });

  it.each(["24.000", "12.000", "15.500", "60.000"])(
    "adds up to the net reached for a target of %s €",
    (targetNetAnnual) => {
      const lines = inverseLines(resultOf({ targetNetAnnual }));
      const signed = lines
        .filter((line) => line.kind === "deducted" || line.kind === "credited")
        .reduce((sum, line) => sum + (line.kind === "credited" ? 1 : -1) * cents(line.amount), 0);
      const amount = (id: string) => cents(lines.find((line) => line.id === id)?.amount ?? NaN);
      expect(amount("gross") + signed).toBe(amount("net"));
      expect(amount("gross") - amount("inps")).toBe(amount("taxable"));
    },
  );

  it("shows the payroll credits of a low target", () => {
    const ids = inverseLines(resultOf({ targetNetAnnual: "12.000" })).map((line) => line.id);
    expect(ids).toContain("sommaAggiuntiva");
  });
});

describe("deriveInverse", () => {
  it("gives the contract the solve assumes, with its INPS rate for the ledger", () => {
    expect(deriveInverse(resultOf({ isPublicEmployee: true })).contract).toEqual({
      contractType: "indeterminato",
      isPublicEmployee: true,
      companySize: "small",
      insuredBefore1996: false,
      inpsOverride: null,
      employeeInpsRate: 0.088,
    });
  });

  it("bundles the three for the view", () => {
    expect(deriveInverse(RESULT)).toMatchObject({
      summary: inverseSummary(RESULT),
      lines: inverseLines(RESULT),
      contract: { contractType: "indeterminato", isPublicEmployee: false },
    });
  });
});
