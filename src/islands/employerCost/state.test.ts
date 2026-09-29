import { describe, expect, it } from "vitest";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import {
  adoptEmployerCostField,
  checkEmployerCost,
  employerCostDefaults,
  setEmployerCostField,
} from "./state.ts";

const IT = employerCostDefaults("it");

describe("employer cost state", () => {
  it("starts from the live page's gross with the employee calculator's local defaults", () => {
    expect(IT).toEqual({
      gross: "30.000",
      year: LATEST_SUPPORTED_YEAR,
      contractType: "indeterminato",
      region: "lombardia",
      comune: null,
      municipalRate: "0,8",
      paymentFrequency: 13,
    });
    expect(employerCostDefaults("en").gross).toBe("30,000");
    expect(checkEmployerCost(IT, "it")).toEqual({
      values: {
        grossAnnual: 30_000,
        taxYear: LATEST_SUPPORTED_YEAR,
        contractType: "indeterminato",
        regionCode: "lombardia",
        comune: null,
        municipalRate: 0.008,
        paymentFrequency: 13,
      },
      errors: {},
    });
  });

  it.each([
    ["it", "35k"],
    ["it", "35.000"],
    ["en", "35k"],
    ["en", "35,000"],
  ] as const)("accepts the %s RAL %s", (locale, gross) => {
    const state = { ...employerCostDefaults(locale), gross };
    expect(checkEmployerCost(state, locale).values?.grossAnnual).toBe(35_000);
  });

  it("asks for the RAL and caps it at 500.000 €, like the live form", () => {
    expect(checkEmployerCost({ ...IT, gross: "" }, "it").errors).toEqual({
      gross: { key: "field.error.ral.required" },
    });
    expect(checkEmployerCost({ ...IT, gross: "?" }, "it").errors).toEqual({
      gross: { key: "field.error.ral.invalid" },
    });
    expect(checkEmployerCost({ ...IT, gross: "600k" }, "it")).toEqual({
      values: null,
      errors: { gross: { key: "field.error.ral.range", values: { min: 1, max: 500_000 } } },
    });
  });

  it("rejects a typed municipal rate out of range unless a comune is chosen", () => {
    expect(checkEmployerCost({ ...IT, municipalRate: "3" }, "it")).toEqual({
      values: null,
      errors: {
        municipalRate: { key: "field.error.percentRange", values: { min: 0, max: 1.5 } },
      },
    });
    expect(
      checkEmployerCost({ ...IT, municipalRate: "3", comune: "F205" }, "it").values?.municipalRate,
    ).toBe(0.008);
  });

  it("updates one field, clears the comune with the region and keeps the state otherwise", () => {
    expect(setEmployerCostField(IT, "contractType", "apprendistato").contractType).toBe(
      "apprendistato",
    );
    expect(setEmployerCostField(IT, "year", LATEST_SUPPORTED_YEAR)).toBe(IT);
    const milano = setEmployerCostField(IT, "comune", "F205");
    expect(setEmployerCostField(milano, "region", "lazio")).toEqual({
      ...IT,
      region: "lazio",
      comune: null,
    });
  });

  it("adopts its own fields and ignores the rest", () => {
    expect(adoptEmployerCostField(IT, "gross", "42.000").gross).toBe("42.000");
    expect(adoptEmployerCostField(IT, "year", "2024").year).toBe(2024);
    expect(adoptEmployerCostField(IT, "contractType", "determinato").contractType).toBe(
      "determinato",
    );
    expect(adoptEmployerCostField(IT, "region", "lazio").region).toBe("lazio");
    expect(adoptEmployerCostField(IT, "paymentFrequency", "14").paymentFrequency).toBe(14);
    expect(adoptEmployerCostField(IT, "municipalRate", "0,5").municipalRate).toBe("0,5");
    expect(adoptEmployerCostField(IT, "gross", true)).toBe(IT);
    expect(adoptEmployerCostField(IT, "isPublicEmployee", true)).toBe(IT);
    expect(adoptEmployerCostField(IT, "year", "1999")).toBe(IT);
  });
});
