import type { StoredKey, StoredValue } from "./stored.ts";
import { STORED_VALUES, type ValueTimeline } from "./storedValues.ts";
import { entryAt } from "./timeline.ts";
import type { IsoDate } from "./types.ts";

export function storedValue<K extends StoredKey>(key: K, date: IsoDate): StoredValue<K> {
  const timeline: ValueTimeline<StoredValue<K>> = STORED_VALUES[key];
  return entryAt(timeline.entries, date, key).value;
}
