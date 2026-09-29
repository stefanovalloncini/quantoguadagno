import { useCallback, useMemo, useState } from "react";
import type { TfrProjection } from "@/domain/index.ts";
import { parseDecimal } from "@/i18n/numbers.ts";
import { useLocale } from "@/i18n/react.tsx";
import type { FormControlValue } from "@/islands/runtime/formControls.ts";
import { computeTfr } from "./compute.ts";
import { deriveTfr, type TfrDerived } from "./derive.ts";
import {
  tfrDefaults,
  updateInflationRate,
  updateRal,
  updateYears,
  validateTfr,
  type TfrFieldErrors,
  type TfrState,
} from "./state.ts";

export interface TfrController {
  readonly state: TfrState;
  readonly errors: TfrFieldErrors;
  readonly result: TfrProjection;
  readonly derived: TfrDerived;
  readonly showAllYears: boolean;
  readonly updateRal: (raw: string) => void;
  readonly updateYears: (years: number) => void;
  readonly updateInflationRate: (inflationRate: number) => void;
  readonly revealAllYears: () => void;
  readonly reset: () => void;
  readonly adoptField: (name: string, value: FormControlValue) => void;
}

export function useTfrController(): TfrController {
  const locale = useLocale();
  const [state, setState] = useState<TfrState>(() => tfrDefaults(locale));
  const [showAllYears, setShowAllYears] = useState(false);

  const errors = useMemo(() => validateTfr(state, locale), [state, locale]);
  const result = useMemo(() => computeTfr(state, locale), [state, locale]);
  const derived = useMemo(() => deriveTfr(result, showAllYears), [result, showAllYears]);

  const handleRal = useCallback((raw: string) => {
    setState((current) => updateRal(current, raw));
  }, []);

  const handleYears = useCallback((years: number) => {
    setState((current) => updateYears(current, years));
  }, []);

  const handleInflationRate = useCallback((inflationRate: number) => {
    setState((current) => updateInflationRate(current, inflationRate));
  }, []);

  const revealAllYears = useCallback(() => {
    setShowAllYears(true);
  }, []);

  const reset = useCallback(() => {
    setState(tfrDefaults(locale));
    setShowAllYears(false);
  }, [locale]);

  const adoptField = useCallback(
    (name: string, value: FormControlValue) => {
      if (typeof value !== "string") return;
      setState((current) => {
        if (name === "ral") return updateRal(current, value);
        if (name === "years" || name === "inflationRate") {
          const parsed = parseDecimal(value, locale);
          if (parsed === null) return current;
          return name === "years"
            ? updateYears(current, parsed)
            : updateInflationRate(current, parsed / 100);
        }
        return current;
      });
    },
    [locale],
  );

  return {
    state,
    errors,
    result,
    derived,
    showAllYears,
    updateRal: handleRal,
    updateYears: handleYears,
    updateInflationRate: handleInflationRate,
    revealAllYears,
    reset,
    adoptField,
  };
}
