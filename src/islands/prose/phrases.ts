import { BCP47_TAG, type Locale } from "@/i18n/locales.ts";
import { formatDate, formatMoney, formatNumber, formatPercent } from "@/i18n/numbers.ts";
import type { IsoDate } from "@/data/index.ts";

const MINUS_SIGN = "\u2212";
const EN_DASH = "\u2013";
const APOSTROPHE = "’";

function isWhole(value: number): boolean {
  return Math.abs(value - Math.round(value)) < 1e-9;
}

export function percentText(rate: number, locale: Locale): string {
  return formatPercent(rate, locale, isWhole(rate * 100) ? 0 : 2);
}

export function percentRangeText(low: number, high: number, locale: Locale): string {
  if (Math.abs(low - high) < 1e-9) return percentText(low, locale);
  const lowDigits = isWhole(low * 100) && isWhole(high * 100) ? 0 : 2;
  const lowUnits = formatNumber(low * 100, locale, lowDigits);
  return `${lowUnits}${EN_DASH}${formatPercent(high, locale, lowDigits)}`;
}

export function moneyText(amount: number, locale: Locale): string {
  return formatMoney(amount, locale);
}

export function wholeMoneyText(amount: number, locale: Locale): string {
  return formatMoney(amount, locale, { integer: isWhole(amount) });
}

export function wholeMoneyRangeText(low: number, high: number, locale: Locale): string {
  const lowText = formatNumber(low, locale, isWhole(low) ? 0 : 2);
  const highText = wholeMoneyText(high, locale);
  return locale === "it" ? `${lowText}${EN_DASH}${highText}` : `€${lowText}${EN_DASH}${highText}`;
}

export function deductionText(amount: number, locale: Locale): string {
  return `${MINUS_SIGN}${formatMoney(Math.abs(amount), locale)}`;
}

export function numberText(value: number, locale: Locale, fractionDigits?: number): string {
  return formatNumber(value, locale, fractionDigits);
}

export function dateText(date: IsoDate, locale: Locale): string {
  return formatDate(new Date(`${date}T00:00:00Z`), locale);
}

export function yearSpanText(years: readonly number[]): string {
  const first = years[0];
  const last = years[years.length - 1];
  if (first === undefined || last === undefined) return "";
  return first === last ? String(first) : `${String(first)}${EN_DASH}${String(last)}`;
}

export function listText(items: readonly string[], locale: Locale): string {
  return new Intl.ListFormat(BCP47_TAG[locale], { type: "conjunction" }).format(items);
}

export function yearsInProse(years: readonly number[], locale: Locale): string {
  const named = years.map((year) => (locale === "it" ? `il ${String(year)}` : String(year)));
  return listText(named, locale);
}

export type ArticleForm = "il" | "dal" | "al" | "del" | "sul" | "nel";

const ITALIAN_ARTICLES: Readonly<Record<ArticleForm, readonly [string, string, string]>> = {
  il: ["il ", `l${APOSTROPHE}`, "lo "],
  dal: ["dal ", `dall${APOSTROPHE}`, "dallo "],
  al: ["al ", `all${APOSTROPHE}`, "allo "],
  del: ["del ", `dell${APOSTROPHE}`, "dello "],
  sul: ["sul ", `sull${APOSTROPHE}`, "sullo "],
  nel: ["nel ", `nell${APOSTROPHE}`, "nello "],
};

function spokenStartKind(percentUnits: number): 0 | 1 | 2 {
  const whole = Math.floor(Math.abs(percentUnits) + 1e-9);
  if (whole === 0) return 2;
  const startsWithVowel =
    whole === 1 ||
    whole === 8 ||
    whole === 11 ||
    (whole >= 80 && whole <= 89) ||
    (whole >= 800 && whole <= 899);
  return startsWithVowel ? 1 : 0;
}

export function percentPhrase(rate: number, locale: Locale, form: ArticleForm = "il"): string {
  const text = percentText(rate, locale);
  if (locale !== "it") return text;
  const article = ITALIAN_ARTICLES[form][spokenStartKind(rate * 100)];
  return `${article}${text}`;
}

export function compactReference(reference: string): string {
  const colon = reference.indexOf(": ");
  if (colon === -1) return reference;
  const issuer = reference.slice(0, colon).split(", ")[0] ?? reference.slice(0, colon);
  return `${issuer}, ${reference.slice(colon + 2)}`;
}

const CLAUSE_BREAK = /;| - |, come |, conv\.|: /;

export function shortReference(reference: string): string {
  const withoutAside = reference.replace(/\s*\([^)]*\)/g, "").trim();
  const mainClause = withoutAside.split(CLAUSE_BREAK)[0]?.trim() ?? withoutAside;
  const [issuer, ...detail] = mainClause.split(", ");
  const namesOnlyAnIssuer = issuer !== undefined && detail.length > 0 && !/\d/.test(issuer);
  return namesOnlyAnIssuer ? issuer : mainClause;
}
