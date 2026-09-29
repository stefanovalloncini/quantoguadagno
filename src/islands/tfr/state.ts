import type { Locale } from "@/i18n/locales.ts";
import { formatAmountInput, parseMoneyInput } from "@/i18n/numbers.ts";
import type { MessageKey } from "@/i18n/messages/tfr/it.ts";
import type { FieldError } from "@/islands/home/fields.ts";

export const MIN_RAL = 1;
export const MAX_RAL = 500_000;
export const MIN_YEARS = 1;
export const MAX_YEARS = 50;
export const MIN_INFLATION_RATE = 0;
export const MAX_INFLATION_RATE = 0.2;

export interface TfrState {
  readonly ral: string;
  readonly years: number;
  readonly inflationRate: number;
}

export const DEFAULT_RAL = 30_000;

export const TFR_DEFAULTS: TfrState = {
  ral: String(DEFAULT_RAL),
  years: 10,
  inflationRate: 0.02,
};

export function tfrDefaults(locale: Locale): TfrState {
  return { ...TFR_DEFAULTS, ral: formatAmountInput(DEFAULT_RAL, locale) };
}

export function parseRal(state: TfrState, locale: Locale): number | null {
  return parseMoneyInput(state.ral, locale);
}

export function updateRal(state: TfrState, raw: string): TfrState {
  return { ...state, ral: raw };
}

export function updateYears(state: TfrState, years: number): TfrState {
  return { ...state, years };
}

export function updateInflationRate(state: TfrState, inflationRate: number): TfrState {
  return { ...state, inflationRate };
}

export type TfrErrorValue = MessageKey | FieldError;

export type TfrFieldErrors = Partial<Record<keyof TfrState, TfrErrorValue>>;

export function validateTfr(state: TfrState, locale: Locale): TfrFieldErrors {
  const errors: { -readonly [K in keyof TfrFieldErrors]?: TfrErrorValue } = {};

  const ral = parseRal(state, locale);
  if (ral === null || ral < MIN_RAL || ral > MAX_RAL) {
    errors.ral = { key: "field.error.ral.range", values: { min: MIN_RAL, max: MAX_RAL } };
  }

  if (!Number.isInteger(state.years) || state.years < MIN_YEARS || state.years > MAX_YEARS) {
    errors.years = {
      key: "field.error.integerRange",
      values: { min: MIN_YEARS, max: MAX_YEARS },
    };
  }

  if (
    !Number.isFinite(state.inflationRate) ||
    state.inflationRate < MIN_INFLATION_RATE ||
    state.inflationRate > MAX_INFLATION_RATE
  ) {
    errors.inflationRate = {
      key: "field.error.percentRange",
      values: { min: MIN_INFLATION_RATE * 100, max: MAX_INFLATION_RATE * 100 },
    };
  }

  return errors;
}
