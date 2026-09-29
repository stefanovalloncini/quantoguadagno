import type { Comune } from "@/data/index.ts";
import type { Locale } from "@/i18n/locales.ts";
import { computeEmployee, type EmployeeResult } from "@/islands/home/compute.ts";
import { checkEmployee, type EmployeeErrors, type EmployeeState } from "@/islands/home/state.ts";

export interface PayslipComputation {
  readonly errors: EmployeeErrors;
  readonly result: EmployeeResult | null;
}

export function computePayslip(
  state: EmployeeState,
  locale: Locale,
  comune: Comune | null,
): PayslipComputation {
  const { values, errors } = checkEmployee(state, locale);
  return { errors, result: values === null ? null : computeEmployee(values, comune) };
}
