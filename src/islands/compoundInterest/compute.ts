import {
  calculateCompoundInterest,
  type CompoundInterestBreakdown,
} from "@/domain/compoundInterest.ts";
import {
  DEFAULT_STATE,
  MAX_ANNUAL_RATE,
  MAX_CONTRIBUTION,
  MAX_INFLATION_RATE,
  MAX_PRINCIPAL,
  MAX_YEARS,
  MIN_YEARS,
  type CompoundInterestState,
} from "./state.ts";

function clamped(value: number, min: number, max: number, fallback: number): number {
  return Number.isFinite(value) ? Math.min(Math.max(value, min), max) : fallback;
}

export function computeCompoundInterest(state: CompoundInterestState): CompoundInterestBreakdown {
  return calculateCompoundInterest({
    ...state,
    principal: clamped(state.principal, 0, MAX_PRINCIPAL, DEFAULT_STATE.principal),
    annualRate: clamped(state.annualRate, 0, MAX_ANNUAL_RATE, DEFAULT_STATE.annualRate),
    years: Number.isInteger(state.years)
      ? Math.min(Math.max(state.years, MIN_YEARS), MAX_YEARS)
      : DEFAULT_STATE.years,
    contribution: clamped(state.contribution, 0, MAX_CONTRIBUTION, DEFAULT_STATE.contribution),
    inflationRate: clamped(state.inflationRate, 0, MAX_INFLATION_RATE, DEFAULT_STATE.inflationRate),
  });
}
