import { FOI_INDEX, FOI_LATEST_YEAR } from "@/data/index.ts";
import type { Locale } from "@/i18n/locales.ts";
import type { MessageKey } from "@/i18n/messages/inflation/it.ts";
import type { FieldError } from "@/islands/home/fields.ts";
import { parseMoneyInput } from "@/i18n/numbers.ts";

export interface InflationState {
  readonly amount: number;
  readonly fromYear: number;
  readonly toYear: number;
}

export const DEFAULT_STATE: InflationState = {
  amount: 1000,
  fromYear: 2015,
  toYear: FOI_LATEST_YEAR,
};

export const MAX_AMOUNT = 10_000_000;

export function isFoiYear(year: number): boolean {
  return FOI_INDEX.some((point) => point.year === year);
}

export function updateAmount(state: InflationState, value: number): InflationState {
  return { ...state, amount: value };
}

export function updateFromYear(state: InflationState, value: number): InflationState {
  return { ...state, fromYear: value };
}

export function updateToYear(state: InflationState, value: number): InflationState {
  return { ...state, toYear: value };
}

export type InflationField = "amount" | "fromYear" | "toYear";

export type InflationErrorValue = MessageKey | FieldError;

export type InflationErrors = Partial<Record<InflationField, InflationErrorValue>>;

export function validate(state: InflationState): InflationErrors {
  const errors: InflationErrors = {};

  if (!Number.isFinite(state.amount) || state.amount < 0 || state.amount > MAX_AMOUNT) {
    errors.amount = { key: "field.error.moneyRange", values: { min: 0, max: MAX_AMOUNT } };
  }

  if (!Number.isInteger(state.fromYear) || !isFoiYear(state.fromYear)) {
    errors.fromYear = "inflation.form.fromYear.error";
  }

  if (!Number.isInteger(state.toYear) || !isFoiYear(state.toYear)) {
    errors.toYear = "inflation.form.toYear.error";
  }

  return errors;
}

export function adoptField(
  state: InflationState,
  field: string,
  raw: string,
  locale: Locale,
): InflationState {
  switch (field) {
    case "amount": {
      const value = parseMoneyInput(raw, locale);
      return value === null ? state : updateAmount(state, value);
    }
    case "fromYear": {
      const value = Number(raw);
      return Number.isFinite(value) ? updateFromYear(state, value) : state;
    }
    case "toYear": {
      const value = Number(raw);
      return Number.isFinite(value) ? updateToYear(state, value) : state;
    }
    default:
      return state;
  }
}
