import type { Locale } from "@/i18n/locales.ts";
import { employeeDefaults, type EmployeeState } from "@/islands/home/state.ts";
import { employeeFromQuery, employeeUrlState } from "@/islands/home/url.ts";
import { readQuery } from "@/islands/runtime/query.ts";
import type { UrlStateConfig } from "@/islands/runtime/useUrlState.ts";
import { EMPLOYEE_PARAMS } from "@/queryParams.ts";

export function payslipStateFromSearch(search: string, locale: Locale): EmployeeState {
  return employeeFromQuery(readQuery(search, EMPLOYEE_PARAMS), employeeDefaults(locale), locale);
}

export function payslipUrlState(locale: Locale): UrlStateConfig<EmployeeState> {
  return employeeUrlState(locale);
}
