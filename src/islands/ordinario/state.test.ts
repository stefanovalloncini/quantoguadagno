import { describe, expect, it } from "vitest";
import {
  adoptOrdinarioField,
  checkOrdinario,
  ordinarioDefaults,
  setOrdinarioField,
  type OrdinarioState,
} from "./state.ts";

const DEFAULTS = ordinarioDefaults("it");

function check(changes: Partial<OrdinarioState>) {
  return checkOrdinario({ ...DEFAULTS, ...changes }, "it");
}

describe("checkOrdinario", () => {
  it("reads the defaults as 50.000 € of fees and 10.000 € of costs in Gestione Separata", () => {
    const { values, errors } = check({});
    expect(errors).toEqual({});
    expect(values).toMatchObject({
      revenue: 50_000,
      costs: 10_000,
      regionCode: "lombardia",
      comune: null,
      municipalRate: 0.008,
      gestion: "gestione-separata",
      months: 12,
      cassaAmount: 0,
      activity: "professionisti",
      startup: false,
    });
  });

  it("waits without an error while the revenue is empty", () => {
    expect(check({ revenue: " " })).toEqual({ values: null, errors: {} });
  });

  it("rejects costs it cannot read and keeps the error for the field", () => {
    const { values, errors } = check({ costs: "tanto" });
    expect(values).toBeNull();
    expect(errors.costs?.key).toBe("field.error.money");
  });

  it("checks the months only for Artigiani and Commercianti", () => {
    expect(check({ months: "13" }).values?.months).toBe(12);
    const commercianti = check({ gestion: "commercianti", months: "13" });
    expect(commercianti.values).toBeNull();
    expect(commercianti.errors.months?.key).toBe("field.error.integerRange");
    expect(check({ gestion: "artigiani", months: "6" }).values?.months).toBe(6);
  });

  it("reads the professional fund amount only for a cassa", () => {
    expect(check({ cassaAmount: "abc" }).values?.cassaAmount).toBe(0);
    expect(check({ gestion: "cassa-professionale", cassaAmount: "6.000" }).values).toMatchObject({
      gestion: "cassa-professionale",
      cassaAmount: 6000,
    });
    expect(
      check({ gestion: "cassa-professionale", cassaAmount: "abc" }).errors.cassaAmount,
    ).toEqual({ key: "field.error.money" });
  });

  it("applies the other pension cover only to Gestione Separata", () => {
    expect(check({ hasOtherPension: true }).values?.hasOtherPension).toBe(true);
    expect(check({ hasOtherPension: true, gestion: "artigiani" }).values?.hasOtherPension).toBe(
      false,
    );
  });

  it("ignores a wrong municipal rate once a comune is chosen", () => {
    expect(check({ municipalRate: "9" }).errors.municipalRate).toBeDefined();
    expect(check({ municipalRate: "9", comune: "F205" }).values?.municipalRate).toBe(0.008);
  });
});

describe("setOrdinarioField", () => {
  it("forgets the comune when the region changes", () => {
    const withComune = setOrdinarioField(DEFAULTS, "comune", "F205");
    expect(setOrdinarioField(withComune, "region", "lazio")).toMatchObject({
      region: "lazio",
      comune: null,
    });
  });

  it("moves the forfettario activity with the scheme until you pick one", () => {
    const trader = setOrdinarioField(DEFAULTS, "gestion", "commercianti");
    expect(trader.activity).toBe("commercio");
    expect(setOrdinarioField(trader, "gestion", "artigiani").activity).toBe("altre-attivita");
    const picked = setOrdinarioField(trader, "activity", "intermediari");
    expect(setOrdinarioField(picked, "gestion", "artigiani").activity).toBe("intermediari");
  });

  it("returns the same state when nothing changes", () => {
    expect(setOrdinarioField(DEFAULTS, "gestion", "gestione-separata")).toBe(DEFAULTS);
  });
});

describe("adoptOrdinarioField", () => {
  it("adopts what was typed before the page came to life", () => {
    let state = adoptOrdinarioField(DEFAULTS, "revenue", "72.000");
    state = adoptOrdinarioField(state, "costs", "8000");
    state = adoptOrdinarioField(state, "year", "2025");
    state = adoptOrdinarioField(state, "region", "veneto");
    state = adoptOrdinarioField(state, "gestion", "commercianti");
    state = adoptOrdinarioField(state, "startup", true);
    expect(state).toMatchObject({
      revenue: "72.000",
      costs: "8000",
      year: 2025,
      region: "veneto",
      gestion: "commercianti",
      startup: true,
    });
  });

  it("ignores values that are not among the choices", () => {
    expect(adoptOrdinarioField(DEFAULTS, "gestion", "agricoltori")).toBe(DEFAULTS);
    expect(adoptOrdinarioField(DEFAULTS, "activity", "pesca")).toBe(DEFAULTS);
    expect(adoptOrdinarioField(DEFAULTS, "year", "1999")).toBe(DEFAULTS);
    expect(adoptOrdinarioField(DEFAULTS, "revenue", true)).toBe(DEFAULTS);
  });
});
