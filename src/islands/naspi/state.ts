import { isSupportedYear, LATEST_SUPPORTED_YEAR, type SupportedYear } from "@/data/index.ts";
import type { Locale } from "@/i18n/locales.ts";
import { parseMoneyInput } from "@/i18n/numbers.ts";
import type { MessageKey } from "@/i18n/messages/naspi/it.ts";
import type { FieldError } from "@/islands/home/fields.ts";

export const MIN_GROSS_PAY_4_YEARS = 0;
export const MAX_GROSS_PAY_4_YEARS = 2_000_000;
export const MIN_WEEKS_CONTRIBUTION_4_YEARS = 0;
export const MAX_WEEKS_CONTRIBUTION_4_YEARS = 208;
export const MIN_AGE = 18;
export const MAX_AGE = 80;
export const MIN_WEEKS_AFTER_VOLUNTARY_RESIGNATION = 0;
export const MAX_WEEKS_AFTER_VOLUNTARY_RESIGNATION = 52;

export interface NaspiState {
  readonly grossPay4Years: string;
  readonly weeksContribution4Years: number;
  readonly age: number;
  readonly voluntaryResignationInLast12Months: boolean;
  readonly weeksAfterVoluntaryResignation: number;
  readonly year: SupportedYear;
}

export const NASPI_DEFAULTS: NaspiState = {
  grossPay4Years: "100000",
  weeksContribution4Years: 200,
  age: 40,
  voluntaryResignationInLast12Months: false,
  weeksAfterVoluntaryResignation: 0,
  year: LATEST_SUPPORTED_YEAR,
};

export function parseGrossPay4Years(state: NaspiState, locale: Locale): number | null {
  return parseMoneyInput(state.grossPay4Years, locale);
}

export function updateGrossPay4Years(state: NaspiState, raw: string): NaspiState {
  return { ...state, grossPay4Years: raw };
}

export function updateWeeksContribution4Years(state: NaspiState, weeks: number): NaspiState {
  return { ...state, weeksContribution4Years: weeks };
}

export function updateAge(state: NaspiState, age: number): NaspiState {
  return { ...state, age };
}

export function updateVoluntaryResignationInLast12Months(
  state: NaspiState,
  voluntaryResignationInLast12Months: boolean,
): NaspiState {
  return { ...state, voluntaryResignationInLast12Months };
}

export function updateWeeksAfterVoluntaryResignation(state: NaspiState, weeks: number): NaspiState {
  return { ...state, weeksAfterVoluntaryResignation: weeks };
}

export function updateYear(state: NaspiState, year: SupportedYear): NaspiState {
  return { ...state, year };
}

export type NaspiErrorValue = MessageKey | FieldError;

export type NaspiFieldErrors = Partial<Record<keyof NaspiState, NaspiErrorValue>>;

export function validateNaspi(state: NaspiState, locale: Locale): NaspiFieldErrors {
  const errors: { -readonly [K in keyof NaspiFieldErrors]?: NaspiErrorValue } = {};

  const grossPay4Years = parseGrossPay4Years(state, locale);
  if (
    grossPay4Years === null ||
    grossPay4Years < MIN_GROSS_PAY_4_YEARS ||
    grossPay4Years > MAX_GROSS_PAY_4_YEARS
  ) {
    errors.grossPay4Years = {
      key: "field.error.moneyRange",
      values: { min: MIN_GROSS_PAY_4_YEARS, max: MAX_GROSS_PAY_4_YEARS },
    };
  }

  if (
    !Number.isInteger(state.weeksContribution4Years) ||
    state.weeksContribution4Years < MIN_WEEKS_CONTRIBUTION_4_YEARS ||
    state.weeksContribution4Years > MAX_WEEKS_CONTRIBUTION_4_YEARS
  ) {
    errors.weeksContribution4Years = {
      key: "field.error.integerRange",
      values: { min: MIN_WEEKS_CONTRIBUTION_4_YEARS, max: MAX_WEEKS_CONTRIBUTION_4_YEARS },
    };
  }

  if (!Number.isInteger(state.age) || state.age < MIN_AGE || state.age > MAX_AGE) {
    errors.age = { key: "field.error.integerRange", values: { min: MIN_AGE, max: MAX_AGE } };
  }

  if (
    !Number.isInteger(state.weeksAfterVoluntaryResignation) ||
    state.weeksAfterVoluntaryResignation < MIN_WEEKS_AFTER_VOLUNTARY_RESIGNATION ||
    state.weeksAfterVoluntaryResignation > MAX_WEEKS_AFTER_VOLUNTARY_RESIGNATION
  ) {
    errors.weeksAfterVoluntaryResignation = {
      key: "field.error.integerRange",
      values: {
        min: MIN_WEEKS_AFTER_VOLUNTARY_RESIGNATION,
        max: MAX_WEEKS_AFTER_VOLUNTARY_RESIGNATION,
      },
    };
  }

  if (!isSupportedYear(state.year)) {
    errors.year = { key: "field.error.unsupportedYear" };
  }

  return errors;
}
