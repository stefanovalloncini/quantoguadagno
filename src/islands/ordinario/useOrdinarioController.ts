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
import { computeOrdinario, type OrdinarioResult } from "./compute.ts";
import {
  adoptOrdinarioField,
  checkOrdinario,
  ordinarioDefaults,
  setOrdinarioField,
  type OrdinarioErrors,
  type OrdinarioField,
  type OrdinarioState,
} from "./state.ts";
import { ordinarioUrlState } from "./url.ts";

export type OrdinarioUpdate = <K extends OrdinarioField>(
  field: K,
  value: OrdinarioState[K],
) => void;

export interface OrdinarioController {
  readonly state: OrdinarioState;
  readonly errors: OrdinarioErrors;
  readonly result: OrdinarioResult | null;
  readonly stale: boolean;
  readonly comune: ComuneLookup;
  readonly comuni: ComuniList;
  readonly update: OrdinarioUpdate;
  readonly reset: () => void;
  readonly loadComuni: () => void;
  readonly adoptField: (name: string, value: FormControlValue) => void;
}

export function useOrdinarioController(): OrdinarioController {
  const locale = useLocale();
  const [state, setState] = useUrlState(ordinarioUrlState(locale));
  const comuni = useComuni(state.region, state.comune);
  const comune = lookedUpComune(comuni.selected);

  const check = useMemo(() => checkOrdinario(state, locale), [state, locale]);
  const current = useMemo(
    () => (check.values === null ? null : computeOrdinario(check.values, comune)),
    [check.values, comune],
  );
  const { result, stale, change } = useShownResult(current, setState);

  const update = useCallback<OrdinarioUpdate>(
    (field, value) => {
      change((previous) => setOrdinarioField(previous, field, value));
    },
    [change],
  );

  const reset = useCallback(() => {
    change(() => ordinarioDefaults(locale));
  }, [change, locale]);

  const adoptField = useCallback(
    (name: string, value: FormControlValue) => {
      change((previous) => adoptOrdinarioField(previous, name, value));
    },
    [change],
  );

  return {
    state,
    errors: check.errors,
    result,
    stale,
    comune: comuni.selected,
    comuni: comuni.list,
    update,
    reset,
    loadComuni: comuni.load,
    adoptField,
  };
}
