import { FOI_INDEX } from "@/data/index.ts";
import type { Locale } from "@/i18n/locales.ts";
import { parseDecimal, parseMoneyInput } from "@/i18n/numbers.ts";
import {
  MAX_DEPENDENT_COUNT,
  MAX_GROSS,
  MAX_GROWTH_PCT,
  MAX_MUNICIPAL_TAX_RATE,
  MIN_GROWTH_PCT,
} from "./state.ts";
import type { SalaryEntry } from "./storage.ts";

export interface ViewError {
  readonly key: string;
  readonly values?: Readonly<Record<string, number>>;
}

export type DraftField = "year" | "gross" | "municipal" | "children" | "others";

export interface DraftTexts {
  readonly gross: string;
  readonly municipal: string;
  readonly children: string;
  readonly others: string;
}

export const ENTRY_YEARS: readonly number[] = FOI_INDEX.map((point) => point.year).reverse();

export type DraftErrors = Readonly<Partial<Record<DraftField, ViewError>>>;

export function grossError(text: string, locale: Locale): ViewError | undefined {
  if (text.trim() === "") return { key: "field.error.ral.required" };
  const value = parseMoneyInput(text, locale);
  if (value === null) return { key: "field.error.ral.invalid" };
  if (value < 1 || value > MAX_GROSS) {
    return { key: "field.error.ral.range", values: { min: 1, max: MAX_GROSS } };
  }
  return undefined;
}

export function parsePercentText(text: string, locale: Locale): number | null {
  return parseDecimal(text.trim().replace(/\s*%$/, ""), locale);
}

export function municipalRateOf(text: string, locale: Locale): number | null {
  const percent = parsePercentText(text, locale);
  if (percent === null) return null;
  const rate = percent / 100;
  return rate < 0 || rate > MAX_MUNICIPAL_TAX_RATE ? null : rate;
}

export function countOf(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  if (!/^\d{1,3}$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return value > MAX_DEPENDENT_COUNT ? null : value;
}

export function growthOf(text: string, locale: Locale): number | null {
  const percent = parsePercentText(text, locale);
  if (percent === null || percent < MIN_GROWTH_PCT || percent > MAX_GROWTH_PCT) return null;
  return percent;
}

export function checkDraft(
  texts: DraftTexts,
  year: number,
  entries: readonly SalaryEntry[],
  locale: Locale,
): DraftErrors {
  const errors: Partial<Record<DraftField, ViewError>> = {};
  if (entries.some((entry) => entry.year === year)) {
    errors.year = { key: "history.form.duplicate", values: { year } };
  }
  const gross = grossError(texts.gross, locale);
  if (gross !== undefined) errors.gross = gross;
  if (municipalRateOf(texts.municipal, locale) === null) {
    errors.municipal = {
      key: "field.error.percentRange",
      values: { min: 0, max: MAX_MUNICIPAL_TAX_RATE * 100 },
    };
  }
  const range = { min: 0, max: MAX_DEPENDENT_COUNT };
  if (countOf(texts.children) === null) {
    errors.children = { key: "field.error.integerRange", values: range };
  }
  if (countOf(texts.others) === null) {
    errors.others = { key: "field.error.integerRange", values: range };
  }
  return errors;
}

export function nextYearToAdd(added: number, entries: readonly SalaryEntry[]): number {
  const used = new Set([...entries.map((entry) => entry.year), added]);
  const earlier = ENTRY_YEARS.find((year) => year < added && !used.has(year));
  return earlier ?? ENTRY_YEARS.find((year) => !used.has(year)) ?? added;
}
