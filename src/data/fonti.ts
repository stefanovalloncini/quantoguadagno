import { CCNL_IDS, CCNL_SOURCES } from "./ccnl.ts";
import { COMUNI_SOURCE } from "./comuni.ts";
import { DERIVED_PARAMS, type DerivedKey } from "./derived.ts";
import { DERIVED_RULES } from "./derivedRules.ts";
import { FOI_SOURCE } from "./inflation.ts";
import {
  SUPPORTED_YEARS,
  yearStart,
  type ParamKey,
  type ParamValue,
  type SupportedYear,
} from "./registry.ts";
import { STORED_PARAMS, storedEntries, storedEntry, type StoredKey } from "./stored.ts";
import type { IsoDate, Source } from "./types.ts";

export interface ParameterYear<T> {
  readonly year: SupportedYear;
  readonly from: IsoDate;
  readonly value: T;
  readonly source: Source;
}

export type ParameterListing = {
  [K in ParamKey]: {
    readonly key: K;
    readonly revaluedYearly: boolean;
    readonly derivedFrom: readonly StoredKey[] | null;
    readonly years: readonly ParameterYear<ParamValue<K>>[];
  };
}[ParamKey];

export interface Dataset {
  readonly key: string;
  readonly source: Source;
}

export type UnverifiedItem =
  | {
      readonly kind: "entry";
      readonly key: StoredKey;
      readonly from: IsoDate;
      readonly source: Source;
    }
  | { readonly kind: "derivation"; readonly key: DerivedKey; readonly source: Source }
  | { readonly kind: "dataset"; readonly key: string; readonly source: Source };

export const DATASETS: readonly Dataset[] = [
  { key: "inflation.foi", source: FOI_SOURCE },
  { key: "comuni.addizionaleComunale", source: COMUNI_SOURCE },
  ...CCNL_IDS.flatMap((id) => [
    { key: `ccnl.${id}.preavviso`, source: CCNL_SOURCES[id].preavviso },
    { key: `ccnl.${id}.mensilita`, source: CCNL_SOURCES[id].mensilita },
  ]),
];

const STORED_KEYS = Object.keys(STORED_PARAMS) as readonly StoredKey[];
const DERIVED_KEYS = Object.keys(DERIVED_PARAMS) as readonly DerivedKey[];

function latestDate(dates: readonly IsoDate[]): IsoDate | undefined {
  return dates.reduce<IsoDate | undefined>(
    (latest, date) => (latest === undefined || date > latest ? date : latest),
    undefined,
  );
}

function withVerification(source: Source, verified: IsoDate | undefined): Source {
  const copy: { -readonly [K in keyof Source]: Source[K] } = { ...source };
  delete copy.verified;
  return verified === undefined ? copy : { ...copy, verified };
}

function derivedVerification(rule: Source, inputs: readonly Source[]): IsoDate | undefined {
  const dates = [rule, ...inputs].map((source) => source.verified);
  if (dates.some((date) => date === undefined)) return undefined;
  return latestDate(dates.filter((date): date is IsoDate => date !== undefined));
}

function storedYears(key: StoredKey): ParameterYear<unknown>[] {
  return SUPPORTED_YEARS.map((year) => {
    const entry = storedEntry(key, yearStart(year));
    return { year, from: entry.from, value: entry.value, source: entry.source };
  });
}

function derivedYears(key: DerivedKey): ParameterYear<unknown>[] {
  const definition = DERIVED_PARAMS[key];
  return SUPPORTED_YEARS.map((year) => {
    const date = yearStart(year);
    const inputs = definition.inputs.map((input) => storedEntry(input, date));
    const from = latestDate(inputs.map((entry) => entry.from)) ?? date;
    const rule = DERIVED_RULES[key];
    const verified = derivedVerification(
      rule,
      inputs.map((entry) => entry.source),
    );
    return {
      year,
      from,
      value: definition.compute(date),
      source: withVerification(rule, verified),
    };
  });
}

export function listParameters(): readonly ParameterListing[] {
  const stored = STORED_KEYS.map((key) => ({
    key,
    revaluedYearly: STORED_PARAMS[key].revaluedYearly,
    derivedFrom: null,
    years: storedYears(key),
  }));
  const derived = DERIVED_KEYS.map((key) => ({
    key,
    revaluedYearly: false,
    derivedFrom: DERIVED_PARAMS[key].inputs,
    years: derivedYears(key),
  }));
  return [...stored, ...derived] as readonly ParameterListing[];
}

export function daVerificare(): readonly UnverifiedItem[] {
  const entries = STORED_KEYS.flatMap((key) =>
    storedEntries(key)
      .filter((entry) => entry.source.verified === undefined)
      .map((entry) => ({
        kind: "entry" as const,
        key,
        from: entry.from,
        source: entry.source,
      })),
  );
  const derivations = DERIVED_KEYS.filter((key) => DERIVED_RULES[key].verified === undefined).map(
    (key) => ({ kind: "derivation" as const, key, source: DERIVED_RULES[key] }),
  );
  const datasets = DATASETS.filter((dataset) => dataset.source.verified === undefined).map(
    (dataset) => ({ kind: "dataset" as const, key: dataset.key, source: dataset.source }),
  );
  return [...entries, ...derivations, ...datasets];
}

export function latestVerification(): IsoDate | null {
  const sources = [
    ...STORED_KEYS.flatMap((key) => storedEntries(key).map((entry) => entry.source)),
    ...DERIVED_KEYS.map((key) => DERIVED_RULES[key]),
    ...DATASETS.map((dataset) => dataset.source),
  ];
  const dates = sources
    .map((source) => source.verified)
    .filter((date): date is IsoDate => date !== undefined);
  return latestDate(dates) ?? null;
}
