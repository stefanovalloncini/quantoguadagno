import type { Locale } from "@/i18n/locales.ts";
import { formatAmountInput, parseMoneyInput } from "@/i18n/numbers.ts";
import type { MessageKey } from "@/i18n/messages/apprenticeship/it.ts";
import type { FieldError } from "@/islands/home/fields.ts";

export const MIN_TARGET_GROSS_ANNUAL = 1;
export const MAX_TARGET_GROSS_ANNUAL = 1_000_000;
export const MIN_YEARS = 1;
export const MAX_YEARS = 5;
export const YEAR_OPTIONS: readonly number[] = [1, 2, 3, 4, 5];

export interface ApprenticeshipState {
  readonly targetGrossAnnual: string;
  readonly years: number;
}

export const DEFAULT_TARGET_GROSS_ANNUAL = 28_000;

export const APPRENTICESHIP_DEFAULTS: ApprenticeshipState = {
  targetGrossAnnual: String(DEFAULT_TARGET_GROSS_ANNUAL),
  years: 3,
};

export function apprenticeshipDefaults(locale: Locale): ApprenticeshipState {
  return {
    ...APPRENTICESHIP_DEFAULTS,
    targetGrossAnnual: formatAmountInput(DEFAULT_TARGET_GROSS_ANNUAL, locale),
  };
}

export function parseTargetGrossAnnual(state: ApprenticeshipState, locale: Locale): number | null {
  return parseMoneyInput(state.targetGrossAnnual, locale);
}

export function updateTargetGrossAnnual(
  state: ApprenticeshipState,
  raw: string,
): ApprenticeshipState {
  return { ...state, targetGrossAnnual: raw };
}

export function updateYears(state: ApprenticeshipState, years: number): ApprenticeshipState {
  return { ...state, years };
}

export type ApprenticeshipErrorValue = MessageKey | FieldError;

export type ApprenticeshipFieldErrors = Partial<
  Record<keyof ApprenticeshipState, ApprenticeshipErrorValue>
>;

export function validateApprenticeship(
  state: ApprenticeshipState,
  locale: Locale,
): ApprenticeshipFieldErrors {
  const errors: { -readonly [K in keyof ApprenticeshipFieldErrors]?: ApprenticeshipErrorValue } =
    {};

  const target = parseTargetGrossAnnual(state, locale);
  if (target === null || target < MIN_TARGET_GROSS_ANNUAL || target > MAX_TARGET_GROSS_ANNUAL) {
    errors.targetGrossAnnual = {
      key: "field.error.moneyRange",
      values: { min: MIN_TARGET_GROSS_ANNUAL, max: MAX_TARGET_GROSS_ANNUAL },
    };
  }

  if (!Number.isInteger(state.years) || state.years < MIN_YEARS || state.years > MAX_YEARS) {
    errors.years = { key: "field.error.integerRange", values: { min: MIN_YEARS, max: MAX_YEARS } };
  }

  return errors;
}
