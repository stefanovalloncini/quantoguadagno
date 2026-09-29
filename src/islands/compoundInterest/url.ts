import { COMPOUND_INTEREST_PARAMS } from "@/queryParams.ts";
import type { UrlStateConfig } from "@/islands/runtime/useUrlState.ts";
import type { QueryValues } from "@/islands/runtime/query.ts";
import type { CompoundingFrequency, ContributionFrequency } from "@/domain/compoundInterest.ts";
import {
  DEFAULT_STATE,
  isCompoundingFrequency,
  isContributionFrequency,
  type CompoundInterestState,
} from "./state.ts";

function readNumber(raw: string | undefined, fallback: number): number {
  if (raw === undefined) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function readEnum<T extends string>(
  raw: string | undefined,
  isValid: (value: string) => value is T,
  fallback: T,
): T {
  if (raw === undefined) return fallback;
  return isValid(raw) ? raw : fallback;
}

function roundHundredths(value: number): number {
  return Number(value.toFixed(2));
}

export function fromQuery(
  values: QueryValues,
  initial: CompoundInterestState,
): CompoundInterestState {
  return {
    principal: readNumber(values.p, initial.principal),
    annualRate: readNumber(values.r, initial.annualRate * 100) / 100,
    years: readNumber(values.y, initial.years),
    contribution: readNumber(values.c, initial.contribution),
    contributionFrequency: readEnum<ContributionFrequency>(
      values.cf,
      isContributionFrequency,
      initial.contributionFrequency,
    ),
    compoundingFrequency: readEnum<CompoundingFrequency>(
      values.f,
      isCompoundingFrequency,
      initial.compoundingFrequency,
    ),
    inflationRate: readNumber(values.i, initial.inflationRate * 100) / 100,
  };
}

export function toQuery(state: CompoundInterestState): QueryValues {
  const ratePct = roundHundredths(state.annualRate * 100);
  const defaultRatePct = roundHundredths(DEFAULT_STATE.annualRate * 100);
  const inflationPct = roundHundredths(state.inflationRate * 100);
  const defaultInflationPct = roundHundredths(DEFAULT_STATE.inflationRate * 100);

  return {
    p: state.principal !== DEFAULT_STATE.principal ? String(state.principal) : undefined,
    r: ratePct !== defaultRatePct ? String(ratePct) : undefined,
    y: state.years !== DEFAULT_STATE.years ? String(state.years) : undefined,
    c: state.contribution !== DEFAULT_STATE.contribution ? String(state.contribution) : undefined,
    cf:
      state.contributionFrequency !== DEFAULT_STATE.contributionFrequency
        ? state.contributionFrequency
        : undefined,
    f:
      state.compoundingFrequency !== DEFAULT_STATE.compoundingFrequency
        ? state.compoundingFrequency
        : undefined,
    i: inflationPct !== defaultInflationPct ? String(inflationPct) : undefined,
  };
}

export const COMPOUND_INTEREST_URL_STATE: UrlStateConfig<CompoundInterestState> = {
  params: COMPOUND_INTEREST_PARAMS,
  initial: DEFAULT_STATE,
  fromQuery,
  toQuery,
};
