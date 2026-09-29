import { BCP47_TAG, type Locale } from "@/i18n/locales.ts";
import type { MessageKey as FormKey } from "@/i18n/messages/form/it.ts";
import { formatNumber, parseDecimal, parseMoneyInput } from "@/i18n/numbers.ts";

export type NumberKind = "money" | "integer" | "number" | "percent";

export interface FieldMessages {
  readonly required: FormKey;
  readonly invalid: FormKey;
  readonly range: FormKey;
}

export interface NumberRule {
  readonly kind: NumberKind;
  readonly min: number;
  readonly max: number;
  readonly messages?: FieldMessages;
}

export interface RangeValues {
  readonly min: number;
  readonly max: number;
}

export interface FieldError {
  readonly key: FormKey;
  readonly values?: RangeValues;
}

export type CheckedNumber =
  | { readonly ok: true; readonly value: number }
  | { readonly ok: false; readonly error: FieldError };

const GENERIC_MESSAGES: Readonly<Record<NumberKind, Omit<FieldMessages, "required">>> = {
  money: { invalid: "field.error.money", range: "field.error.moneyRange" },
  integer: { invalid: "field.error.integer", range: "field.error.integerRange" },
  number: { invalid: "field.error.number", range: "field.error.numberRange" },
  percent: { invalid: "field.error.percent", range: "field.error.percentRange" },
};

const PERCENT_SIGN = /\s*%$/;

export function parseNumberText(raw: string, kind: NumberKind, locale: Locale): number | null {
  switch (kind) {
    case "money":
      return parseMoneyInput(raw, locale);
    case "percent":
      return parseDecimal(raw.trim().replace(PERCENT_SIGN, ""), locale);
    case "number":
      return parseDecimal(raw, locale);
    case "integer": {
      const value = parseDecimal(raw, locale);
      return value !== null && Number.isInteger(value) ? value : null;
    }
  }
}

function messagesFor(rule: NumberRule): Omit<FieldMessages, "required"> {
  return rule.messages ?? GENERIC_MESSAGES[rule.kind];
}

function inRange(value: number, rule: NumberRule): CheckedNumber {
  if (value >= rule.min && value <= rule.max) return { ok: true, value };
  return {
    ok: false,
    error: { key: messagesFor(rule).range, values: { min: rule.min, max: rule.max } },
  };
}

export function checkNumber(raw: string, rule: NumberRule, locale: Locale): CheckedNumber {
  if (raw.trim() === "") {
    if (rule.messages !== undefined) return { ok: false, error: { key: rule.messages.required } };
    return inRange(0, rule);
  }
  const value = parseNumberText(raw, rule.kind, locale);
  if (value === null) return { ok: false, error: { key: messagesFor(rule).invalid } };
  return inRange(value, rule);
}

export function checkedValue(checked: CheckedNumber): number | null {
  return checked.ok ? checked.value : null;
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function numberText(value: number, locale: Locale): string {
  return formatNumber(value, locale);
}

export function moneyText(value: number, locale: Locale): string {
  return numberText(value, locale);
}

const plainFormatters = new Map<Locale, Intl.NumberFormat>();

function plainFormatter(locale: Locale): Intl.NumberFormat {
  let formatter = plainFormatters.get(locale);
  if (formatter === undefined) {
    formatter = new Intl.NumberFormat(BCP47_TAG[locale], {
      useGrouping: false,
      maximumFractionDigits: 6,
    });
    plainFormatters.set(locale, formatter);
  }
  return formatter;
}

export function plainNumberText(value: number, locale: Locale): string {
  return plainFormatter(locale).format(value);
}

export function percentText(rate: number, locale: Locale): string {
  return plainNumberText(roundTo(rate * 100, 4), locale);
}

export function rateFromPercent(percent: number): number {
  return roundTo(percent / 100, 6);
}

export function isOneOf<T extends string | number>(
  value: unknown,
  options: readonly T[],
): value is T {
  return (options as readonly unknown[]).includes(value);
}
