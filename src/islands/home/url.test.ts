import { describe, expect, it } from "vitest";
import { readQuery, writeQuery } from "@/islands/runtime/query.ts";
import { EMPLOYEE_PARAMS } from "@/queryParams.ts";
import { employeeDefaults, type EmployeeState } from "./state.ts";
import {
  employeeFromQuery,
  employeeQueryString,
  employeeToQuery,
  employeeUrlState,
} from "./url.ts";

const IT = employeeDefaults("it");
const EN = employeeDefaults("en");

function parse(search: string, locale: "it" | "en" = "it"): EmployeeState {
  const initial = employeeDefaults(locale);
  return employeeFromQuery(readQuery(search, EMPLOYEE_PARAMS), initial, locale);
}

function write(patch: Partial<EmployeeState>, locale: "it" | "en" = "it"): string {
  return employeeQueryString({ ...employeeDefaults(locale), ...patch }, locale);
}

describe("writing the query", () => {
  it("emits no params when the state matches the defaults", () => {
    expect(employeeQueryString(IT, "it")).toBe("");
    expect(employeeQueryString(EN, "en")).toBe("");
  });

  it("emits only the keys that diverge from the defaults, short names first", () => {
    expect(write({ gross: "42.000", region: "toscana" })).toBe("l=42000&r=toscana");
  });

  it("writes az15 and pubblico only when they are set", () => {
    expect(write({ companySize: "large" })).toBe("a=1");
    expect(write({ isPublicEmployee: true })).toBe("p=1");
  });

  it("writes the custom INPS rates as percentages when they are switched on", () => {
    expect(write({ inpsOverride: true, inpsEmployeeRate: "9,49", inpsEmployerRate: "23,81" })).toBe(
      "e=9.49&d=23.81",
    );
    expect(write({ inpsEmployeeRate: "9,49" })).toBe("");
    expect(write({ inpsOverride: true, inpsEmployeeRate: "abc" })).toBe("");
  });

  it("writes the comune under its own key and the manual rate only when it moved", () => {
    expect(write({ comune: "F205" })).toBe("k=F205");
    expect(write({ comune: "F205", municipalRate: "0,5" })).toBe("k=F205&c=0.5");
    expect(write({ municipalRate: "0,8345" })).toBe("c=0.8345");
    expect(write({ municipalRate: "0" })).toBe("c=0");
  });

  it("writes the mensilità, the year and the contract", () => {
    expect(write({ paymentFrequency: 16, year: 2024, contractType: "apprendistato" })).toBe(
      "y=2024&m=16&t=apprendistato",
    );
  });

  it("starting from the net, writes the mode and the target but no gross", () => {
    expect(write({ mode: "net", targetNet: "2.000", gross: "42.000" })).toBe("s=n&n=2000");
    expect(write({ targetNet: "2.000" })).toBe("");
  });

  it("starting from the net, writes the target even when it is the default", () => {
    expect(write({ mode: "net" })).toBe("s=n&n=1800");
    expect(parse(`?${write({ mode: "net" })}`)).toMatchObject({ mode: "net", targetNet: "1.800" });
  });

  it("rounds the amounts to whole euros and leaves out what it cannot read", () => {
    expect(write({ gross: "35.000,60" })).toBe("l=35001");
    expect(write({ gross: "tanti" })).toBe("");
    expect(write({ gross: "-5" })).toBe("");
    expect(write({ mode: "net", targetNet: "150k" })).toBe("s=n");
  });

  it("writes the same query whatever the locale", () => {
    expect(write({ gross: "42,000", municipalRate: "0.5" }, "en")).toBe(
      write({ gross: "42.000", municipalRate: "0,5" }),
    );
  });
});

describe("reading the query", () => {
  it("returns the defaults when no params match", () => {
    expect(parse("?foo=bar")).toEqual(IT);
    expect(parse("")).toEqual(IT);
  });

  it("reads every short name", () => {
    expect(
      parse("?l=42000&y=2025&r=toscana&k=D612&c=0.2&m=14&t=apprendistato&a=1&p=1&e=9.49&d=23.81"),
    ).toEqual({
      ...IT,
      gross: "42.000",
      year: 2025,
      region: "toscana",
      comune: "D612",
      municipalRate: "0,2",
      paymentFrequency: 14,
      contractType: "apprendistato",
      companySize: "large",
      isPublicEmployee: true,
      inpsOverride: true,
      inpsEmployeeRate: "9,49",
      inpsEmployerRate: "23,81",
    });
  });

  it("still reads every legacy long name", () => {
    expect(
      parse(
        "?lordo=42000&anno=2024&regione=lazio&comune=0.9&mens=15&contratto=determinato" +
          "&az15=1&pubblico=1&inpsEmp=9.49&inpsDat=23.81&partenza=n&netto=2150",
      ),
    ).toEqual({
      ...IT,
      gross: "42.000",
      year: 2024,
      region: "lazio",
      municipalRate: "0,9",
      paymentFrequency: 15,
      contractType: "determinato",
      companySize: "large",
      isPublicEmployee: true,
      inpsOverride: true,
      inpsEmployeeRate: "9,49",
      inpsEmployerRate: "23,81",
      mode: "net",
      targetNet: "2.150",
    });
  });

  it("prefers the short key when both forms are present", () => {
    expect(parse("?l=42000&lordo=10000").gross).toBe("42.000");
    expect(parse("?l=abc&lordo=10000").gross).toBe("30.000");
  });

  it("reads the lordo the way the live site does", () => {
    expect(parse("?l=35000.7").gross).toBe("35.000");
    expect(parse("?l=1e5").gross).toBe("100.000");
    expect(parse("?l=-100").gross).toBe("30.000");
    expect(parse("?l=0").gross).toBe("30.000");
    expect(parse("?l=").gross).toBe("30.000");
    expect(parse("?l=35k").gross).toBe("30.000");
  });

  it("accepts every mensilità from 12 to 16", () => {
    for (const m of [12, 13, 14, 15, 16]) {
      expect(parse(`?m=${String(m)}`).paymentFrequency).toBe(m);
    }
    expect(parse("?m=11").paymentFrequency).toBe(13);
    expect(parse("?m=17").paymentFrequency).toBe(13);
    expect(parse("?m=13.5").paymentFrequency).toBe(13);
  });

  it("accepts only the supported years and known regions and contracts", () => {
    expect(parse("?y=2023").year).toBe(IT.year);
    expect(parse("?y=2025.0").year).toBe(2025);
    expect(parse("?r=narnia").region).toBe("lombardia");
    expect(parse("?r=Lazio").region).toBe("lombardia");
    expect(parse("?t=stagionale").contractType).toBe("indeterminato");
  });

  it("reads the comunale rate as a percentage between 0 and 100", () => {
    expect(parse("?c=0.9").municipalRate).toBe("0,9");
    expect(parse("?c=").municipalRate).toBe("0");
    expect(parse("?c=0,9").municipalRate).toBe("0,8");
    expect(parse("?c=101").municipalRate).toBe("0,8");
    expect(parse("?c=0.83456").municipalRate).toBe("0,8346");
    expect(parse("?c=0.9", "en").municipalRate).toBe("0.9");
  });

  it("reads az15 and pubblico both ways and nothing else", () => {
    expect(parse("?a=0").companySize).toBe("small");
    expect(parse("?a=yes").companySize).toBe("small");
    expect(parse("?p=0").isPublicEmployee).toBe(false);
    expect(parse("?p=true").isPublicEmployee).toBe(false);
  });

  it("ignores a partial INPS override", () => {
    expect(parse("?e=9.49").inpsOverride).toBe(false);
    expect(parse("?d=23.81").inpsOverride).toBe(false);
    expect(parse("?e=9.49&d=abc").inpsOverride).toBe(false);
  });

  it("reads the mode and the wanted net, within the plausible range", () => {
    expect(parse("?s=n&n=2150")).toMatchObject({ mode: "net", targetNet: "2.150" });
    expect(parse("?s=l")).toMatchObject({ mode: "gross" });
    expect(parse("?s=x").mode).toBe("gross");
    expect(parse("?n=0").targetNet).toBe("1.800");
    expect(parse("?n=-500").targetNet).toBe("1.800");
    expect(parse("?n=999999").targetNet).toBe("1.800");
  });

  it("reads a comune code in any case and ignores anything else", () => {
    expect(parse("?k=f205").comune).toBe("F205");
    expect(parse("?k=Milano").comune).toBeNull();
    expect(parse("?k=").comune).toBeNull();
  });
});

describe("round trips", () => {
  it.each([
    "l=42000&r=toscana&c=0.2&m=14&t=apprendistato&a=1&p=1&e=9.49&d=23.81",
    "y=2024&r=lazio&k=H501",
    "y=2025&m=16&s=n&n=2150",
    "k=F205&c=0.5",
  ])("reads and writes %s back unchanged", (query) => {
    for (const locale of ["it", "en"] as const) {
      expect(employeeQueryString(parse(`?${query}`, locale), locale)).toBe(query);
    }
  });

  it("rewrites legacy long names as short ones", () => {
    const state = parse("?lordo=42000&contratto=apprendistato&partenza=n&netto=2000");
    expect(employeeQueryString(state, "it")).toBe("t=apprendistato&s=n&n=2000");
    expect(writeQuery(employeeToQuery(parse("?lordo=42000"), "it"), EMPLOYEE_PARAMS)).toBe(
      "l=42000",
    );
  });
});

describe("employeeUrlState", () => {
  it("is one stable config per locale over the employee params", () => {
    const config = employeeUrlState("it");
    expect(employeeUrlState("it")).toBe(config);
    expect(config.params).toBe(EMPLOYEE_PARAMS);
    expect(config.initial).toBe(IT);
    expect(config.fromQuery({ l: "50000" }, config.initial).gross).toBe("50.000");
    expect(config.toQuery({ ...IT, gross: "50.000" })).toMatchObject({ l: "50000" });
    expect(employeeUrlState("en").initial).toBe(EN);
  });
});

describe("employeeToQuery keeps shared links valid", () => {
  it("does not write a RAL or a municipal rate the form would reject", () => {
    const state = {
      ...employeeDefaults("it"),
      gross: "2.000.000",
      municipalRate: "3",
    };
    const query = employeeToQuery(state, "it");
    expect(query.l).toBeUndefined();
    expect(query.c).toBeUndefined();
  });
});
