import { describe, expect, it } from "vitest";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import {
  adoptInverseField,
  checkInverse,
  inverseDefaults,
  setInverseField,
  type InverseState,
} from "./state.ts";

const IT = inverseDefaults("it");

function withFields(patch: Partial<InverseState>, base: InverseState = IT): InverseState {
  return { ...base, ...patch };
}

describe("defaults", () => {
  it("start from the live page's defaults, written for the locale", () => {
    expect(IT).toEqual({
      targetNetAnnual: "24.000",
      year: LATEST_SUPPORTED_YEAR,
      paymentFrequency: 13,
      contractType: "indeterminato",
      region: "lombardia",
      comune: null,
      municipalRate: "0,8",
      companySize: "small",
      isPublicEmployee: false,
    });
    expect(inverseDefaults("en")).toMatchObject({
      targetNetAnnual: "24,000",
      municipalRate: "0.8",
    });
    expect(inverseDefaults("it")).toBe(IT);
  });

  it("describe the default target", () => {
    expect(checkInverse(IT, "it")).toEqual({
      values: {
        targetNetAnnual: 24_000,
        taxYear: LATEST_SUPPORTED_YEAR,
        paymentFrequency: 13,
        contractType: "indeterminato",
        regionCode: "lombardia",
        comune: null,
        municipalRate: 0.008,
        companySize: "small",
        isPublicEmployee: false,
      },
      errors: {},
    });
  });
});

describe("validation", () => {
  it.each([
    ["it", "30k"],
    ["it", "30.000"],
    ["it", "30mila"],
    ["en", "30k"],
    ["en", "30,000"],
  ] as const)("accepts the %s target %s", (locale, targetNetAnnual) => {
    const state = withFields({ targetNetAnnual }, inverseDefaults(locale));
    expect(checkInverse(state, locale).values?.targetNetAnnual).toBe(30_000);
  });

  it("asks for the target, rejects what it cannot read and caps it", () => {
    expect(checkInverse(withFields({ targetNetAnnual: "" }), "it")).toEqual({
      values: null,
      errors: { targetNetAnnual: { key: "field.error.netAnnual.required" } },
    });
    expect(checkInverse(withFields({ targetNetAnnual: "molto" }), "it").errors).toEqual({
      targetNetAnnual: { key: "field.error.netAnnual.invalid" },
    });
    expect(checkInverse(withFields({ targetNetAnnual: "600k" }), "it").errors).toEqual({
      targetNetAnnual: { key: "field.error.netAnnual.range", values: { min: 1, max: 500_000 } },
    });
  });

  it("checks the manual comunale rate only while no comune is chosen", () => {
    expect(checkInverse(withFields({ municipalRate: "5" }), "it").errors).toEqual({
      municipalRate: { key: "field.error.percentRange", values: { min: 0, max: 1.5 } },
    });
    const chosen = checkInverse(withFields({ municipalRate: "5", comune: "F205" }), "it");
    expect(chosen.errors).toEqual({});
    expect(chosen.values?.municipalRate).toBe(0.008);
    expect(checkInverse(withFields({ municipalRate: "0,6" }), "it").values?.municipalRate).toBe(
      0.006,
    );
  });

  it("reports every invalid field at once", () => {
    expect(
      Object.keys(
        checkInverse(withFields({ targetNetAnnual: "", municipalRate: "x" }), "it").errors,
      ),
    ).toEqual(["targetNetAnnual", "municipalRate"]);
  });
});

describe("updaters", () => {
  it("drop the comune when the region changes and keep the state when nothing does", () => {
    const milano = setInverseField(IT, "comune", "F205");
    expect(setInverseField(milano, "region", "lazio")).toMatchObject({
      region: "lazio",
      comune: null,
    });
    expect(setInverseField(IT, "paymentFrequency", 13)).toBe(IT);
  });

  it("adopt what was typed or picked before hydration", () => {
    expect(adoptInverseField(IT, "targetNetAnnual", "30.000").targetNetAnnual).toBe("30.000");
    expect(adoptInverseField(IT, "municipalRate", "0,5").municipalRate).toBe("0,5");
    expect(adoptInverseField(IT, "year", "2024").year).toBe(2024);
    expect(adoptInverseField(IT, "paymentFrequency", "14").paymentFrequency).toBe(14);
    expect(adoptInverseField(IT, "region", "lazio").region).toBe("lazio");
    expect(adoptInverseField(IT, "comune", "f205").comune).toBe("F205");
    expect(adoptInverseField(IT, "contractType", "determinato").contractType).toBe("determinato");
    expect(adoptInverseField(IT, "companySize", true).companySize).toBe("large");
    expect(adoptInverseField(IT, "isPublicEmployee", true).isPublicEmployee).toBe(true);
  });

  it("ignore values that do not fit and names the tool does not own", () => {
    expect(adoptInverseField(IT, "targetNetAnnual", true)).toBe(IT);
    expect(adoptInverseField(IT, "year", "2030")).toBe(IT);
    expect(adoptInverseField(IT, "gross", "30.000")).toBe(IT);
    expect(adoptInverseField(IT, "hasSpouse", true)).toBe(IT);
  });
});
