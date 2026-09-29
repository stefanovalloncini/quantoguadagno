import { describe, expect, it } from "vitest";
import { findComune, loadRegionComuni, type Comune } from "@/data/index.ts";
import { calculateSalaryBreakdown, type SalaryInput } from "@/domain/composer.ts";
import { calculateInverseSalary } from "@/domain/inverseSalary.ts";
import {
  computeEmployee,
  loadComune,
  municipalInput,
  municipalSource,
  salaryInputForYear,
  type SalaryContext,
} from "./compute.ts";
import { checkEmployee, employeeDefaults, type EmployeeState } from "./state.ts";

const IT = employeeDefaults("it");

async function comuneOf(region: Parameters<typeof loadRegionComuni>[0], id: string) {
  const comune = findComune(await loadRegionComuni(region), id);
  if (comune === undefined) throw new Error(`missing comune ${id}`);
  return comune;
}

const MILANO = await comuneOf("lombardia", "F205");
const UGGIATE = await comuneOf("lombardia", "M435");
const ACQUAVIVA = await comuneOf("molise", "A051");

function compute(patch: Partial<EmployeeState>, comune: Comune | null = null) {
  const { values } = checkEmployee({ ...IT, ...patch }, "it");
  if (values === null) throw new Error("expected valid values");
  return computeEmployee(values, comune);
}

const PLAIN_CONTEXT: SalaryContext = {
  taxYear: 2026,
  regionCode: "lombardia",
  municipalTaxRate: 0.008,
  contractType: "indeterminato",
  paymentFrequency: 13,
  companySize: "small",
  isPublicEmployee: false,
  insuredBefore1996: false,
  inpsOverride: null,
  dependents: null,
  expenseDeductions: null,
  fringeBenefits: null,
  specialConditions: null,
  premioRisultato: null,
};

const PLAIN: SalaryInput = { ...PLAIN_CONTEXT, grossAnnual: 30_000 };

describe("computeEmployee from the gross", () => {
  it("feeds the engine exactly what the form says", () => {
    const result = compute({});
    expect(result.input).toEqual(PLAIN);
    expect(result.breakdown).toEqual(calculateSalaryBreakdown(PLAIN));
    expect(result.breakdown.netAnnual).toBeCloseTo(23_425.52, 2);
    expect(result.solve).toBeNull();
    expect(result.municipal).toEqual({ kind: "manual", rate: 0.008 });
  });

  it("matches the reference case: 35.000 € in Lombardia, 0,8%, 13 mensilità, 2026", () => {
    const { breakdown } = compute({ gross: "35.000" });
    expect(breakdown.netAnnual).toBe(26_032.21);
    expect(breakdown.netMonthly).toBe(2_002.48);
  });

  it("passes every extra to the engine unchanged", () => {
    const result = compute({
      gross: "45k",
      year: 2025,
      region: "lazio",
      municipalRate: "0,9",
      paymentFrequency: 14,
      contractType: "determinato",
      companySize: "large",
      insuredBefore1996: true,
      hasSpouse: true,
      spouseIncome: "1.000",
      childrenOver21: "1",
      medicalExpenses: "1.200",
      pensionFund: "2.000",
      impatriati: true,
      madreLavoratrice: true,
      premio: "1.000",
      mealVoucherValue: "10",
      mealVoucherType: "paper",
      welfare: "900",
    });
    const input: SalaryInput = {
      ...PLAIN,
      grossAnnual: 45_000,
      taxYear: 2025,
      regionCode: "lazio",
      municipalTaxRate: 0.009,
      paymentFrequency: 14,
      contractType: "determinato",
      companySize: "large",
      insuredBefore1996: true,
      dependents: { hasSpouse: true, spouseIncome: 1_000, childrenOver21: 1, otherDependents: 0 },
      expenseDeductions: {
        mortgageInterest: 0,
        medicalExpenses: 1_200,
        otherDeductions: 0,
        pensionFund: 2_000,
      },
      specialConditions: {
        regimeImpatriati: { enabled: true, hasMinorChildren: false },
        madreLavoratrice: { enabled: true, numberOfChildren: 3, youngestChildAge: 5 },
      },
      premioRisultato: { amount: 1_000 },
      fringeBenefits: {
        mealVouchers: { dailyValue: 10, workingDaysPerMonth: 22, type: "paper" },
        welfare: { annualAmount: 900, hasDependentChildren: false },
      },
    };
    expect(result.input).toEqual(input);
    expect(result.breakdown).toEqual(calculateSalaryBreakdown(input));
  });
});

describe("computeEmployee from the wanted net", () => {
  it("solves the gross that produces the wanted net, like the live page", () => {
    const result = compute({ mode: "net", targetNet: "1.800" });
    expect(result.input.grossAnnual).toBeGreaterThan(29_000);
    expect(result.input.grossAnnual).toBeLessThan(30_000);
    expect(Number.isInteger(result.input.grossAnnual)).toBe(true);
    expect(Math.abs(result.breakdown.netAnnual - 1_800 * 13)).toBeLessThan(2);
    expect(result.solve).toEqual({ targetNetAnnual: 23_400, converged: true });
  });

  it("equals solving with the engine and rounding the gross", () => {
    const result = compute({ mode: "net", targetNet: "2.150", region: "lazio", year: 2025 });
    const other: SalaryContext = { ...PLAIN_CONTEXT, taxYear: 2025, regionCode: "lazio" };
    const solved = calculateInverseSalary({ targetNetAnnual: 2_150 * 13, other });
    const input: SalaryInput = { ...other, grossAnnual: Math.round(solved.grossAnnual) };
    expect(result.input).toEqual(input);
    expect(result.breakdown).toEqual(calculateSalaryBreakdown(input));
  });

  it("keeps the other inputs in effect and re-solves when the mensilità change", () => {
    const thirteen = compute({ mode: "net", targetNet: "1.800", region: "lazio", year: 2025 });
    expect(thirteen.input.regionCode).toBe("lazio");
    expect(thirteen.input.taxYear).toBe(2025);
    const fourteen = compute({ mode: "net", targetNet: "1.800", paymentFrequency: 14 });
    expect(fourteen.input.grossAnnual).toBeGreaterThan(compute({ mode: "net" }).input.grossAnnual);
    expect(Math.abs(fourteen.breakdown.netAnnual - 1_800 * 14)).toBeLessThan(2);
  });
});

describe("the comune's rule", () => {
  it("replaces the manual rate once the comune is loaded", () => {
    const result = compute({ gross: "35.000", comune: "F205" }, MILANO);
    expect(result.municipal).toEqual({
      kind: "comune",
      comune: MILANO,
      rule: { rate: 0.8, exemption: 23_000 },
      ruleYear: 2025,
    });
    expect(result.input.municipalTaxRate).toEqual({ rate: 0.8, exemption: 23_000 });
    expect(result.breakdown).toEqual(
      calculateSalaryBreakdown({
        ...PLAIN,
        grossAnnual: 35_000,
        municipalTaxRate: { rate: 0.8, exemption: 23_000 },
      }),
    );
    expect(result.breakdown.netAnnual).toBe(26_032.21);
  });

  it("applies the comune's exemption where a flat rate would not", () => {
    const exempt = compute({ gross: "22.000", comune: "F205" }, MILANO);
    expect(exempt.breakdown.municipalTax).toBe(0);
    expect(compute({ gross: "22.000" }).breakdown.municipalTax).toBeGreaterThan(0);
  });

  it("keeps the manual rate while the comune is loading or when it is another one", () => {
    expect(compute({ comune: "F205", municipalRate: "0,5" }).municipal).toEqual({
      kind: "manual",
      rate: 0.005,
    });
    expect(compute({ comune: "C337" }, MILANO).municipal).toEqual({ kind: "manual", rate: 0.008 });
    expect(compute({}, MILANO).comune).toBeNull();
  });

  it("falls back to the manual rate for a year before the comune's first rule", () => {
    const early = compute({ comune: "M435", year: 2024, municipalRate: "0,6" }, UGGIATE);
    expect(early.municipal).toEqual({ kind: "manual", rate: 0.006 });
    expect(early.comune).toBe(UGGIATE);
    expect(compute({ comune: "M435", year: 2026 }, UGGIATE).municipal).toMatchObject({
      kind: "comune",
      ruleYear: 2025,
    });
  });

  it("treats a comune without addizionale as a zero rate, not as a missing rule", () => {
    const source = municipalSource(ACQUAVIVA, 0.008, 2026);
    expect(source).toEqual({
      kind: "comune",
      comune: ACQUAVIVA,
      rule: { rate: 0 },
      ruleYear: 2025,
    });
    expect(municipalInput(source)).toEqual({ rate: 0 });
  });

  it("resolves the rule again for each year of a comparison", () => {
    const result = compute({ comune: "M435", year: 2026, municipalRate: "0,6" }, UGGIATE);
    expect(salaryInputForYear(result, 2024).municipalTaxRate).toBe(0.006);
    expect(salaryInputForYear(result, 2025)).toEqual({
      ...result.input,
      taxYear: 2025,
      municipalTaxRate: UGGIATE.years["2025"],
    });
  });
});

describe("loadComune", () => {
  it("loads the region's file and finds the comune by its code", async () => {
    await expect(loadComune("lombardia", "F205")).resolves.toEqual(MILANO);
  });

  it("returns null for a code that is not in that region", async () => {
    await expect(loadComune("lombardia", "H501")).resolves.toBeNull();
  });
});
