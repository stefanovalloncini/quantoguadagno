import { LOCALES, type Locale } from "@/i18n/locales.ts";
import { pathFor } from "@/routePaths.ts";

function steps(from: number, to: number, step: number): number[] {
  const values: number[] = [];
  for (let value = from; value <= to; value += step) values.push(value);
  return values;
}

/** Gross annual salaries, in euro, that have a page of their own. */
export const NET_TABLE_AMOUNTS: readonly number[] = [
  ...steps(12_000, 60_000, 1_000),
  ...steps(65_000, 100_000, 5_000),
  120_000,
  150_000,
];

/** The amounts the home page lists, all of them in NET_TABLE_AMOUNTS. */
export const COMMON_AMOUNTS: readonly number[] = [
  20_000, 22_000, 25_000, 28_000, 30_000, 32_000, 35_000, 40_000, 45_000, 50_000, 60_000, 80_000,
];

const SLUG_SUFFIX: Readonly<Record<Locale, string>> = {
  it: "-euro-lordi",
  en: "-euro-gross",
};

const SLUG_AMOUNT = /^[1-9]\d*$/;

export function netTableSlug(amount: number, locale: Locale): string {
  return `${String(amount)}${SLUG_SUFFIX[locale]}`;
}

/** The page of an amount, under the hub: /stipendio-netto/30000-euro-lordi. */
export function netTablePath(amount: number, locale: Locale): string {
  return `${pathFor("netTable", locale)}/${netTableSlug(amount, locale)}`;
}

export function netTablePaths(amount: number): Readonly<Record<Locale, string>> {
  return Object.fromEntries(
    LOCALES.map((locale) => [locale, netTablePath(amount, locale)]),
  ) as Record<Locale, string>;
}

export function amountOfSlug(slug: string, locale: Locale): number | null {
  const suffix = SLUG_SUFFIX[locale];
  if (!slug.endsWith(suffix)) return null;
  const digits = slug.slice(0, -suffix.length);
  if (!SLUG_AMOUNT.test(digits)) return null;
  const amount = Number(digits);
  return NET_TABLE_AMOUNTS.includes(amount) ? amount : null;
}

export interface Neighbours {
  readonly previous: number | null;
  readonly next: number | null;
}

export function neighboursOf(amount: number): Neighbours {
  const index = NET_TABLE_AMOUNTS.indexOf(amount);
  if (index === -1) throw new Error(`${String(amount)} has no page in the net table`);
  return {
    previous: NET_TABLE_AMOUNTS[index - 1] ?? null,
    next: NET_TABLE_AMOUNTS[index + 1] ?? null,
  };
}
