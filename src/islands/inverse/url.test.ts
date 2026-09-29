import { describe, expect, it } from "vitest";
import { readQuery } from "@/islands/runtime/query.ts";
import { INVERSE_PARAMS } from "@/queryParams.ts";
import { inverseDefaults, type InverseState } from "./state.ts";
import { inverseFromQuery, inverseQueryString, inverseUrlState } from "./url.ts";

const IT = inverseDefaults("it");

function parse(search: string, locale: "it" | "en" = "it"): InverseState {
  return inverseFromQuery(readQuery(search, INVERSE_PARAMS), inverseDefaults(locale), locale);
}

function write(patch: Partial<InverseState>, locale: "it" | "en" = "it"): string {
  return inverseQueryString({ ...inverseDefaults(locale), ...patch }, locale);
}

describe("writing the query", () => {
  it("emits nothing for the defaults", () => {
    expect(inverseQueryString(IT, "it")).toBe("");
  });

  it("writes each field that moved under its short key", () => {
    expect(
      write({
        targetNetAnnual: "30k",
        year: 2025,
        region: "lazio",
        comune: "H501",
        municipalRate: "0,9",
        paymentFrequency: 14,
        contractType: "determinato",
        companySize: "large",
        isPublicEmployee: true,
      }),
    ).toBe("n=30000&y=2025&r=lazio&k=H501&c=0.9&m=14&t=determinato&a=1&p=1");
  });

  it("leaves out what it cannot read and writes the same query in English", () => {
    expect(write({ targetNetAnnual: "molto" })).toBe("");
    expect(write({ targetNetAnnual: "30,000", municipalRate: "0.5" }, "en")).toBe("n=30000&c=0.5");
  });
});

describe("reading the query", () => {
  it("returns the defaults when no params match", () => {
    expect(parse("?l=30000&lordo=1&foo=bar")).toEqual(IT);
  });

  it("reads every short name", () => {
    expect(parse("?n=30000&y=2024&r=toscana&k=D612&c=0.2&m=16&t=apprendistato&a=1&p=1")).toEqual({
      targetNetAnnual: "30.000",
      year: 2024,
      region: "toscana",
      comune: "D612",
      municipalRate: "0,2",
      paymentFrequency: 16,
      contractType: "apprendistato",
      companySize: "large",
      isPublicEmployee: true,
    });
  });

  it("reads the target like the other whole amounts and keeps it plausible", () => {
    expect(parse("?n=30000.9").targetNetAnnual).toBe("30.000");
    expect(parse("?n=0").targetNetAnnual).toBe("24.000");
    expect(parse("?n=600000").targetNetAnnual).toBe("24.000");
    expect(parse("?n=30k").targetNetAnnual).toBe("24.000");
  });
});

describe("round trips", () => {
  it.each(["n=30000&r=lazio&k=H501", "y=2024&c=0.5&m=14&t=determinato&a=1&p=1"])(
    "reads and writes %s back unchanged",
    (query) => {
      for (const locale of ["it", "en"] as const) {
        expect(inverseQueryString(parse(`?${query}`, locale), locale)).toBe(query);
      }
    },
  );

  it("offers one stable config per locale", () => {
    const config = inverseUrlState("it");
    expect(inverseUrlState("it")).toBe(config);
    expect(config.params).toBe(INVERSE_PARAMS);
    expect(config.initial).toBe(IT);
  });
});
