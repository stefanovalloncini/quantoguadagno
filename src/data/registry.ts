import { DERIVED_PARAMS, isDerivedKey, type DerivedKey, type DerivedValue } from "./derived.ts";
import type { StoredKey, StoredParams, StoredValue } from "./stored.ts";
import { STORED_VALUES } from "./storedValues.ts";
import { assertIsoDate } from "./timeline.ts";
import type { Entry, IsoDate } from "./types.ts";
import { storedValue } from "./valueLookup.ts";

export type ParamKey = StoredKey | DerivedKey;

export type ParamValue<K extends ParamKey> = K extends StoredKey
  ? StoredValue<K>
  : K extends DerivedKey
    ? DerivedValue<K>
    : never;

export function param<K extends ParamKey>(key: K, date: IsoDate): ParamValue<K> {
  assertIsoDate(date);
  const value: unknown = isDerivedKey(key)
    ? DERIVED_PARAMS[key].compute(date)
    : storedValue(key, date);
  return value as ParamValue<K>;
}

type YearlyStartDate<P> = P extends {
  readonly revaluedYearly: true;
  readonly entries: readonly Entry<unknown, infer D>[];
}
  ? D
  : never;

type YearOf<D> = D extends `${infer Y extends number}-01-01` ? Y : never;

export type SupportedYear = YearOf<
  { [K in StoredKey]: YearlyStartDate<StoredParams[K]> }[StoredKey]
>;

export type TaxYear = SupportedYear;

export function yearStart(year: number): IsoDate {
  return `${String(year)}-01-01` as IsoDate;
}

function isJanuaryFirst(date: IsoDate): boolean {
  return date.endsWith("-01-01");
}

function yearsWithYearlyEntries(): SupportedYear[] {
  const years = new Set<number>();
  for (const definition of Object.values(STORED_VALUES)) {
    if (!definition.revaluedYearly) continue;
    for (const entry of definition.entries) {
      if (isJanuaryFirst(entry.from)) years.add(Number(entry.from.slice(0, 4)));
    }
  }
  return [...years].sort((a, b) => a - b) as SupportedYear[];
}

export const SUPPORTED_YEARS: readonly SupportedYear[] = yearsWithYearlyEntries();

function lastSupportedYear(): SupportedYear {
  const last = SUPPORTED_YEARS[SUPPORTED_YEARS.length - 1];
  if (last === undefined) throw new Error("No parameter is revalued yearly: no supported year");
  return last;
}

export const LATEST_SUPPORTED_YEAR: SupportedYear = lastSupportedYear();

export function isSupportedYear(year: number): year is SupportedYear {
  return (SUPPORTED_YEARS as readonly number[]).includes(year);
}

export function yearlyKeys(): readonly StoredKey[] {
  return (Object.keys(STORED_VALUES) as StoredKey[]).filter(
    (key) => STORED_VALUES[key].revaluedYearly,
  );
}
