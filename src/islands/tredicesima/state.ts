import { isSupportedYear, LATEST_SUPPORTED_YEAR, type SupportedYear } from "@/data/index.ts";
import type { Locale } from "@/i18n/locales.ts";
import { formatAmountInput, parseMoneyInput } from "@/i18n/numbers.ts";
import type { MessageKey } from "@/i18n/messages/tredicesima/it.ts";
import type { FieldError } from "@/islands/home/fields.ts";

export const MIN_RAL = 1;
export const MAX_RAL = 500_000;
export const MENSILITA_OPTIONS: readonly (13 | 14)[] = [13, 14];

export interface TredicesimaState {
  readonly ral: string;
  readonly mensilita: 13 | 14;
  readonly taxYear: SupportedYear;
}

export const DEFAULT_RAL = 30_000;

export const TREDICESIMA_DEFAULTS: TredicesimaState = {
  ral: String(DEFAULT_RAL),
  mensilita: 13,
  taxYear: LATEST_SUPPORTED_YEAR,
};

export function tredicesimaDefaults(locale: Locale): TredicesimaState {
  return { ...TREDICESIMA_DEFAULTS, ral: formatAmountInput(DEFAULT_RAL, locale) };
}

export function parseRal(state: TredicesimaState, locale: Locale): number | null {
  return parseMoneyInput(state.ral, locale);
}

export function updateRal(state: TredicesimaState, raw: string): TredicesimaState {
  return { ...state, ral: raw };
}

export function updateMensilita(state: TredicesimaState, mensilita: 13 | 14): TredicesimaState {
  return { ...state, mensilita };
}

export function updateTaxYear(state: TredicesimaState, taxYear: SupportedYear): TredicesimaState {
  return { ...state, taxYear };
}

export type TredicesimaErrorValue = MessageKey | FieldError;

export type TredicesimaFieldErrors = Partial<Record<keyof TredicesimaState, TredicesimaErrorValue>>;

export function validateTredicesima(
  state: TredicesimaState,
  locale: Locale,
): TredicesimaFieldErrors {
  const errors: { -readonly [K in keyof TredicesimaFieldErrors]?: TredicesimaErrorValue } = {};

  const ral = parseRal(state, locale);
  if (ral === null || ral < MIN_RAL || ral > MAX_RAL) {
    errors.ral = { key: "field.error.ral.range", values: { min: MIN_RAL, max: MAX_RAL } };
  }

  if (!MENSILITA_OPTIONS.includes(state.mensilita)) {
    errors.mensilita = "tredicesima.form.mensilita.error";
  }

  if (!isSupportedYear(state.taxYear)) {
    errors.taxYear = { key: "field.error.unsupportedYear" };
  }

  return errors;
}
