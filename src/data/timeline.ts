import type { IsoDate } from "./types.ts";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function assertIsoDate(date: string): asserts date is IsoDate {
  if (!ISO_DATE.test(date)) throw new RangeError(`Not a YYYY-MM-DD date: ${date}`);
}

export interface Dated {
  readonly from: IsoDate;
}

export function entryAt<E extends Dated>(entries: readonly E[], date: IsoDate, label: string): E {
  assertIsoDate(date);
  let found: E | undefined;
  for (const entry of entries) {
    if (entry.from > date) break;
    found = entry;
  }
  if (found === undefined) {
    const first = entries[0]?.from ?? "any date";
    throw new RangeError(`${label} has no value before ${first} (asked for ${date})`);
  }
  return found;
}
