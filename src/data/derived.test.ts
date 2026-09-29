import { describe, expect, it } from "vitest";
import { DERIVED_PARAMS } from "./derived.ts";
import { param, SUPPORTED_YEARS, yearStart, type SupportedYear } from "./registry.ts";
import { STORED_PARAMS } from "./stored.ts";

interface Published {
  readonly massimaleAnte1996: number;
  readonly minimumArtigiani: number;
  readonly minimumCommercianti: number;
}

const CIRCULARS: Record<SupportedYear, Published> = {
  2024: { massimaleAnte1996: 91_680, minimumArtigiani: 4427.04, minimumCommercianti: 4515.43 },
  2025: { massimaleAnte1996: 92_413, minimumArtigiani: 4460.64, minimumCommercianti: 4549.7 },
  2026: { massimaleAnte1996: 93_707, minimumArtigiani: 4521.36, minimumCommercianti: 4611.64 },
};

describe("valori derivati invece che copiati", () => {
  it.each(SUPPORTED_YEARS)("%i: massimale ante 1996 = prima fascia × 5/3", (year) => {
    const at = yearStart(year);
    const massimale = param("inps.autonomi.massimaleAnte1996", at);
    expect(massimale).toBe(Math.round((param("inps.firstBand", at) * 5) / 3));
    expect(massimale).toBe(CIRCULARS[year].massimaleAnte1996);
  });

  it.each(SUPPORTED_YEARS)(
    "%i: minimale della Gestione Separata = minimale di artigiani e commercianti",
    (year) => {
      const at = yearStart(year);
      expect(param("inps.gestioneSeparata.minimale", at)).toBe(param("inps.autonomi.minimale", at));
    },
  );

  it.each(SUPPORTED_YEARS)(
    "%i: contributo minimo = minimale × aliquota + maternità, come nella circolare",
    (year) => {
      const at = yearStart(year);
      expect(param("inps.artigiani.minimumContribution", at)).toBe(
        CIRCULARS[year].minimumArtigiani,
      );
      expect(param("inps.commercianti.minimumContribution", at)).toBe(
        CIRCULARS[year].minimumCommercianti,
      );
    },
  );

  it("aliquote oltre la prima fascia: un punto in più, senza residui di virgola mobile", () => {
    const at = yearStart(2026);
    expect(param("inps.employee.rateAboveFirstBand", at)).toBe(0.1019);
    expect(param("inps.employee.publicRateAboveFirstBand", at)).toBe(0.098);
    expect(param("inps.artigiani.rateAboveFirstBand", at)).toBe(0.25);
    expect(param("inps.commercianti.rateAboveFirstBand", at)).toBe(0.2548);
  });

  it("esonero madri lavoratrici: limite mensile = limite annuo / 12", () => {
    expect(param("madreLavoratrice.maxMonthlyExemption", yearStart(2026))).toBe(250);
  });

  it("un valore derivato non ha anche una voce propria nel registro", () => {
    for (const key of Object.keys(DERIVED_PARAMS)) {
      expect(Object.hasOwn(STORED_PARAMS, key)).toBe(false);
    }
  });

  it("ogni valore derivato dichiara i dati da cui dipende", () => {
    for (const definition of Object.values(DERIVED_PARAMS)) {
      expect(definition.inputs.length).toBeGreaterThan(0);
      for (const input of definition.inputs) expect(Object.hasOwn(STORED_PARAMS, input)).toBe(true);
    }
  });
});
