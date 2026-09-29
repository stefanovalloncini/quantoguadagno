import { useMemo } from "react";
import { useLocale } from "@/i18n/react.tsx";
import type { EmployeeResult } from "@/islands/home/compute.ts";
import type { EmployeeErrors, EmployeeState } from "@/islands/home/state.ts";
import { lookedUpComune, useComuni, type ComuneLookup } from "@/islands/home/useComune.ts";
import { useUrlState } from "@/islands/runtime/useUrlState.ts";
import { computePayslip } from "./compute.ts";
import { derivePayslip, type PayslipDerived } from "./derive.ts";
import { payslipUrlState } from "./url.ts";

export interface PrintPayslipController {
  readonly state: EmployeeState;
  readonly errors: EmployeeErrors;
  readonly result: EmployeeResult | null;
  readonly derived: PayslipDerived | null;
  readonly comune: ComuneLookup;
}

export function usePrintPayslipController(): PrintPayslipController {
  const locale = useLocale();
  const [state] = useUrlState(payslipUrlState(locale));
  const comuni = useComuni(state.region, state.comune);
  const comune = lookedUpComune(comuni.selected);
  const { errors, result } = useMemo(
    () => computePayslip(state, locale, comune),
    [state, locale, comune],
  );
  const derived = useMemo(() => (result === null ? null : derivePayslip(result)), [result]);
  return { state, errors, result, derived, comune: comuni.selected };
}
