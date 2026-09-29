import { useCallback, useMemo } from "react";
import type { ApprenticeshipBreakdown } from "@/domain/index.ts";
import type { Locale } from "@/i18n/locales.ts";
import { useLocale } from "@/i18n/react.tsx";
import type { FormControlValue } from "@/islands/runtime/formControls.ts";
import { useUrlState, type UrlStateConfig } from "@/islands/runtime/useUrlState.ts";
import { APPRENTICESHIP_PARAMS } from "@/queryParams.ts";
import { computeApprenticeship } from "./compute.ts";
import { deriveApprenticeship, type ApprenticeshipDerived } from "./derive.ts";
import {
  apprenticeshipDefaults,
  updateTargetGrossAnnual,
  updateYears,
  validateApprenticeship,
  type ApprenticeshipFieldErrors,
  type ApprenticeshipState,
} from "./state.ts";
import { fromQuery, toQuery } from "./url.ts";

const urlStates = new Map<Locale, UrlStateConfig<ApprenticeshipState>>();

function urlStateFor(locale: Locale): UrlStateConfig<ApprenticeshipState> {
  let config = urlStates.get(locale);
  if (config === undefined) {
    config = {
      params: APPRENTICESHIP_PARAMS,
      initial: apprenticeshipDefaults(locale),
      fromQuery: (values, initial) => fromQuery(values, initial, locale),
      toQuery: (state) => toQuery(state, locale),
    };
    urlStates.set(locale, config);
  }
  return config;
}

export interface ApprenticeshipController {
  readonly state: ApprenticeshipState;
  readonly errors: ApprenticeshipFieldErrors;
  readonly result: ApprenticeshipBreakdown;
  readonly derived: ApprenticeshipDerived;
  readonly updateTargetGrossAnnual: (raw: string) => void;
  readonly updateYears: (years: number) => void;
  readonly reset: () => void;
  readonly adoptField: (name: string, raw: FormControlValue) => void;
}

export function useApprenticeshipController(): ApprenticeshipController {
  const locale = useLocale();
  const [state, setState] = useUrlState(urlStateFor(locale));

  const errors = useMemo(() => validateApprenticeship(state, locale), [state, locale]);
  const result = useMemo(() => computeApprenticeship(state, locale), [state, locale]);
  const derived = useMemo(() => deriveApprenticeship(result), [result]);

  const handleTargetGrossAnnual = useCallback(
    (raw: string) => {
      setState((current) => updateTargetGrossAnnual(current, raw));
    },
    [setState],
  );

  const handleYears = useCallback(
    (years: number) => {
      setState((current) => updateYears(current, years));
    },
    [setState],
  );

  const reset = useCallback(() => {
    setState(apprenticeshipDefaults(locale));
  }, [setState, locale]);

  const adoptField = useCallback(
    (name: string, raw: FormControlValue) => {
      if (typeof raw !== "string") return;
      setState((current) => {
        if (name === "targetGrossAnnual") return updateTargetGrossAnnual(current, raw);
        if (name === "years") {
          const years = Number(raw);
          return Number.isFinite(years) ? updateYears(current, years) : current;
        }
        return current;
      });
    },
    [setState],
  );

  return {
    state,
    errors,
    result,
    derived,
    updateTargetGrossAnnual: handleTargetGrossAnnual,
    updateYears: handleYears,
    reset,
    adoptField,
  };
}
