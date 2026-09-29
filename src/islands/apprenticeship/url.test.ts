import { describe, expect, it } from "vitest";
import { readQuery, writeQuery } from "@/islands/runtime/query.ts";
import { APPRENTICESHIP_PARAMS } from "@/queryParams.ts";
import { APPRENTICESHIP_DEFAULTS, MAX_TARGET_GROSS_ANNUAL } from "./state.ts";
import { fromQuery, toQuery } from "./url.ts";

describe("fromQuery", () => {
  it("uses the ?lordo= legacy param, exactly like the OLD tool", () => {
    const values = readQuery("?lordo=35000", APPRENTICESHIP_PARAMS);
    expect(fromQuery(values, APPRENTICESHIP_DEFAULTS)).toEqual({
      ...APPRENTICESHIP_DEFAULTS,
      targetGrossAnnual: "35.000",
    });
  });

  it("uses the short ?l= param", () => {
    const values = readQuery("?l=42000", APPRENTICESHIP_PARAMS);
    expect(fromQuery(values, APPRENTICESHIP_DEFAULTS).targetGrossAnnual).toBe("42.000");
  });

  it("falls back to the initial state when the param is missing", () => {
    const values = readQuery("?other=1", APPRENTICESHIP_PARAMS);
    expect(fromQuery(values, APPRENTICESHIP_DEFAULTS)).toBe(APPRENTICESHIP_DEFAULTS);
  });

  it("falls back to the initial state for a non-positive or non-numeric value", () => {
    expect(fromQuery(readQuery("?l=0", APPRENTICESHIP_PARAMS), APPRENTICESHIP_DEFAULTS)).toBe(
      APPRENTICESHIP_DEFAULTS,
    );
    expect(fromQuery(readQuery("?l=-5", APPRENTICESHIP_PARAMS), APPRENTICESHIP_DEFAULTS)).toBe(
      APPRENTICESHIP_DEFAULTS,
    );
    expect(fromQuery(readQuery("?l=abc", APPRENTICESHIP_PARAMS), APPRENTICESHIP_DEFAULTS)).toBe(
      APPRENTICESHIP_DEFAULTS,
    );
  });

  it("floors decimals and caps at the maximum target, like the OLD tool", () => {
    expect(
      fromQuery(readQuery("?l=35000.9", APPRENTICESHIP_PARAMS), APPRENTICESHIP_DEFAULTS)
        .targetGrossAnnual,
    ).toBe("35.000");
    expect(
      fromQuery(
        readQuery(`?l=${String(MAX_TARGET_GROSS_ANNUAL + 500)}`, APPRENTICESHIP_PARAMS),
        APPRENTICESHIP_DEFAULTS,
      ).targetGrossAnnual,
    ).toBe("1.000.000");
  });
});

describe("toQuery", () => {
  it("omits the param at the default value", () => {
    expect(toQuery(APPRENTICESHIP_DEFAULTS)).toEqual({ l: undefined });
  });

  it("writes the short l= key for a non-default value", () => {
    expect(toQuery({ ...APPRENTICESHIP_DEFAULTS, targetGrossAnnual: "35000" })).toEqual({
      l: "35000",
    });
  });

  it("parses locale-formatted and shorthand text using the default (it) locale", () => {
    expect(toQuery({ ...APPRENTICESHIP_DEFAULTS, targetGrossAnnual: "35k" })).toEqual({
      l: "35000",
    });
    expect(toQuery({ ...APPRENTICESHIP_DEFAULTS, targetGrossAnnual: "35.000" })).toEqual({
      l: "35000",
    });
  });

  it("omits the param when the text does not parse", () => {
    expect(toQuery({ ...APPRENTICESHIP_DEFAULTS, targetGrossAnnual: "abc" })).toEqual({
      l: undefined,
    });
  });
});

describe("round trip through the query string helpers", () => {
  it("reconstructs the same canonical value written out", () => {
    const written = writeQuery(
      toQuery({ ...APPRENTICESHIP_DEFAULTS, targetGrossAnnual: "50000" }),
      APPRENTICESHIP_PARAMS,
    );
    expect(written).toBe("l=50000");
    const restored = fromQuery(
      readQuery(`?${written}`, APPRENTICESHIP_PARAMS),
      APPRENTICESHIP_DEFAULTS,
    );
    expect(restored.targetGrossAnnual).toBe("50.000");
  });
});
