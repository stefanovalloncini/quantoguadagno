import { describe, expect, it } from "vitest";
import { readQuery } from "@/islands/runtime/query.ts";
import { employerCostDefaults, type EmployerCostState } from "./state.ts";
import { EMPLOYER_COST_PARAMS } from "@/queryParams.ts";
import { employerCostFromQuery, employerCostQueryString, employerCostUrlState } from "./url.ts";

const IT = employerCostDefaults("it");

function parse(search: string, locale: "it" | "en" = "it"): EmployerCostState {
  return employerCostFromQuery(
    readQuery(search, EMPLOYER_COST_PARAMS),
    employerCostDefaults(locale),
    locale,
  );
}

describe("employer cost query", () => {
  it("writes nothing for the defaults and short keys for the rest", () => {
    expect(employerCostQueryString(IT, "it")).toBe("");
    expect(
      employerCostQueryString(
        {
          ...IT,
          gross: "42k",
          year: 2024,
          contractType: "apprendistato",
          region: "lazio",
          comune: "H501",
          paymentFrequency: 14,
        },
        "it",
      ),
    ).toBe("l=42000&y=2024&t=apprendistato&r=lazio&k=H501&m=14");
  });

  it("reads the gross, year and contract the way the employee calculator does", () => {
    expect(parse("?l=42000.9&y=2025&t=determinato")).toEqual({
      ...IT,
      gross: "42.000",
      year: 2025,
      contractType: "determinato",
    });
    expect(parse("?l=0&y=2030&t=x&r=atlantide&m=20&c=abc")).toEqual(IT);
    expect(parse("?lordo=42000")).toEqual(IT);
  });

  it("reads the employee's region, comune, rate and mensilità", () => {
    expect(parse("?r=lazio&k=h501&c=0.5&m=14")).toEqual({
      ...IT,
      region: "lazio",
      comune: "H501",
      municipalRate: "0,5",
      paymentFrequency: 14,
    });
  });

  it.each(["l=42000&y=2024&t=apprendistato", "t=determinato", "r=lazio&k=H501", "c=0.5&m=12"])(
    "reads and writes %s back unchanged",
    (query) => {
      for (const locale of ["it", "en"] as const) {
        expect(employerCostQueryString(parse(`?${query}`, locale), locale)).toBe(query);
      }
    },
  );

  it("offers one stable config per locale", () => {
    const config = employerCostUrlState("en");
    expect(employerCostUrlState("en")).toBe(config);
    expect(config.params).toBe(EMPLOYER_COST_PARAMS);
    expect(config.initial).toBe(employerCostDefaults("en"));
  });
});
