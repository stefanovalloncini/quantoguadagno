import { describe, expect, it } from "vitest";
import { readQuery, writeQuery } from "@/islands/runtime/query.ts";
import { ORDINARIO_PARAMS } from "@/queryParams.ts";
import { ordinarioDefaults, setOrdinarioField, type OrdinarioState } from "./state.ts";
import { ordinarioFromQuery, ordinarioToQuery } from "./url.ts";

const DEFAULTS = ordinarioDefaults("it");

function fromSearch(search: string): OrdinarioState {
  return ordinarioFromQuery(readQuery(search, ORDINARIO_PARAMS), DEFAULTS, "it");
}

function toSearch(state: OrdinarioState): string {
  return writeQuery(ordinarioToQuery(state, "it"), ORDINARIO_PARAMS);
}

describe("ordinario shared links", () => {
  it("writes nothing for the defaults", () => {
    expect(toSearch(DEFAULTS)).toBe("");
  });

  it("restores every field a link can carry", () => {
    expect(
      fromSearch(
        "?f=80000&s=45000&y=2025&r=veneto&k=L736&c=0.5&g=commercianti&m=6&a=intermediari&n=1",
      ),
    ).toEqual({
      ...DEFAULTS,
      revenue: "80.000",
      costs: "45.000",
      year: 2025,
      region: "veneto",
      comune: "L736",
      municipalRate: "0,5",
      gestion: "commercianti",
      months: "6",
      activity: "intermediari",
      startup: true,
    });
  });

  it("writes back what it restores", () => {
    const search = "f=80000&s=45000&y=2025&r=veneto&k=L736&g=commercianti&m=6&a=intermediari&n=1";
    expect(toSearch(fromSearch(`?${search}`))).toBe(search);
  });

  it("suggests the activity of the scheme unless the link names one", () => {
    expect(fromSearch("?g=commercianti").activity).toBe("commercio");
    expect(fromSearch("?g=artigiani").activity).toBe("altre-attivita");
    expect(fromSearch("?g=commercianti&a=professionisti").activity).toBe("professionisti");
    expect(toSearch(fromSearch("?g=commercianti"))).toBe("g=commercianti");
  });

  it("keeps zero costs and a professional fund amount", () => {
    const state = fromSearch("?s=0&g=cassa-professionale&q=6000");
    expect(state).toMatchObject({
      costs: "0",
      gestion: "cassa-professionale",
      cassaAmount: "6.000",
    });
    expect(toSearch(state)).toBe("s=0&g=cassa-professionale&q=6000");
  });

  it("writes the other cover and the months only where they apply", () => {
    const artigiani = setOrdinarioField(DEFAULTS, "gestion", "artigiani");
    expect(toSearch({ ...DEFAULTS, hasOtherPension: true })).toBe("o=1");
    expect(toSearch({ ...artigiani, hasOtherPension: true })).toBe("g=artigiani");
    expect(toSearch({ ...DEFAULTS, months: "6" })).toBe("");
    expect(toSearch({ ...artigiani, months: "6" })).toBe("g=artigiani&m=6");
  });

  it("ignores values it does not know", () => {
    expect(fromSearch("?f=-5&y=1999&r=atlantide&g=agricoltori&m=13&a=pesca&n=si")).toEqual(
      DEFAULTS,
    );
  });
});
