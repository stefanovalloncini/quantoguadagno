import { AUTONOMI_PARAMS } from "./params/autonomi.ts";
import { DEDUCTION_PARAMS } from "./params/deductions.ts";
import { EMPLOYER_PARAMS } from "./params/employer.ts";
import { FORFETTARIO_PARAMS } from "./params/forfettario.ts";
import { FRINGE_BENEFIT_PARAMS } from "./params/fringeBenefits.ts";
import { INPS_PARAMS } from "./params/inps.ts";
import { IRPEF_PARAMS } from "./params/irpef.ts";
import { NASPI_PARAMS } from "./params/naspi.ts";
import { REGIONAL_PARAMS } from "./params/regions.ts";
import { SPECIAL_CONDITION_PARAMS } from "./params/specialConditions.ts";
import { entryAt } from "./timeline.ts";
import type { Entry, IsoDate, ParamDefinition } from "./types.ts";

export const STORED_PARAMS = {
  ...IRPEF_PARAMS,
  ...INPS_PARAMS,
  ...AUTONOMI_PARAMS,
  ...DEDUCTION_PARAMS,
  ...FRINGE_BENEFIT_PARAMS,
  ...EMPLOYER_PARAMS,
  ...SPECIAL_CONDITION_PARAMS,
  ...FORFETTARIO_PARAMS,
  ...NASPI_PARAMS,
  ...REGIONAL_PARAMS,
} satisfies Readonly<Record<string, ParamDefinition<unknown>>>;

export type StoredParams = typeof STORED_PARAMS;

export type StoredKey = keyof StoredParams;

export type StoredValue<K extends StoredKey> = StoredParams[K]["entries"][number]["value"];

export function storedEntries<K extends StoredKey>(key: K): readonly Entry<StoredValue<K>>[] {
  const definition: ParamDefinition<StoredValue<K>> = STORED_PARAMS[key];
  return definition.entries;
}

export function storedEntry<K extends StoredKey>(key: K, date: IsoDate): Entry<StoredValue<K>> {
  return entryAt(storedEntries(key), date, key);
}
