import { useCallback, useMemo, useState } from "react";
import type { SupportedYear } from "@/data/index.ts";
import type { TredicesimaResult } from "@/domain/index.ts";
import { useLocale } from "@/i18n/react.tsx";
import type { FormControlValue } from "@/islands/runtime/formControls.ts";
import { computeTredicesima } from "./compute.ts";
import { deriveTredicesima, type TredicesimaDerived } from "./derive.ts";
import {
  tredicesimaDefaults,
  updateMensilita,
  updateRal,
  updateTaxYear,
  validateTredicesima,
  type TredicesimaFieldErrors,
  type TredicesimaState,
} from "./state.ts";

export interface TredicesimaController {
  readonly state: TredicesimaState;
  readonly errors: TredicesimaFieldErrors;
  readonly result: TredicesimaResult;
  readonly derived: TredicesimaDerived;
  readonly updateRal: (raw: string) => void;
  readonly updateMensilita: (mensilita: 13 | 14) => void;
  readonly updateTaxYear: (taxYear: SupportedYear) => void;
  readonly reset: () => void;
  readonly adoptField: (name: string, value: FormControlValue) => void;
}

export function useTredicesimaController(): TredicesimaController {
  const locale = useLocale();
  const [state, setState] = useState<TredicesimaState>(() => tredicesimaDefaults(locale));

  const errors = useMemo(() => validateTredicesima(state, locale), [state, locale]);
  const result = useMemo(() => computeTredicesima(state, locale), [state, locale]);
  const derived = useMemo(() => deriveTredicesima(result), [result]);

  const handleRal = useCallback((raw: string) => {
    setState((current) => updateRal(current, raw));
  }, []);

  const handleMensilita = useCallback((mensilita: 13 | 14) => {
    setState((current) => updateMensilita(current, mensilita));
  }, []);

  const handleTaxYear = useCallback((taxYear: SupportedYear) => {
    setState((current) => updateTaxYear(current, taxYear));
  }, []);

  const reset = useCallback(() => {
    setState(tredicesimaDefaults(locale));
  }, [locale]);

  const adoptField = useCallback((name: string, value: FormControlValue) => {
    if (typeof value !== "string") return;
    const raw = value;
    setState((current) => {
      if (name === "ral") return updateRal(current, raw);
      if (name === "mensilita") {
        const mensilita = Number(raw);
        return mensilita === 13 || mensilita === 14 ? updateMensilita(current, mensilita) : current;
      }
      if (name === "taxYear") {
        const taxYear = Number(raw);
        return Number.isInteger(taxYear)
          ? updateTaxYear(current, taxYear as SupportedYear)
          : current;
      }
      return current;
    });
  }, []);

  return {
    state,
    errors,
    result,
    derived,
    updateRal: handleRal,
    updateMensilita: handleMensilita,
    updateTaxYear: handleTaxYear,
    reset,
    adoptField,
  };
}
