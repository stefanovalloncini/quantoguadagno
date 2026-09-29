import { BCP47_TAG, type Locale } from "./locales.ts";

const NBSP = String.fromCharCode(0xa0);
const NARROW_NBSP = String.fromCharCode(0x202f);
const MINUS = String.fromCharCode(0x2212);
const PLUS = "+";

const decimalFormatterCache = new Map<string, Intl.NumberFormat>();

function decimalFormatter(locale: Locale, fractionDigits: number | undefined): Intl.NumberFormat {
  const min = fractionDigits ?? 0;
  const max = fractionDigits ?? 3;
  const cacheKey = `${locale}:${String(min)}:${String(max)}`;
  let formatter = decimalFormatterCache.get(cacheKey);
  if (!formatter) {
    formatter = new Intl.NumberFormat(BCP47_TAG[locale], {
      style: "decimal",
      useGrouping: true,
      minimumFractionDigits: min,
      maximumFractionDigits: max,
    });
    decimalFormatterCache.set(cacheKey, formatter);
  }
  return formatter;
}

export function formatNumber(value: number, locale: Locale, fractionDigits?: number): string {
  return decimalFormatter(locale, fractionDigits).format(value);
}

export type SignDisplay = "negative" | "always";

export interface FormatMoneyOptions {
  readonly integer?: boolean;
  readonly sign?: SignDisplay;
}

function signOf(value: number, fractionDigits: number, display: SignDisplay): string {
  const rounded = Number(value.toFixed(fractionDigits));
  if (rounded < 0) return MINUS;
  if (rounded > 0 && display === "always") return PLUS;
  return "";
}

export function formatMoney(value: number, locale: Locale, options?: FormatMoneyOptions): string {
  const fractionDigits = options?.integer === true ? 0 : 2;
  const sign = signOf(value, fractionDigits, options?.sign ?? "negative");
  const amount = formatNumber(Math.abs(value), locale, fractionDigits);
  return locale === "it" ? `${sign}${amount}${NBSP}€` : `${sign}€${amount}`;
}

export function formatAmountInput(value: number, locale: Locale): string {
  const cents = Math.round(value * 100);
  return formatNumber(cents / 100, locale, cents % 100 === 0 ? 0 : 2);
}

export function formatPercent(value: number, locale: Locale, fractionDigits = 0): string {
  const sign = value < 0 ? "-" : "";
  const amount = formatNumber(Math.abs(value) * 100, locale, fractionDigits);
  return `${sign}${amount}%`;
}

export type DateStyle = "long" | "short";

const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();

function dateFormatter(locale: Locale, style: DateStyle): Intl.DateTimeFormat {
  const cacheKey = `${locale}:${style}`;
  let formatter = dateFormatterCache.get(cacheKey);
  if (!formatter) {
    const options: Intl.DateTimeFormatOptions =
      style === "long"
        ? { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }
        : { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" };
    formatter = new Intl.DateTimeFormat(BCP47_TAG[locale], options);
    dateFormatterCache.set(cacheKey, formatter);
  }
  return formatter;
}

export function formatDate(date: Date, locale: Locale, style: DateStyle = "long"): string {
  return dateFormatter(locale, style).format(date);
}

const GROUP_CHAR: Record<Locale, string> = { it: ".", en: "," };
const DECIMAL_CHAR: Record<Locale, string> = { it: ",", en: "." };

export function parseDecimal(input: string, locale: Locale): number | null {
  if (typeof input !== "string") return null;

  let text = input.split(NBSP).join(" ").split(NARROW_NBSP).join(" ").trim();
  if (text === "") return null;

  text = text.replace(/\s+/g, "");
  text = text.replace(/^€/, "").replace(/€$/, "");
  if (text === "") return null;

  let sign = "";
  if (text.startsWith("+") || text.startsWith("-")) {
    sign = text.startsWith("-") ? "-" : "";
    text = text.slice(1);
  }
  if (text === "") return null;

  const decimalChar = DECIMAL_CHAR[locale];
  const groupChar = GROUP_CHAR[locale];
  const decimalIndex = text.lastIndexOf(decimalChar);

  const rawIntegerPart = decimalIndex === -1 ? text : text.slice(0, decimalIndex);
  const fractionPart = decimalIndex === -1 ? undefined : text.slice(decimalIndex + 1);
  const integerPart = rawIntegerPart.split(groupChar).join("");

  if (!/^\d+$/.test(integerPart)) return null;
  if (fractionPart !== undefined && !/^\d*$/.test(fractionPart)) return null;

  const numeric =
    fractionPart === undefined
      ? integerPart
      : `${integerPart}.${fractionPart === "" ? "0" : fractionPart}`;
  const result = Number(`${sign}${numeric}`);
  return Number.isFinite(result) ? result : null;
}

const THOUSANDS_SUFFIX = /\s*(?:k|mila)$/i;
const SHORT_DECIMAL = /^(\d+)[.,](\d{1,2})$/;

export function parseMoneyInput(input: string, locale: Locale): number | null {
  const text = input.trim().replace(/€$/, "").trim();
  const suffix = THOUSANDS_SUFFIX.exec(text);
  if (suffix === null) return parseDecimal(input, locale);

  const thousands = parseThousands(text.slice(0, suffix.index), locale);
  return thousands === null ? null : Math.round(thousands * 100_000) / 100;
}

function parseThousands(text: string, locale: Locale): number | null {
  const shortDecimal = SHORT_DECIMAL.exec(text.trim());
  if (shortDecimal !== null) return Number(`${shortDecimal[1] ?? ""}.${shortDecimal[2] ?? ""}`);
  return parseDecimal(text, locale);
}
