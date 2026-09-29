import { useCallback, useMemo } from "react";
import { useLocale } from "@/i18n/react.tsx";
import {
  lookedUpComune,
  useComuni,
  type ComuneLookup,
  type ComuniList,
} from "@/islands/home/useComune.ts";
import { useShownResult } from "@/islands/home/useShownResult.ts";
import type { FormControlValue } from "@/islands/runtime/formControls.ts";
import { useUrlState } from "@/islands/runtime/useUrlState.ts";
import { computeEmployerCost, type EmployerCostResult } from "./compute.ts";
import { deriveEmployerCost, type EmployerCostDerived } from "./derive.ts";
import {
  adoptEmployerCostField,
  checkEmployerCost,
  employerCostDefaults,
  setEmployerCostField,
  type EmployerCostErrors,
  type EmployerCostField,
  type EmployerCostState,
} from "./state.ts";
import { employerCostUrlState } from "./url.ts";

export type EmployerCostUpdate = <K extends EmployerCostField>(
  field: K,
  value: EmployerCostState[K],
) => void;

export interface EmployerCostController {
  readonly state: EmployerCostState;
  readonly errors: EmployerCostErrors;
  readonly result: EmployerCostResult | null;
  readonly stale: boolean;
  readonly derived: EmployerCostDerived | null;
  readonly comune: ComuneLookup;
  readonly comuni: ComuniList;
  readonly update: EmployerCostUpdate;
  readonly reset: () => void;
  readonly loadComuni: () => void;
  readonly adoptField: (name: string, value: FormControlValue) => void;
}

export function useEmployerCostController(): EmployerCostController {
  const locale = useLocale();
  const [state, setState] = useUrlState(employerCostUrlState(locale));
  const comuni = useComuni(state.region, state.comune);
  const comune = lookedUpComune(comuni.selected);

  const check = useMemo(() => checkEmployerCost(state, locale), [state, locale]);
  const current = useMemo(
    () => (check.values === null ? null : computeEmployerCost(check.values, comune)),
    [check.values, comune],
  );
  const { result, stale, change } = useShownResult(current, setState);
  const derived = useMemo(() => (result === null ? null : deriveEmployerCost(result)), [result]);

  const update = useCallback<EmployerCostUpdate>(
    (field, value) => {
      change((previous) => setEmployerCostField(previous, field, value));
    },
    [change],
  );

  const reset = useCallback(() => {
    change(() => employerCostDefaults(locale));
  }, [change, locale]);

  const adoptField = useCallback(
    (name: string, value: FormControlValue) => {
      change((previous) => adoptEmployerCostField(previous, name, value));
    },
    [change],
  );

  return {
    state,
    errors: check.errors,
    result,
    stale,
    derived,
    comune: comuni.selected,
    comuni: comuni.list,
    update,
    reset,
    loadComuni: comuni.load,
    adoptField,
  };
}
