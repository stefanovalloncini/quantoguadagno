import { describe, expect, it } from "vitest";
import { findComune, loadRegionComuni } from "@/data/index.ts";
import { computePayslip } from "./compute.ts";
import { derivePayslip, payslipInputs, payslipLines, payslipSummary } from "./derive.ts";
import { payslipStateFromSearch } from "./url.ts";

const MILANO = findComune(await loadRegionComuni("lombardia"), "F205") ?? null;

function resultOf(search: string) {
  const { result } = computePayslip(payslipStateFromSearch(search, "it"), "it", MILANO);
  if (result === null) throw new Error("expected a result");
  return result;
}

const REFERENCE = resultOf("?l=35000");

describe("payslipSummary", () => {
  it("balances earnings and withholdings to the net, like the reference sheet", () => {
    expect(payslipSummary(REFERENCE)).toEqual({
      year: 2026,
      paymentFrequency: 13,
      grossAnnual: 35_000,
      earnings: 35_000,
      withholdings: 8_967.79,
      netAnnual: 26_032.21,
      netMonthly: 2_002.48,
    });
  });

  it("counts the credits among the earnings", () => {
    const summary = payslipSummary(resultOf("?l=12000"));
    expect(summary.earnings).toBeGreaterThan(12_000);
    expect(summary.earnings - summary.withholdings).toBeCloseTo(summary.netAnnual, 2);
  });
});

describe("payslipInputs", () => {
  it("lists the parameters of the calculation", () => {
    expect(payslipInputs(REFERENCE)).toEqual([
      { id: "gross", value: 35_000 },
      { id: "year", value: 2026 },
      { id: "region", value: "lombardia" },
      { id: "municipalRate", value: 0.008, fieldToEdit: "municipalRate" },
      { id: "contract", value: "indeterminato" },
      { id: "frequency", value: 13 },
      { id: "companySize", value: "small" },
    ]);
  });

  it("adds the public sector, the custom INPS rates and the comune when they apply", () => {
    const inputs = payslipInputs(resultOf("?r=toscana&p=1&e=9.49&d=23.81"));
    expect(inputs).toContainEqual({ id: "region", value: "toscana" });
    expect(inputs).toContainEqual({ id: "publicEmployee", value: true });
    expect(inputs).toContainEqual({
      id: "inpsOverride",
      value: { employeeRate: 0.0949, employerRate: 0.2381 },
    });
    expect(payslipInputs(resultOf("?k=F205"))[3]).toMatchObject({
      id: "comune",
      value: { name: "Milano", ruleYear: 2025 },
    });
  });

  it("shows the solved gross of a link shared from the net", () => {
    const solved = resultOf("?s=n&n=1800");
    expect(payslipInputs(solved)[0]).toEqual({ id: "gross", value: solved.input.grossAnnual });
  });
});

describe("payslipLines", () => {
  it("keeps the rows of the live print page", () => {
    expect(payslipLines(REFERENCE.breakdown).map((line) => [line.id, line.amount])).toEqual([
      ["gross", 35_000],
      ["inps", 3_216.5],
      ["taxableIncome", 31_783.5],
      ["irpefGross", 7_688.56],
      ["totalDeductions", 2_646.52],
      ["irpefNet", 5_042.04],
      ["regional", 454.98],
      ["municipal", 254.27],
      ["netAnnual", 26_032.21],
    ]);
  });

  it("adds the credits when they are paid", () => {
    const ids = payslipLines(resultOf("?l=12000").breakdown).map((line) => line.id);
    expect(ids).toEqual(expect.arrayContaining(["trattamento", "sommaAggiuntiva"]));
  });

  it("bundles summary, inputs and lines", () => {
    expect(derivePayslip(REFERENCE)).toEqual({
      summary: payslipSummary(REFERENCE),
      inputs: payslipInputs(REFERENCE),
      lines: payslipLines(REFERENCE.breakdown),
    });
  });
});
