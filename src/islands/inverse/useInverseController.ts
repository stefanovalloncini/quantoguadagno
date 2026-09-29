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
import { computeInverse, type InverseResult } from "./compute.ts";
import { deriveInverse, type InverseDerived } from "./derive.ts";
import {
  adoptInverseField,
  checkInverse,
  inverseDefaults,
  setInverseField,
  type InverseErrors,
  type InverseField,
  type InverseState,
} from "./state.ts";
import { inverseUrlState } from "./url.ts";

export type InverseUpdate = <K extends InverseField>(field: K, value: InverseState[K]) => void;

export interface InverseController {
  readonly state: InverseState;
  readonly errors: InverseErrors;
  readonly result: InverseResult | null;
  readonly stale: boolean;
  readonly derived: InverseDerived | null;
  readonly comune: ComuneLookup;
  readonly comuni: ComuniList;
  readonly update: InverseUpdate;
  readonly reset: () => void;
  readonly loadComuni: () => void;
  readonly adoptField: (name: string, value: FormControlValue) => void;
}

export function useInverseController(): InverseController {
  const locale = useLocale();
  const [state, setState] = useUrlState(inverseUrlState(locale));
  const comuni = useComuni(state.region, state.comune);
  const comune = lookedUpComune(comuni.selected);

  const check = useMemo(() => checkInverse(state, locale), [state, locale]);
  const current = useMemo(
    () => (check.values === null ? null : computeInverse(check.values, comune)),
    [check.values, comune],
  );
  const { result, stale, change } = useShownResult(current, setState);
  const derived = useMemo(() => (result === null ? null : deriveInverse(result)), [result]);

  const update = useCallback<InverseUpdate>(
    (field, value) => {
      change((previous) => setInverseField(previous, field, value));
    },
    [change],
  );

  const reset = useCallback(() => {
    change(() => inverseDefaults(locale));
  }, [change, locale]);

  const adoptField = useCallback(
    (name: string, value: FormControlValue) => {
      change((previous) => adoptInverseField(previous, name, value));
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
