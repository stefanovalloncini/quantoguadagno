import { describe, expect, it } from "vitest";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import {
  MAX_RAL,
  MIN_RAL,
  TREDICESIMA_DEFAULTS,
  tredicesimaDefaults,
  parseRal,
  updateMensilita,
  updateRal,
  updateTaxYear,
  validateTredicesima,
} from "./state.ts";

describe("tredicesimaDefaults", () => {
  it("writes the default RAL the way each locale formats amounts", () => {
    expect(tredicesimaDefaults("it").ral).toBe("30.000");
    expect(tredicesimaDefaults("en").ral).toBe("30,000");
  });
});

describe("TREDICESIMA_DEFAULTS", () => {
  it("matches the OLD tool defaults", () => {
    expect(TREDICESIMA_DEFAULTS).toEqual({
      ral: "30000",
      mensilita: 13,
      taxYear: LATEST_SUPPORTED_YEAR,
    });
  });
});

describe("updaters", () => {
  it("updateRal only changes the raw text", () => {
    expect(updateRal(TREDICESIMA_DEFAULTS, "45.000")).toEqual({
      ...TREDICESIMA_DEFAULTS,
      ral: "45.000",
    });
  });

  it("updateMensilita only changes mensilita", () => {
    expect(updateMensilita(TREDICESIMA_DEFAULTS, 14)).toEqual({
      ...TREDICESIMA_DEFAULTS,
      mensilita: 14,
    });
  });

  it("updateTaxYear only changes taxYear", () => {
    expect(updateTaxYear(TREDICESIMA_DEFAULTS, 2025)).toEqual({
      ...TREDICESIMA_DEFAULTS,
      taxYear: 2025,
    });
  });
});

describe("parseRal", () => {
  it("parses locale-formatted and shorthand amounts", () => {
    expect(parseRal(updateRal(TREDICESIMA_DEFAULTS, "35.000"), "it")).toBe(35_000);
    expect(parseRal(updateRal(TREDICESIMA_DEFAULTS, "35k"), "it")).toBe(35_000);
  });
});

describe("validateTredicesima", () => {
  it("has no errors for the defaults", () => {
    expect(validateTredicesima(TREDICESIMA_DEFAULTS, "it")).toEqual({});
  });

  it("flags an unparseable or non-positive RAL", () => {
    const ralError = { key: "field.error.ral.range", values: { min: MIN_RAL, max: MAX_RAL } };
    expect(validateTredicesima(updateRal(TREDICESIMA_DEFAULTS, "abc"), "it").ral).toEqual(ralError);
    expect(validateTredicesima(updateRal(TREDICESIMA_DEFAULTS, "0"), "it").ral).toEqual(ralError);
  });

  it("flags a RAL above the maximum", () => {
    const state = updateRal(TREDICESIMA_DEFAULTS, String(MAX_RAL + 1));
    expect(validateTredicesima(state, "it").ral).toEqual({
      key: "field.error.ral.range",
      values: { min: MIN_RAL, max: MAX_RAL },
    });
  });

  it("flags a mensilita outside {13, 14}", () => {
    const state = updateMensilita(TREDICESIMA_DEFAULTS, 15 as 13 | 14);
    expect(validateTredicesima(state, "it").mensilita).toBe("tredicesima.form.mensilita.error");
  });

  it("flags an unsupported tax year", () => {
    const state = updateTaxYear(TREDICESIMA_DEFAULTS, 1999 as typeof TREDICESIMA_DEFAULTS.taxYear);
    expect(validateTredicesima(state, "it").taxYear).toEqual({
      key: "field.error.unsupportedYear",
    });
  });
});
