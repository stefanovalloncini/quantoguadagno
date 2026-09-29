import { useCallback, useMemo } from "react";
import { useLocale } from "@/i18n/react.tsx";
import type { FormControlValue } from "@/islands/runtime/formControls.ts";
import { useUrlState } from "@/islands/runtime/useUrlState.ts";
import { computeEmployee, type EmployeeResult } from "./compute.ts";
import {
  deriveEmployee,
  employeeHints,
  employeeLinks,
  type EmployeeDerived,
  type EmployeeHints,
  type EmployeeLinks,
} from "./derive.ts";
import {
  adoptEmployeeField,
  checkEmployee,
  employeeDefaults,
  resetGroup as resetStateGroup,
  setField,
  switchMode,
  type EmployeeErrors,
  type EmployeeField,
  type EmployeeGroup,
  type EmployeeState,
  type SalaryMode,
} from "./state.ts";
import { employeeUrlState } from "./url.ts";
import { lookedUpComune, useComuni, type ComuneLookup, type ComuniList } from "./useComune.ts";
import { useShownResult } from "./useShownResult.ts";

export type EmployeeUpdate = <K extends EmployeeField>(field: K, value: EmployeeState[K]) => void;

export interface EmployeeController {
  readonly state: EmployeeState;
  readonly errors: EmployeeErrors;
  readonly result: EmployeeResult | null;
  readonly stale: boolean;
  readonly derived: EmployeeDerived | null;
  readonly hints: EmployeeHints;
  readonly links: EmployeeLinks;
  readonly comune: ComuneLookup;
  readonly comuni: ComuniList;
  readonly update: EmployeeUpdate;
  readonly setMode: (mode: SalaryMode) => void;
  readonly resetGroup: (group: EmployeeGroup) => void;
  readonly reset: () => void;
  readonly loadComuni: () => void;
  readonly adoptField: (name: string, value: FormControlValue) => void;
}

export function useEmployeeController(): EmployeeController {
  const locale = useLocale();
  const [state, setState] = useUrlState(employeeUrlState(locale));
  const comuni = useComuni(state.region, state.comune);
  const comune = lookedUpComune(comuni.selected);

  const check = useMemo(() => checkEmployee(state, locale), [state, locale]);
  const current = useMemo(
    () => (check.values === null ? null : computeEmployee(check.values, comune)),
    [check.values, comune],
  );
  const { result, stale, change } = useShownResult(current, setState);

  const derived = useMemo(() => (result === null ? null : deriveEmployee(result)), [result]);
  const hints = useMemo(() => employeeHints(state.region, state.year), [state.region, state.year]);
  const grossAnnual = result?.input.grossAnnual ?? 0;
  const links = useMemo(
    () => employeeLinks(state, grossAnnual, locale),
    [state, grossAnnual, locale],
  );

  const update = useCallback<EmployeeUpdate>(
    (field, value) => {
      change((previous) => setField(previous, field, value));
    },
    [change],
  );

  const setMode = useCallback(
    (mode: SalaryMode) => {
      const seed =
        current === null
          ? null
          : { grossAnnual: current.input.grossAnnual, netMonthly: current.breakdown.netMonthly };
      change((previous) => switchMode(previous, mode, seed, locale));
    },
    [change, current, locale],
  );

  const resetGroup = useCallback(
    (group: EmployeeGroup) => {
      change((previous) => resetStateGroup(previous, group, locale));
    },
    [change, locale],
  );

  const reset = useCallback(() => {
    change(() => employeeDefaults(locale));
  }, [change, locale]);

  const adoptField = useCallback(
    (name: string, value: FormControlValue) => {
      change((previous) => adoptEmployeeField(previous, name, value));
    },
    [change],
  );

  return {
    state,
    errors: check.errors,
    result,
    stale,
    derived,
    hints,
    links,
    comune: comuni.selected,
    comuni: comuni.list,
    update,
    setMode,
    resetGroup,
    reset,
    loadComuni: comuni.load,
    adoptField,
  };
}
