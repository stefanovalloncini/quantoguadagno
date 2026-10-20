import { describe, expect, it } from "vitest";
import { DERIVED_PARAMS } from "./derived.ts";
import { DATASETS, daVerificare, latestVerification, listParameters } from "./fonti.ts";
import { REGION_CODES } from "./regions.ts";
import { param, SUPPORTED_YEARS, yearStart, type ParamKey } from "./registry.ts";
import { STORED_PARAMS, type StoredKey } from "./stored.ts";

const STORED_KEYS = Object.keys(STORED_PARAMS) as StoredKey[];
const ALL_KEYS = [...STORED_KEYS, ...Object.keys(DERIVED_PARAMS)] as ParamKey[];

const CHECKED_IN_PHASE_0: readonly string[] = [
  "irpef.trattamentoIntegrativo",
  "inps.firstBand",
  "inps.massimale",
  "inps.aboveFirstBandSurcharge",
  "inps.employee.rate",
  "inps.employee.apprenticeRate",
  "inps.employee.publicRate",
  "inps.employee.exemption2024",
  "inps.autonomi.minimale",
  "inps.artigiani.rate",
  "inps.commercianti.rate",
  "inps.autonomi.maternity",
  "inps.autonomi.forfettarioReduction",
  "inps.gestioneSeparata.rates",
  "forfettario.concurrentEmployeeIncomeLimit",
  "deductions.spouse",
  "deductions.children",
  "deductions.otherFamily",
  "deductions.expenses",
  "deductions.expensePhaseOut",
  "deductions.expenseCap",
  "deductions.expenseReduction",
  "fringe.welfare",
  "tfr",
  ...REGION_CODES.map((code) => `regions.${code}`),
];

const CHECKED_ON_2026_10_20: readonly string[] = ["irpef.selfEmployedDeduction"];

const CHECK_SESSIONS: Readonly<Record<string, readonly string[]>> = {
  "2026-09-28": CHECKED_IN_PHASE_0,
  "2026-10-20": CHECKED_ON_2026_10_20,
};

describe("fonti: elenco dei parametri", () => {
  const listing = listParameters();

  it("elenca ogni parametro, salvato o derivato, una volta sola", () => {
    expect(listing.map((row) => row.key).sort()).toEqual([...ALL_KEYS].sort());
  });

  it("ha una riga per ogni anno supportato, con il valore in vigore il 1° gennaio", () => {
    for (const row of listing) {
      expect(row.years.map((year) => year.year)).toEqual(SUPPORTED_YEARS);
      for (const year of row.years) {
        expect(year.value).toEqual(param(row.key, yearStart(year.year)));
        expect(year.from <= yearStart(year.year)).toBe(true);
        expect(year.source.ref).not.toBe("");
      }
    }
  });

  it("i derivati dicono da quali parametri vengono, i salvati no", () => {
    for (const row of listing) {
      const isDerived = Object.hasOwn(DERIVED_PARAMS, row.key);
      expect(row.derivedFrom === null).toBe(!isDerived);
    }
  });

  it("un derivato è verificato solo se lo sono la regola e tutti i suoi dati", () => {
    const byKey = new Map(listing.map((row) => [row.key, row]));
    const ante1996 = byKey.get("inps.autonomi.massimaleAnte1996");
    const separata = byKey.get("inps.gestioneSeparata.minimale");
    expect(ante1996?.years.every((year) => year.source.verified === "2026-09-28")).toBe(true);
    expect(separata?.years.every((year) => year.source.verified === undefined)).toBe(true);
  });
});

describe("fonti: da verificare", () => {
  const items = daVerificare();

  it("contiene ogni voce senza data di verifica e nessuna voce verificata", () => {
    const expected = STORED_KEYS.flatMap((key) =>
      STORED_PARAMS[key].entries
        .filter((entry) => entry.source.verified === undefined)
        .map((entry) => `${key}@${entry.from}`),
    );
    const listed = items.flatMap((item) =>
      item.kind === "entry" ? [`${item.key}@${item.from}`] : [],
    );
    expect(listed.sort()).toEqual(expected.sort());
  });

  it("verificati sono solo i valori controllati, ognuno con la data del suo controllo", () => {
    const verified = STORED_KEYS.filter((key) =>
      STORED_PARAMS[key].entries.some((entry) => entry.source.verified !== undefined),
    );
    expect(verified.sort()).toEqual(Object.values(CHECK_SESSIONS).flat().sort());
    for (const [date, keys] of Object.entries(CHECK_SESSIONS)) {
      for (const key of STORED_KEYS.filter((candidate) => keys.includes(candidate))) {
        for (const entry of STORED_PARAMS[key].entries) {
          if (entry.source.verified !== undefined) expect(entry.source.verified).toBe(date);
        }
      }
    }
  });

  it("riporta anche le regole di derivazione e i dataset non verificati", () => {
    const keysOf = (kind: string) =>
      items.filter((item) => item.kind === kind).map((item) => item.key);
    expect(keysOf("derivation")).toContain("inps.gestioneSeparata.minimale");
    expect(keysOf("derivation")).not.toContain("inps.autonomi.massimaleAnte1996");
    expect(keysOf("dataset")).toContain("comuni.addizionaleComunale");
    expect(keysOf("dataset")).not.toContain("inflation.foi");
    expect(DATASETS.map((dataset) => dataset.key)).toContain("inflation.foi");
  });

  it("l'ultima verifica è quella del 2026-10-20", () => {
    expect(latestVerification()).toBe("2026-10-20");
  });
});
