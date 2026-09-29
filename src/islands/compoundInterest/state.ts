import type { Locale } from "@/i18n/locales.ts";
import type { MessageKey } from "@/i18n/messages/compoundInterest/it.ts";
import type { FieldError } from "@/islands/home/fields.ts";
import { parseDecimal, parseMoneyInput } from "@/i18n/numbers.ts";
import type { CompoundingFrequency, ContributionFrequency } from "@/domain/compoundInterest.ts";

export interface CompoundInterestState {
  readonly principal: number;
  readonly annualRate: number;
  readonly years: number;
  readonly contribution: number;
  readonly contributionFrequency: ContributionFrequency;
  readonly compoundingFrequency: CompoundingFrequency;
  readonly inflationRate: number;
}

export const DEFAULT_STATE: CompoundInterestState = {
  principal: 10_000,
  annualRate: 0.05,
  years: 20,
  contribution: 200,
  contributionFrequency: "monthly",
  compoundingFrequency: "monthly",
  inflationRate: 0.02,
};

export const MAX_PRINCIPAL = 10_000_000;
export const MAX_CONTRIBUTION = 1_000_000;
export const MIN_YEARS = 1;
export const MAX_YEARS = 60;
export const MAX_ANNUAL_RATE = 0.5;
export const MAX_INFLATION_RATE = 0.2;

const CONTRIBUTION_FREQUENCIES: readonly ContributionFrequency[] = ["monthly", "yearly", "none"];
const COMPOUNDING_FREQUENCIES: readonly CompoundingFrequency[] = ["annually", "monthly", "daily"];

export function isContributionFrequency(value: string): value is ContributionFrequency {
  return (CONTRIBUTION_FREQUENCIES as readonly string[]).includes(value);
}

export function isCompoundingFrequency(value: string): value is CompoundingFrequency {
  return (COMPOUNDING_FREQUENCIES as readonly string[]).includes(value);
}

export function updatePrincipal(
  state: CompoundInterestState,
  value: number,
): CompoundInterestState {
  return { ...state, principal: value };
}

export function updateAnnualRate(
  state: CompoundInterestState,
  value: number,
): CompoundInterestState {
  return { ...state, annualRate: value };
}

export function updateYears(state: CompoundInterestState, value: number): CompoundInterestState {
  return { ...state, years: value };
}

export function updateContribution(
  state: CompoundInterestState,
  value: number,
): CompoundInterestState {
  return { ...state, contribution: value };
}

export function updateContributionFrequency(
  state: CompoundInterestState,
  value: ContributionFrequency,
): CompoundInterestState {
  return { ...state, contributionFrequency: value };
}

export function updateCompoundingFrequency(
  state: CompoundInterestState,
  value: CompoundingFrequency,
): CompoundInterestState {
  return { ...state, compoundingFrequency: value };
}

export function updateInflationRate(
  state: CompoundInterestState,
  value: number,
): CompoundInterestState {
  return { ...state, inflationRate: value };
}

export type CompoundInterestField =
  | "principal"
  | "annualRate"
  | "years"
  | "contribution"
  | "contributionFrequency"
  | "compoundingFrequency"
  | "inflationRate";

export type CompoundInterestErrorValue = MessageKey | FieldError;

export type CompoundInterestErrors = Partial<
  Record<CompoundInterestField, CompoundInterestErrorValue>
>;

export function validate(state: CompoundInterestState): CompoundInterestErrors {
  const errors: Partial<Record<CompoundInterestField, CompoundInterestErrorValue>> = {};

  if (!Number.isFinite(state.principal) || state.principal < 0 || state.principal > MAX_PRINCIPAL) {
    errors.principal = {
      key: "field.error.moneyRange",
      values: { min: 0, max: MAX_PRINCIPAL },
    };
  }

  if (
    !Number.isFinite(state.annualRate) ||
    state.annualRate < 0 ||
    state.annualRate > MAX_ANNUAL_RATE
  ) {
    errors.annualRate = {
      key: "field.error.percentRange",
      values: { min: 0, max: MAX_ANNUAL_RATE * 100 },
    };
  }

  if (!Number.isInteger(state.years) || state.years < MIN_YEARS || state.years > MAX_YEARS) {
    errors.years = { key: "field.error.integerRange", values: { min: MIN_YEARS, max: MAX_YEARS } };
  }

  if (
    !Number.isFinite(state.contribution) ||
    state.contribution < 0 ||
    state.contribution > MAX_CONTRIBUTION
  ) {
    errors.contribution = {
      key: "field.error.moneyRange",
      values: { min: 0, max: MAX_CONTRIBUTION },
    };
  }

  if (
    !Number.isFinite(state.inflationRate) ||
    state.inflationRate < 0 ||
    state.inflationRate > MAX_INFLATION_RATE
  ) {
    errors.inflationRate = {
      key: "field.error.percentRange",
      values: { min: 0, max: MAX_INFLATION_RATE * 100 },
    };
  }

  return errors;
}

const PERCENT_SIGN = /\s*%$/;

function parsePercentInput(raw: string, locale: Locale): number | null {
  const value = parseDecimal(raw.trim().replace(PERCENT_SIGN, ""), locale);
  return value === null ? null : value / 100;
}

export function adoptField(
  state: CompoundInterestState,
  field: string,
  raw: string,
  locale: Locale,
): CompoundInterestState {
  switch (field) {
    case "principal": {
      const value = parseMoneyInput(raw, locale);
      return value === null ? state : updatePrincipal(state, value);
    }
    case "contribution": {
      const value = parseMoneyInput(raw, locale);
      return value === null ? state : updateContribution(state, value);
    }
    case "years": {
      const value = Number(raw);
      return Number.isFinite(value) ? updateYears(state, value) : state;
    }
    case "annualRate": {
      const value = parsePercentInput(raw, locale);
      return value === null ? state : updateAnnualRate(state, value);
    }
    case "inflationRate": {
      const value = parsePercentInput(raw, locale);
      return value === null ? state : updateInflationRate(state, value);
    }
    case "contributionFrequency":
      return isContributionFrequency(raw) ? updateContributionFrequency(state, raw) : state;
    case "compoundingFrequency":
      return isCompoundingFrequency(raw) ? updateCompoundingFrequency(state, raw) : state;
    default:
      return state;
  }
}
