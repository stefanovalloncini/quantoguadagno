import { describe, expect, it } from "vitest";
import { findComune, loadRegionComuni, type Comune, type RegionCode } from "@/data/index.ts";
import { calculateSalaryBreakdown, type SalaryBreakdown } from "@/domain/composer.ts";
import { calculateRaiseImpact } from "@/domain/raiseImpact.ts";
import { computeEmployee } from "./compute.ts";
import {
  activeGroups,
  bracketIndicator,
  comuneSearchKey,
  contractAssumption,
  credits,
  deriveEmployee,
  employeeHints,
  employeeLimits,
  employeeLinks,
  employerCostBreakdown,
  ledgerLines,
  localAssumption,
  notices,
  raiseImpact,
  regionSummary,
  searchComuni,
  yearComparison,
} from "./derive.ts";
import { checkEmployee, employeeDefaults, type EmployeeState } from "./state.ts";

const IT = employeeDefaults("it");

async function regionComuni(region: RegionCode): Promise<readonly Comune[]> {
  return (await loadRegionComuni(region)).comuni;
}

const LOMBARDIA = await regionComuni("lombardia");
const MOLISE = await regionComuni("molise");

function comuneIn(comuni: readonly Comune[], id: string): Comune {
  const comune = findComune({ region: "lombardia", comuni }, id);
  if (comune === undefined) throw new Error(`missing comune ${id}`);
  return comune;
}

const MILANO = comuneIn(LOMBARDIA, "F205");
const UGGIATE = comuneIn(LOMBARDIA, "M435");

function valuesOf(patch: Partial<EmployeeState>) {
  const { values } = checkEmployee({ ...IT, ...patch }, "it");
  if (values === null) throw new Error("expected valid values");
  return values;
}

function resultOf(patch: Partial<EmployeeState>, comune: Comune | null = null) {
  return computeEmployee(valuesOf(patch), comune);
}

function lineIds(breakdown: SalaryBreakdown): readonly string[] {
  return ledgerLines(breakdown).map((line) => line.id);
}

const REFERENCE = resultOf({ gross: "35.000" });

describe("yearComparison", () => {
  it("compares the same gross across the supported years", () => {
    expect(yearComparison(REFERENCE)).toEqual([
      {
        year: 2024,
        netAnnual: 24_956.54,
        netMonthly: 1_919.73,
        deltaAnnual: -1_075.67,
        selected: false,
      },
      {
        year: 2025,
        netAnnual: 25_956.54,
        netMonthly: 1_996.66,
        deltaAnnual: -75.67,
        selected: false,
      },
      { year: 2026, netAnnual: 26_032.21, netMonthly: 2_002.48, deltaAnnual: 0, selected: true },
    ]);
  });

  it("reuses the selected year's own result", () => {
    const rows = yearComparison(resultOf({ gross: "35.000", year: 2025 }));
    expect(rows.find((row) => row.selected)).toMatchObject({ year: 2025, netAnnual: 25_956.54 });
    expect(rows.find((row) => row.year === 2026)?.deltaAnnual).toBe(75.67);
  });

  it("applies each year's comune rule, falling back to the manual rate before the first one", () => {
    const result = resultOf({ comune: "M435", municipalRate: "0,6" }, UGGIATE);
    const rows = yearComparison(result);
    const base = { ...result.input, taxYear: 2024 as const, municipalTaxRate: 0.006 };
    expect(rows[0]?.netAnnual).toBe(calculateSalaryBreakdown(base).netAnnual);
    expect(rows[1]?.netAnnual).toBe(
      calculateSalaryBreakdown({
        ...result.input,
        taxYear: 2025,
        municipalTaxRate: UGGIATE.years["2025"] ?? 0,
      }).netAnnual,
    );
  });
});

describe("bracketIndicator", () => {
  it("places the taxable income in its bracket and measures the distance to the next", () => {
    const indicator = bracketIndicator(31_783.5, 2026);
    expect(indicator).toMatchObject({ currentIndex: 1, distanceToNext: 18_216.5, nextRate: 0.43 });
    expect(indicator?.brackets.map((bracket) => bracket.rate)).toEqual([0.23, 0.33, 0.43]);
    expect(indicator?.progress).toBeCloseTo(3_783.5 / 22_000, 10);
  });

  it("names the next rate of the year", () => {
    expect(bracketIndicator(10_000, 2024)).toMatchObject({
      currentIndex: 0,
      distanceToNext: 18_000,
      nextRate: 0.35,
    });
    expect(bracketIndicator(10_000, 2026)?.nextRate).toBe(0.33);
  });

  it("has nothing further to reach in the top bracket", () => {
    expect(bracketIndicator(60_000, 2026)).toMatchObject({
      currentIndex: 2,
      progress: null,
      distanceToNext: null,
      nextRate: null,
    });
    expect(bracketIndicator(50_000, 2026)?.currentIndex).toBe(2);
  });
});

describe("raiseImpact", () => {
  it("measures a raise of 1.000 € lordi, like the reference board", () => {
    const raise = raiseImpact(REFERENCE);
    expect(raise).toMatchObject({ increment: 1_000, netGainAnnual: 420.26, netGainMonthly: 32.33 });
    expect(raise.keptShare).toBeCloseTo(0.42026, 5);
    expect(raise.withheldShare).toBeCloseTo(0.57974, 5);
    expect(raise.marginalTaxRate).toBe(0.3552);
  });

  it("agrees with the engine's raise impact, other increments included", () => {
    const result = resultOf({});
    for (const increment of [1_000, 2_000, 5_000, 10_000]) {
      const [step] = calculateRaiseImpact(result.input, [increment]).steps;
      const raise = raiseImpact(result, increment);
      expect(raise.netGainAnnual).toBeCloseTo(step?.netGain ?? Number.NaN, 2);
      expect(raise.keptShare).toBeCloseTo(step?.keptShare ?? Number.NaN, 10);
      expect(raise.marginalTaxRate).toBe(step?.marginalTaxRate);
    }
  });

  it("keeps the live page's first row: 57,99% kept and 35,52% marginal on 30.000 €", () => {
    const raise = raiseImpact(resultOf({}));
    expect(raise.keptShare).toBeCloseTo(0.5799, 4);
    expect(raise.marginalTaxRate).toBeCloseTo(0.3552, 4);
  });
});

describe("localAssumption", () => {
  it("falls back to the default surcharge rate without a comune", () => {
    expect(localAssumption(resultOf({}))).toEqual({
      id: "municipalRate",
      value: 0.008,
      fieldToEdit: "municipalRate",
    });
  });

  it("names the comune and says when its rule carries over from an earlier year", () => {
    expect(localAssumption(resultOf({ comune: "F205" }, MILANO))).toEqual({
      id: "comune",
      value: {
        id: "F205",
        name: "Milano",
        province: "MI",
        rule: { rate: 0.8, exemption: 23_000 },
        ruleYear: 2025,
        carriedOver: true,
      },
      fieldToEdit: "comune",
    });
    expect(localAssumption(resultOf({ comune: "F205", year: 2025 }, MILANO))).toMatchObject({
      id: "comune",
      value: { ruleYear: 2025, carriedOver: false },
    });
  });
});

describe("contractAssumption", () => {
  it("states the employee INPS rate the contract implies", () => {
    const rateOf = (patch: Partial<EmployeeState>) =>
      contractAssumption(resultOf(patch).values).employeeInpsRate;
    expect(rateOf({})).toBe(0.0919);
    expect(rateOf({ companySize: "large" })).toBeCloseTo(0.0949, 10);
    expect(rateOf({ contractType: "apprendistato" })).toBe(0.0584);
    expect(rateOf({ isPublicEmployee: true })).toBe(0.088);
    expect(rateOf({ inpsOverride: true, inpsEmployeeRate: "10" })).toBe(0.1);
  });
});

describe("employerCostBreakdown", () => {
  it("adds up to the engine's total cost", () => {
    const cost = employerCostBreakdown(REFERENCE.breakdown);
    const sum = cost.grossAnnual + cost.employerInps + cost.tfr + cost.totalOtherCosts;
    expect(sum).toBeCloseTo(cost.total, 1);
    expect(cost.total).toBe(REFERENCE.breakdown.totalEmployerCost);
    expect(cost.otherCosts.reduce((total, line) => total + line.amount, 0)).toBeCloseTo(
      cost.totalOtherCosts,
      1,
    );
    expect(cost.costPerNetEuro).toBe(REFERENCE.breakdown.employerCostPerNetEuro);
  });

  it("lists only the other costs that apply", () => {
    const permanent = employerCostBreakdown(REFERENCE.breakdown);
    expect(permanent.otherCosts.map((line) => line.id)).not.toContain("naspiAdditional");
    const fixedTerm = employerCostBreakdown(
      resultOf({ gross: "35.000", contractType: "determinato" }).breakdown,
    );
    expect(fixedTerm.otherCosts.map((line) => line.id)).toContain("naspiAdditional");
    expect(fixedTerm.otherCosts.every((line) => line.amount > 0)).toBe(true);
  });

  it("leaves out the cost per net euro when there is no net", () => {
    const empty = calculateSalaryBreakdown({ ...REFERENCE.input, grossAnnual: 0 });
    expect(employerCostBreakdown(empty).costPerNetEuro).toBeNull();
  });
});

describe("ledgerLines", () => {
  it("shows the rows of a plain payslip in the live order", () => {
    expect(lineIds(REFERENCE.breakdown)).toEqual([
      "gross",
      "inps",
      "taxableIncome",
      "irpefGross",
      "workDeduction",
      "detrazioneAggiuntiva",
      "irpefNet",
      "regional",
      "municipal",
      "totalTaxes",
      "netAnnual",
      "tfr",
    ]);
    expect(ledgerLines(REFERENCE.breakdown)[1]).toEqual({
      id: "inps",
      section: "contributions",
      amount: 3_216.5,
      rate: 0.0919,
      deducted: true,
      total: false,
    });
  });

  it("adds the credits, the 2024 exemption, the premio and the special rows when they apply", () => {
    expect(lineIds(resultOf({ gross: "12.000" }).breakdown)).toEqual(
      expect.arrayContaining(["trattamento", "sommaAggiuntiva"]),
    );
    expect(lineIds(resultOf({ year: 2024 }).breakdown)).toContain("inpsExemption");
    expect(lineIds(resultOf({ premio: "1.000" }).breakdown)).toEqual(
      expect.arrayContaining(["pdrGross", "pdrInps", "pdrTax", "pdrNet"]),
    );
    const special = lineIds(
      resultOf({
        madreLavoratrice: true,
        impatriati: true,
        pensionFund: "1.000",
        hasSpouse: true,
        medicalExpenses: "1.000",
      }).breakdown,
    );
    expect(special).toEqual(
      expect.arrayContaining([
        "madreLavoratrice",
        "pensionFund",
        "dependents",
        "expenses",
        "impatriati",
      ]),
    );
  });
});

describe("credits", () => {
  it("names only the credits the breakdown pays", () => {
    expect(credits(resultOf({ gross: "12.000" }).breakdown)).toEqual([
      "trattamento",
      "sommaAggiuntiva",
    ]);
    expect(credits(resultOf({ gross: "60.000" }).breakdown)).toEqual([]);
    expect(credits(resultOf({ gross: "60.000", premio: "1.000" }).breakdown)).toEqual(["pdr"]);
  });
});

describe("regionSummary", () => {
  it("describes a progressive region", () => {
    expect(regionSummary("lombardia", 2026)).toEqual({
      region: "lombardia",
      exemptionThreshold: null,
      flatRate: null,
      rates: [0.0123, 0.0158, 0.0172, 0.0173],
      minRate: 0.0123,
      maxRate: 0.0173,
      deductions: [],
    });
  });

  it("names the exemption and the single rate", () => {
    expect(regionSummary("valle-daosta", 2026)).toMatchObject({
      exemptionThreshold: 15_000,
      rates: [0.0123],
    });
  });

  it("describes Lazio's rate on all income up to 28.000 € and its deduction band", () => {
    expect(regionSummary("lazio", 2026)).toMatchObject({
      flatRate: { rate: 0.0173, upToIncome: 28_000 },
      deductions: [{ kind: "band", amount: 60, above: 28_000, upTo: 30_000 }],
    });
  });

  it("describes Bolzano's deduction and its phase-in", () => {
    expect(regionSummary("bolzano", 2026).deductions).toEqual([
      { kind: "upTo", amount: 430.5, upTo: 90_000 },
      { kind: "phaseIn", amount: 125, above: 50_000 },
    ]);
  });
});

describe("employeeLimits", () => {
  it("follows the year's thresholds", () => {
    expect(employeeLimits(2026)).toMatchObject({
      massimale: 122_295,
      spouseIncomeLimit: 2_840.51,
      dependantRulesFrom2025: true,
      premio: { rate: 0.01, maxAmount: 5_000 },
      mealVouchers: { electronic: 10, paper: 4 },
      welfare: { general: 1_000, withChildren: 2_000 },
      companyCarByPowertrain: true,
      employeeInpsRate: 0.0919,
      employerInpsRate: 0.2381,
    });
    expect(employeeLimits(2024)).toMatchObject({
      massimale: 119_650,
      dependantRulesFrom2025: false,
      premio: { rate: 0.05, maxAmount: 3_000 },
      mealVouchers: { electronic: 8, paper: 4 },
      welfare: { general: 1_000, withChildren: 2_000 },
      companyCarByPowertrain: false,
    });
  });

  it("pairs with the region summary as the form hints", () => {
    expect(employeeHints("lazio", 2025)).toEqual({
      region: regionSummary("lazio", 2025),
      limits: employeeLimits(2025),
    });
  });
});

describe("notices", () => {
  it("warns when the spouse earns too much to be dependent", () => {
    expect(notices(valuesOf({ hasSpouse: true, spouseIncome: "3.000" })).spouseNotDependent).toBe(
      true,
    );
    expect(notices(valuesOf({ hasSpouse: true, spouseIncome: "2.000" })).spouseNotDependent).toBe(
      false,
    );
  });

  it("explains the working mothers' exemption", () => {
    expect(notices(valuesOf({})).madreLavoratrice).toBeNull();
    expect(notices(valuesOf({ madreLavoratrice: true })).madreLavoratrice).toEqual({
      eligible: true,
      notEnoughChildren: false,
      childTooOld: false,
    });
    expect(
      notices(valuesOf({ madreLavoratrice: true, madreChildren: "2", madreYoungestChildAge: "18" }))
        .madreLavoratrice,
    ).toEqual({ eligible: false, notEnoughChildren: true, childTooOld: true });
  });
});

describe("activeGroups", () => {
  it("marks the groups that change the calculation", () => {
    expect(activeGroups(valuesOf({}))).toEqual({
      contract: false,
      dependents: false,
      expenses: false,
      specialConditions: false,
      premio: false,
      fringe: false,
    });
    expect(
      activeGroups(
        valuesOf({
          insuredBefore1996: true,
          childrenOver21: "1",
          otherDeductions: "100",
          impatriati: true,
          premio: "100",
          healthInsurance: "100",
        }),
      ),
    ).toEqual({
      contract: true,
      dependents: true,
      expenses: true,
      specialConditions: true,
      premio: true,
      fringe: true,
    });
  });
});

describe("searchComuni", () => {
  const names = (query: string, comuni: readonly Comune[] = LOMBARDIA) =>
    searchComuni(comuni, query).map((comune) => comune.name);

  it("starts from two characters and ignores case", () => {
    expect(names("m")).toEqual([]);
    expect(names("MIL").slice(0, 2)).toEqual(["Milano", "Milzano"]);
    expect(names("mil")).toContain("San Donato Milanese");
  });

  it("puts the exact match before the other prefixes", () => {
    expect(names("milano")[0]).toBe("Milano");
    expect(names("castro (bg)")[0]).toBe("Castro");
  });

  it("ignores accents and apostrophes", () => {
    expect(comuneSearchKey("Cantù")).toBe("cantu");
    expect(names("cantu")).toContain("Cantù");
    expect(names("acquaviva disernia", MOLISE)).toEqual(["Acquaviva d'Isernia"]);
    expect(names("acquaviva d'isernia", MOLISE)).toEqual(["Acquaviva d'Isernia"]);
  });

  it("ranks exact names, then prefixes, then words, then any match", () => {
    const comuni = ["Sangiovanni", "Borgo San Giovanni", "Milano", "Giovannino", "Giovanni"].map(
      (name, index): Comune => ({ id: `X00${String(index)}`, name, province: "XX", years: {} }),
    );
    expect(names("giovanni", comuni)).toEqual([
      "Giovanni",
      "Giovannino",
      "Borgo San Giovanni",
      "Sangiovanni",
    ]);
    expect(names("chiese")).toContain("Acquanegra sul Chiese");
  });
});

describe("employeeLinks", () => {
  it("links the payslip with every parameter of the calculation", () => {
    const state = { ...IT, gross: "42.000", region: "toscana" as const, comune: "D612" };
    expect(employeeLinks(state, 42_000, "it").print).toBe(
      "/stampa-busta-paga?l=42000&r=toscana&k=D612",
    );
    expect(employeeLinks(employeeDefaults("en"), 30_000, "en").print).toBe("/en/print-payslip");
  });

  it("carries the gross, year and contract to the employer cost and apprenticeship pages", () => {
    const state = { ...IT, year: 2025 as const, contractType: "apprendistato" as const };
    expect(employeeLinks(state, 31_234.4, "it")).toMatchObject({
      employerCost: "/costo-azienda?l=31234&y=2025&t=apprendistato",
      apprenticeship: "/progressione-apprendistato?l=31234",
    });
    expect(employeeLinks(IT, 30_000, "it").employerCost).toBe("/costo-azienda");
  });

  it("carries where the employee lives and the mensilità, so the net there matches", () => {
    const state = {
      ...IT,
      region: "toscana" as const,
      comune: "D612",
      municipalRate: "0,5",
      paymentFrequency: 14 as const,
    };
    expect(employeeLinks(state, 30_000, "it").employerCost).toBe(
      "/costo-azienda?r=toscana&k=D612&c=0.5&m=14",
    );
  });
});

describe("deriveEmployee", () => {
  it("bundles what the views show next to the result", () => {
    const derived = deriveEmployee(REFERENCE);
    expect(derived.yearComparison).toEqual(yearComparison(REFERENCE));
    expect(derived.bracket).toEqual(bracketIndicator(31_783.5, 2026));
    expect(derived.raise).toEqual(raiseImpact(REFERENCE));
    expect(derived.employerCost).toEqual(employerCostBreakdown(REFERENCE.breakdown));
    expect(derived.ledger).toEqual(ledgerLines(REFERENCE.breakdown));
    expect(derived.credits).toEqual([]);
    expect(derived.groups).toEqual(activeGroups(REFERENCE.values));
    expect(derived.notices).toEqual({ spouseNotDependent: false, madreLavoratrice: null });
  });
});
