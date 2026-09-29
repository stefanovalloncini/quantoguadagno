import { STORED_PARAMS, type StoredKey, type StoredValue } from "./stored.ts";
import type { IsoDate } from "./types.ts";

export interface DatedValue<T> {
  readonly from: IsoDate;
  readonly value: T;
}

export interface ValueTimeline<T> {
  readonly revaluedYearly: boolean;
  readonly entries: readonly DatedValue<T>[];
}

export type StoredValues = { readonly [K in StoredKey]: ValueTimeline<StoredValue<K>> };

function valuesWithoutSources(): StoredValues {
  const timelines = Object.entries(STORED_PARAMS).map(([key, definition]) => [
    key,
    {
      revaluedYearly: definition.revaluedYearly,
      entries: definition.entries.map(({ from, value }) => ({ from, value })),
    },
  ]);
  return Object.fromEntries(timelines) as StoredValues;
}

export const STORED_VALUES: StoredValues = valuesWithoutSources();
