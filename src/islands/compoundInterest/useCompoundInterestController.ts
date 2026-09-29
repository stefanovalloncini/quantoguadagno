import { useCallback, useMemo, useState } from "react";
import { useLocale } from "@/i18n/react.tsx";
import type {
  CompoundingFrequency,
  CompoundInterestBreakdown,
  ContributionFrequency,
} from "@/domain/compoundInterest.ts";
import { useUrlState } from "@/islands/runtime/useUrlState.ts";
import { computeCompoundInterest } from "./compute.ts";
import {
  contributionsSeries,
  nominalSeries,
  realSeries,
  visibleSchedule,
  type ChartPoint,
  type VisibleSchedule,
} from "./derive.ts";
import {
  adoptField as adoptFieldState,
  DEFAULT_STATE,
  updateAnnualRate,
  updateCompoundingFrequency,
  updateContribution,
  updateContributionFrequency,
  updateInflationRate,
  updatePrincipal,
  updateYears,
  validate,
  type CompoundInterestErrors,
  type CompoundInterestState,
} from "./state.ts";
import { COMPOUND_INTEREST_URL_STATE } from "./url.ts";

export interface CompoundInterestDerived {
  readonly schedule: VisibleSchedule;
  readonly nominalSeries: readonly ChartPoint[];
  readonly realSeries: readonly ChartPoint[];
  readonly contributionsSeries: readonly ChartPoint[];
}

export interface CompoundInterestController {
  readonly state: CompoundInterestState;
  readonly errors: CompoundInterestErrors;
  readonly result: CompoundInterestBreakdown;
  readonly derived: CompoundInterestDerived;
  readonly showAllYears: boolean;
  readonly setShowAllYears: (value: boolean) => void;
  readonly updatePrincipal: (value: number) => void;
  readonly updateAnnualRate: (value: number) => void;
  readonly updateYears: (value: number) => void;
  readonly updateContribution: (value: number) => void;
  readonly updateContributionFrequency: (value: ContributionFrequency) => void;
  readonly updateCompoundingFrequency: (value: CompoundingFrequency) => void;
  readonly updateInflationRate: (value: number) => void;
  readonly reset: () => void;
  readonly adoptField: (name: string, raw: string) => void;
}

export function useCompoundInterestController(): CompoundInterestController {
  const locale = useLocale();
  const [state, setState] = useUrlState(COMPOUND_INTEREST_URL_STATE);
  const [showAllYears, setShowAllYears] = useState(false);

  const result = useMemo(() => computeCompoundInterest(state), [state]);
  const errors = useMemo(() => validate(state), [state]);
  const derived = useMemo<CompoundInterestDerived>(
    () => ({
      schedule: visibleSchedule(result, showAllYears),
      nominalSeries: nominalSeries(result),
      realSeries: realSeries(result),
      contributionsSeries: contributionsSeries(result),
    }),
    [result, showAllYears],
  );

  const reset = useCallback(() => {
    setState(DEFAULT_STATE);
    setShowAllYears(false);
  }, [setState]);

  const adoptField = useCallback(
    (name: string, raw: string) => {
      setState((current) => adoptFieldState(current, name, raw, locale));
    },
    [locale, setState],
  );

  return {
    state,
    errors,
    result,
    derived,
    showAllYears,
    setShowAllYears,
    updatePrincipal: useCallback(
      (value: number) => {
        setState((current) => updatePrincipal(current, value));
      },
      [setState],
    ),
    updateAnnualRate: useCallback(
      (value: number) => {
        setState((current) => updateAnnualRate(current, value));
      },
      [setState],
    ),
    updateYears: useCallback(
      (value: number) => {
        setState((current) => updateYears(current, value));
      },
      [setState],
    ),
    updateContribution: useCallback(
      (value: number) => {
        setState((current) => updateContribution(current, value));
      },
      [setState],
    ),
    updateContributionFrequency: useCallback(
      (value: ContributionFrequency) => {
        setState((current) => updateContributionFrequency(current, value));
      },
      [setState],
    ),
    updateCompoundingFrequency: useCallback(
      (value: CompoundingFrequency) => {
        setState((current) => updateCompoundingFrequency(current, value));
      },
      [setState],
    ),
    updateInflationRate: useCallback(
      (value: number) => {
        setState((current) => updateInflationRate(current, value));
      },
      [setState],
    ),
    reset,
    adoptField,
  };
}
