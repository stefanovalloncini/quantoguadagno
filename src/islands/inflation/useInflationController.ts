import { useCallback, useMemo, useState } from "react";
import { useLocale } from "@/i18n/react.tsx";
import { computeInflation, type InflationResult } from "./compute.ts";
import {
  availableYears,
  frozenSeries,
  keepPaceRows,
  type ChartPoint,
  type KeepPaceRow,
} from "./derive.ts";
import {
  adoptField as adoptFieldState,
  DEFAULT_STATE,
  updateAmount,
  updateFromYear,
  updateToYear,
  validate,
  type InflationErrors,
  type InflationState,
} from "./state.ts";

export interface InflationDerived {
  readonly availableYears: readonly number[];
  readonly frozenSeries: readonly ChartPoint[];
  readonly keepPaceRows: readonly KeepPaceRow[];
}

export interface InflationController {
  readonly state: InflationState;
  readonly errors: InflationErrors;
  readonly result: InflationResult;
  readonly derived: InflationDerived;
  readonly updateAmount: (value: number) => void;
  readonly updateFromYear: (value: number) => void;
  readonly updateToYear: (value: number) => void;
  readonly reset: () => void;
  readonly adoptField: (name: string, raw: string) => void;
}

export function useInflationController(): InflationController {
  const locale = useLocale();
  const [state, setState] = useState<InflationState>(DEFAULT_STATE);

  const result = useMemo(() => computeInflation(state), [state]);
  const errors = useMemo(() => validate(state), [state]);
  const derived = useMemo<InflationDerived>(
    () => ({
      availableYears: availableYears(),
      frozenSeries: frozenSeries(result.frozen),
      keepPaceRows: keepPaceRows(result.keepPace),
    }),
    [result],
  );

  const adoptField = useCallback(
    (name: string, raw: string) => {
      setState((current) => adoptFieldState(current, name, raw, locale));
    },
    [locale],
  );

  return {
    state,
    errors,
    result,
    derived,
    updateAmount: useCallback((value: number) => {
      setState((current) => updateAmount(current, value));
    }, []),
    updateFromYear: useCallback((value: number) => {
      setState((current) => updateFromYear(current, value));
    }, []),
    updateToYear: useCallback((value: number) => {
      setState((current) => updateToYear(current, value));
    }, []),
    reset: useCallback(() => {
      setState(DEFAULT_STATE);
    }, []),
    adoptField,
  };
}
