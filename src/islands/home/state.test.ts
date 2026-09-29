import { describe, expect, it } from "vitest";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import {
  adoptEmployeeField,
  checkEmployee,
  employeeDefaults,
  resetGroup,
  setField,
  switchMode,
  type EmployeeState,
} from "./state.ts";

const IT = employeeDefaults("it");
const EN = employeeDefaults("en");

function withFields(patch: Partial<EmployeeState>, base: EmployeeState = IT): EmployeeState {
  return { ...base, ...patch };
}

function valuesOf(state: EmployeeState, locale: "it" | "en" = "it") {
  const { values, errors } = checkEmployee(state, locale);
  expect(errors).toEqual({});
  if (values === null) throw new Error("expected valid values");
  return values;
}

describe("defaults", () => {
  it("start from the live site's defaults, written for the locale", () => {
    expect(IT).toMatchObject({
      mode: "gross",
      gross: "30.000",
      targetNet: "1.800",
      year: LATEST_SUPPORTED_YEAR,
      paymentFrequency: 13,
      ccnl: null,
      contractType: "indeterminato",
      region: "lombardia",
      comune: null,
      municipalRate: "0,8",
      companySize: "small",
      isPublicEmployee: false,
      insuredBefore1996: false,
      inpsOverride: false,
      inpsEmployeeRate: "9,19",
      inpsEmployerRate: "23,81",
      hasSpouse: false,
      childrenOver21: "0",
      otherDependents: "0",
      madreChildren: "3",
      madreYoungestChildAge: "5",
      carMode: "simple",
      carPowertrain: "other",
      carKm: "15.000",
      mealVoucherType: "electronic",
      mealVoucherDays: "22",
    });
    expect(EN).toMatchObject({ gross: "30,000", municipalRate: "0.8", carKm: "15,000" });
  });

  it("are one stable object per locale", () => {
    expect(employeeDefaults("it")).toBe(IT);
    expect(employeeDefaults("en")).toBe(EN);
  });

  it("describe a plain employee with no extras", () => {
    expect(valuesOf(IT)).toEqual({
      amount: { mode: "gross", grossAnnual: 30_000 },
      taxYear: LATEST_SUPPORTED_YEAR,
      paymentFrequency: 13,
      contractType: "indeterminato",
      regionCode: "lombardia",
      comune: null,
      municipalRate: 0.008,
      companySize: "small",
      isPublicEmployee: false,
      insuredBefore1996: false,
      inpsOverride: null,
      dependents: null,
      expenseDeductions: null,
      specialConditions: null,
      premioRisultato: null,
      fringeBenefits: null,
    });
    expect(valuesOf(EN, "en").municipalRate).toBe(0.008);
  });
});

describe("validation", () => {
  it.each([
    ["it", "35k"],
    ["it", "35.000"],
    ["it", "35 000"],
    ["it", "35.000,00 €"],
    ["it", "35mila"],
    ["en", "35k"],
    ["en", "35,000"],
  ] as const)("accepts %s RAL %s", (locale, gross) => {
    const base = employeeDefaults(locale);
    expect(valuesOf(withFields({ gross }, base), locale).amount).toEqual({
      mode: "gross",
      grossAnnual: 35_000,
    });
  });

  it("asks for the RAL when it is empty and rejects what it cannot read", () => {
    expect(checkEmployee(withFields({ gross: "" }), "it")).toEqual({
      values: null,
      errors: { gross: { key: "field.error.ral.required" } },
    });
    expect(checkEmployee(withFields({ gross: "tanti" }), "it").errors).toEqual({
      gross: { key: "field.error.ral.invalid" },
    });
    expect(checkEmployee(withFields({ gross: "2.000.000" }), "it").errors).toEqual({
      gross: { key: "field.error.ral.range", values: { min: 1, max: 1_000_000 } },
    });
  });

  it("checks only the amount the mode uses", () => {
    const net = withFields({ mode: "net", gross: "tanti", targetNet: "2.000" });
    expect(valuesOf(net).amount).toEqual({ mode: "net", targetNetMonthly: 2_000 });
    expect(checkEmployee(withFields({ targetNet: "" }), "it").errors).toEqual({});
    expect(checkEmployee(withFields({ mode: "net", targetNet: "" }), "it").errors).toEqual({
      targetNet: { key: "field.error.netMonthly.required" },
    });
    expect(checkEmployee(withFields({ mode: "net", targetNet: "150k" }), "it").errors).toEqual({
      targetNet: { key: "field.error.netMonthly.range", values: { min: 1, max: 100_000 } },
    });
  });

  it("checks the manual comunale rate only while no comune is chosen", () => {
    expect(checkEmployee(withFields({ municipalRate: "8" }), "it").errors).toEqual({
      municipalRate: { key: "field.error.percentRange", values: { min: 0, max: 1.5 } },
    });
    expect(checkEmployee(withFields({ municipalRate: "0.8" }), "it").errors).toEqual({
      municipalRate: { key: "field.error.percentRange", values: { min: 0, max: 1.5 } },
    });
    expect(valuesOf(withFields({ municipalRate: "1,2" })).municipalRate).toBe(0.012);
    expect(valuesOf(withFields({ municipalRate: "" })).municipalRate).toBe(0);
    const chosen = valuesOf(withFields({ comune: "F205", municipalRate: "abc" }));
    expect(chosen.comune).toBe("F205");
    expect(chosen.municipalRate).toBe(0.008);
    expect(valuesOf(withFields({ comune: "F205", municipalRate: "0,5" })).municipalRate).toBe(
      0.005,
    );
  });

  it("reads the custom INPS rates only when they are switched on", () => {
    expect(valuesOf(withFields({ inpsEmployeeRate: "abc" })).inpsOverride).toBeNull();
    expect(
      valuesOf(withFields({ inpsOverride: true, inpsEmployeeRate: "9,49" })).inpsOverride,
    ).toEqual({ employeeRate: 0.0949, employerRate: 0.2381 });
    expect(
      checkEmployee(withFields({ inpsOverride: true, inpsEmployerRate: "60" }), "it").errors,
    ).toEqual({
      inpsEmployerRate: { key: "field.error.percentRange", values: { min: 0, max: 50 } },
    });
  });

  it("builds dependants only when someone is dependent", () => {
    expect(valuesOf(withFields({ spouseIncome: "5.000" })).dependents).toBeNull();
    expect(valuesOf(withFields({ hasSpouse: true })).dependents).toEqual({
      hasSpouse: true,
      spouseIncome: 0,
      childrenOver21: 0,
      otherDependents: 0,
    });
    expect(valuesOf(withFields({ childrenOver21: "2", otherDependents: "1" })).dependents).toEqual({
      hasSpouse: false,
      childrenOver21: 2,
      otherDependents: 1,
    });
    expect(checkEmployee(withFields({ childrenOver21: "1,5" }), "it").errors).toEqual({
      childrenOver21: { key: "field.error.integer" },
    });
    expect(checkEmployee(withFields({ otherDependents: "11" }), "it").errors).toEqual({
      otherDependents: { key: "field.error.integerRange", values: { min: 0, max: 10 } },
    });
    expect(
      checkEmployee(withFields({ hasSpouse: true, spouseIncome: "200.000" }), "it").errors,
    ).toEqual({
      spouseIncome: { key: "field.error.moneyRange", values: { min: 0, max: 100_000 } },
    });
  });

  it("builds expenses only when one is above zero", () => {
    expect(valuesOf(IT).expenseDeductions).toBeNull();
    expect(valuesOf(withFields({ medicalExpenses: "1.200" })).expenseDeductions).toEqual({
      mortgageInterest: 0,
      medicalExpenses: 1_200,
      otherDeductions: 0,
      pensionFund: 0,
    });
  });

  it("builds the special conditions that are switched on", () => {
    expect(valuesOf(withFields({ madreChildren: "abc" })).specialConditions).toBeNull();
    expect(
      valuesOf(withFields({ impatriati: true, impatriatiMinorChildren: true })).specialConditions,
    ).toEqual({ regimeImpatriati: { enabled: true, hasMinorChildren: true } });
    expect(
      valuesOf(withFields({ madreLavoratrice: true, madreYoungestChildAge: "19" }))
        .specialConditions,
    ).toEqual({ madreLavoratrice: { enabled: true, numberOfChildren: 3, youngestChildAge: 19 } });
    expect(
      checkEmployee(withFields({ madreLavoratrice: true, madreChildren: "0" }), "it").errors,
    ).toEqual({
      madreChildren: { key: "field.error.integerRange", values: { min: 1, max: 10 } },
    });
  });

  it("caps the premio di risultato at the year's detaxed maximum", () => {
    expect(valuesOf(withFields({ premio: "5.000", year: 2026 })).premioRisultato).toEqual({
      amount: 5_000,
    });
    expect(checkEmployee(withFields({ premio: "4.000", year: 2025 }), "it").errors).toEqual({
      premio: { key: "field.error.moneyRange", values: { min: 0, max: 3_000 } },
    });
  });

  it("builds the benefits that have a value", () => {
    expect(valuesOf(withFields({ mealVoucherDays: "" })).fringeBenefits).toBeNull();
    expect(valuesOf(withFields({ mealVoucherValue: "8" })).fringeBenefits).toEqual({
      mealVouchers: { dailyValue: 8, workingDaysPerMonth: 22, type: "electronic" },
    });
    expect(
      checkEmployee(withFields({ mealVoucherValue: "8", mealVoucherDays: "" }), "it").errors,
    ).toEqual({
      mealVoucherDays: { key: "field.error.integerRange", values: { min: 1, max: 26 } },
    });
    expect(
      valuesOf(
        withFields({
          carValue: "3.000",
          healthInsurance: "4.000",
          welfare: "1.500",
          welfareHasChildren: true,
        }),
      ).fringeBenefits,
    ).toEqual({
      companyCar: { mode: "simple", annualBenefitValue: 3_000 },
      healthInsurance: { annualPremium: 4_000 },
      welfare: { annualAmount: 1_500, hasDependentChildren: true },
    });
  });

  it("values a detailed company car by powertrain from 2025 and by CO2 before", () => {
    const detailed = withFields({ carMode: "detailed", carAciCost: "42", carCo2: "abc" });
    expect(valuesOf(withFields({ year: 2026 }, detailed)).fringeBenefits).toEqual({
      companyCar: {
        mode: "detailed",
        aciCostPerKm: 0.42,
        conventionalKm: 15_000,
        powertrainType: "other",
      },
    });
    expect(checkEmployee(withFields({ year: 2024 }, detailed), "it").errors).toEqual({
      carCo2: { key: "field.error.integer" },
    });
    expect(valuesOf(withFields({ year: 2024, carCo2: "120" }, detailed)).fringeBenefits).toEqual({
      companyCar: {
        mode: "detailed",
        aciCostPerKm: 0.42,
        conventionalKm: 15_000,
        co2Emissions: 120,
      },
    });
    expect(
      valuesOf(withFields({ carMode: "detailed", carAciCost: "0" })).fringeBenefits,
    ).toBeNull();
  });
});

describe("updaters", () => {
  it("leave the state untouched when nothing changes", () => {
    expect(setField(IT, "region", "lombardia")).toBe(IT);
    expect(switchMode(IT, "gross", null, "it")).toBe(IT);
  });

  it("drop the comune when the region changes", () => {
    const milano = setField(IT, "comune", "F205");
    expect(milano.comune).toBe("F205");
    expect(setField(milano, "region", "lazio")).toMatchObject({ region: "lazio", comune: null });
  });

  it("apply a CCNL preset's mensilità, like the live chips", () => {
    expect(setField(IT, "ccnl", "commercio")).toMatchObject({
      ccnl: "commercio",
      paymentFrequency: 14,
    });
    const cooperative = setField(
      withFields({ paymentFrequency: 14 }),
      "ccnl",
      "cooperative-sociali",
    );
    expect(cooperative.paymentFrequency).toBe(13);
    expect(setField(cooperative, "ccnl", null)).toMatchObject({ ccnl: null, paymentFrequency: 13 });
  });

  it("forget the CCNL once the mensilità no longer match it", () => {
    const commercio = setField(IT, "ccnl", "commercio");
    expect(setField(commercio, "paymentFrequency", 13)).toMatchObject({
      ccnl: null,
      paymentFrequency: 13,
    });
    const metalmeccanici = setField(IT, "ccnl", "metalmeccanici");
    expect(
      setField(setField(metalmeccanici, "paymentFrequency", 14), "paymentFrequency", 13).ccnl,
    ).toBeNull();
  });

  it("seed the other amount when the mode flips, like the live page", () => {
    const seed = { grossAnnual: 31_234, netMonthly: 1_802.48 };
    expect(switchMode(IT, "net", seed, "it")).toMatchObject({ mode: "net", targetNet: "1.802" });
    const net = withFields({ mode: "net", targetNet: "2.000" });
    expect(switchMode(net, "gross", seed, "it")).toMatchObject({ mode: "gross", gross: "31.234" });
    expect(switchMode(IT, "net", null, "it")).toEqual({ ...IT, mode: "net" });
  });

  it("put one group back to its defaults and leave the rest alone", () => {
    const busy = withFields({
      hasSpouse: true,
      spouseIncome: "1.000",
      childrenOver21: "2",
      medicalExpenses: "500",
    });
    expect(resetGroup(busy, "dependents", "it")).toEqual(withFields({ medicalExpenses: "500" }));
  });
});

describe("adoptEmployeeField", () => {
  it("adopts what was typed or picked before hydration", () => {
    expect(adoptEmployeeField(IT, "gross", "42.000").gross).toBe("42.000");
    expect(adoptEmployeeField(IT, "hasSpouse", true).hasSpouse).toBe(true);
    expect(adoptEmployeeField(IT, "year", "2025").year).toBe(2025);
    expect(adoptEmployeeField(IT, "paymentFrequency", "16").paymentFrequency).toBe(16);
    expect(adoptEmployeeField(IT, "contractType", "apprendistato").contractType).toBe(
      "apprendistato",
    );
    expect(adoptEmployeeField(IT, "mode", "net").mode).toBe("net");
    expect(adoptEmployeeField(IT, "ccnl", "logistica")).toMatchObject({
      ccnl: "logistica",
      paymentFrequency: 14,
    });
    expect(adoptEmployeeField(IT, "carMode", "detailed").carMode).toBe("detailed");
    expect(adoptEmployeeField(IT, "mealVoucherType", "paper").mealVoucherType).toBe("paper");
  });

  it("maps a company-size checkbox and a company-size choice", () => {
    expect(adoptEmployeeField(IT, "companySize", true).companySize).toBe("large");
    expect(adoptEmployeeField(IT, "companySize", "large").companySize).toBe("large");
  });

  it("adopts a comune code and keeps it with the region it belongs to", () => {
    const lazio = adoptEmployeeField(IT, "region", "lazio");
    const roma = adoptEmployeeField(lazio, "comune", "h501");
    expect(roma).toMatchObject({ region: "lazio", comune: "H501" });
    expect(adoptEmployeeField(roma, "comune", "")).toMatchObject({ comune: null });
    expect(adoptEmployeeField(roma, "comune", "Roma (RM)")).toBe(roma);
  });

  it("ignores values that do not fit the field and names it does not own", () => {
    expect(adoptEmployeeField(IT, "year", "1999")).toBe(IT);
    expect(adoptEmployeeField(IT, "year", "")).toBe(IT);
    expect(adoptEmployeeField(IT, "region", "narnia")).toBe(IT);
    expect(adoptEmployeeField(IT, "paymentFrequency", "17")).toBe(IT);
    expect(adoptEmployeeField(IT, "gross", true)).toBe(IT);
    expect(adoptEmployeeField(IT, "hasSpouse", "on")).toBe(IT);
    expect(adoptEmployeeField(IT, "contractType", false)).toBe(IT);
    expect(adoptEmployeeField(IT, "fbclid", "abc")).toBe(IT);
  });
});
