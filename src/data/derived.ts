import type { StoredKey, StoredValue } from "./stored.ts";
import type { IsoDate } from "./types.ts";
import { storedValue } from "./valueLookup.ts";

export interface DerivedDefinition<T> {
  readonly inputs: readonly StoredKey[];
  readonly compute: (date: IsoDate) => T;
}

type Getter<I extends StoredKey> = <K extends I>(key: K) => StoredValue<K>;

function derive<const I extends readonly StoredKey[], T>(
  inputs: I,
  compute: (get: Getter<I[number]>) => T,
): DerivedDefinition<T> {
  return {
    inputs,
    compute: (date) => compute((key) => storedValue(key, date)),
  };
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export const DERIVED_PARAMS = {
  "inps.employee.rateAboveFirstBand": derive(
    ["inps.employee.rate", "inps.aboveFirstBandSurcharge"],
    (get) => roundTo(get("inps.employee.rate") + get("inps.aboveFirstBandSurcharge"), 4),
  ),
  "inps.employee.publicRateAboveFirstBand": derive(
    ["inps.employee.publicRate", "inps.aboveFirstBandSurcharge"],
    (get) => roundTo(get("inps.employee.publicRate") + get("inps.aboveFirstBandSurcharge"), 4),
  ),
  "inps.artigiani.rateAboveFirstBand": derive(
    ["inps.artigiani.rate", "inps.aboveFirstBandSurcharge"],
    (get) => roundTo(get("inps.artigiani.rate") + get("inps.aboveFirstBandSurcharge"), 4),
  ),
  "inps.commercianti.rateAboveFirstBand": derive(
    ["inps.commercianti.rate", "inps.aboveFirstBandSurcharge"],
    (get) => roundTo(get("inps.commercianti.rate") + get("inps.aboveFirstBandSurcharge"), 4),
  ),
  "inps.autonomi.massimaleAnte1996": derive(["inps.firstBand"], (get) =>
    Math.round((get("inps.firstBand") * 5) / 3),
  ),
  "inps.gestioneSeparata.minimale": derive(["inps.autonomi.minimale"], (get) =>
    get("inps.autonomi.minimale"),
  ),
  "inps.artigiani.minimumContribution": derive(
    ["inps.autonomi.minimale", "inps.artigiani.rate", "inps.autonomi.maternity"],
    (get) =>
      roundTo(
        get("inps.autonomi.minimale") * get("inps.artigiani.rate") + get("inps.autonomi.maternity"),
        2,
      ),
  ),
  "inps.commercianti.minimumContribution": derive(
    ["inps.autonomi.minimale", "inps.commercianti.rate", "inps.autonomi.maternity"],
    (get) =>
      roundTo(
        get("inps.autonomi.minimale") * get("inps.commercianti.rate") +
          get("inps.autonomi.maternity"),
        2,
      ),
  ),
  "madreLavoratrice.maxMonthlyExemption": derive(
    ["madreLavoratrice"],
    (get) => get("madreLavoratrice").maxAnnualExemption / 12,
  ),
};

export type DerivedParams = typeof DERIVED_PARAMS;

export type DerivedKey = keyof DerivedParams;

export type DerivedValue<K extends DerivedKey> = ReturnType<DerivedParams[K]["compute"]>;

export function isDerivedKey(key: string): key is DerivedKey {
  return Object.hasOwn(DERIVED_PARAMS, key);
}
