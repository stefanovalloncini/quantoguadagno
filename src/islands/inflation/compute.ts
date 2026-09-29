import {
  adjustValueAcrossYears,
  cumulativeInflation,
  frozenSalaryRealValue,
  raiseNeededToKeepPace,
  type FrozenSalary,
  type RaiseToKeepPace,
} from "@/domain/inflation.ts";
import { DEFAULT_STATE, MAX_AMOUNT, type InflationState } from "./state.ts";

export interface InflationResult {
  readonly nominal: number;
  readonly adjusted: number;
  readonly factor: number;
  readonly cumulativeRate: number;
  readonly fromYear: number;
  readonly toYear: number;
  readonly keepPace: RaiseToKeepPace | null;
  readonly frozen: FrozenSalary | null;
}

export function computeInflation(state: InflationState): InflationResult {
  const amount = Number.isFinite(state.amount)
    ? Math.min(Math.max(state.amount, 0), MAX_AMOUNT)
    : DEFAULT_STATE.amount;
  const adjusted = adjustValueAcrossYears(amount, state.fromYear, state.toYear);
  const rate = cumulativeInflation(state.fromYear, state.toYear);
  const span = state.toYear - state.fromYear;
  return {
    nominal: amount,
    adjusted: adjusted?.adjusted ?? amount,
    factor: adjusted?.factor ?? 1,
    cumulativeRate: rate ?? 0,
    fromYear: state.fromYear,
    toYear: state.toYear,
    keepPace: raiseNeededToKeepPace(amount, state.fromYear, state.toYear),
    frozen: span > 0 ? frozenSalaryRealValue(amount, state.fromYear, span) : null,
  };
}
