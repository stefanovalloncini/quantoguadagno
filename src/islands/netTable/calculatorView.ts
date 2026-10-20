import type { Locale } from "@/i18n/locales.ts";
import { computeEmployee, type EmployeeResult } from "@/islands/home/compute.ts";
import { checkEmployee, employeeDefaults } from "@/islands/home/state.ts";
import { employeeFromQuery } from "@/islands/home/url.ts";
import { readQuery } from "@/islands/runtime/query.ts";
import { EMPLOYEE_PARAMS } from "@/queryParams.ts";
import { SITE_ORIGIN } from "@/routePaths.ts";
import { calculatorHref } from "./links.ts";
import type { AmountPage } from "./model.ts";

/**
 * The result the net salary calculator shows for the link "Calcola con i tuoi dati" of an
 * amount page. The page takes its assumptions and its ledger from it, so the two always agree.
 */
export function calculatorResult(page: AmountPage, locale: Locale): EmployeeResult {
  const href = calculatorHref(locale, page.year, page.residence, page.gross);
  const query = readQuery(new URL(href, SITE_ORIGIN).search, EMPLOYEE_PARAMS);
  const state = employeeFromQuery(query, employeeDefaults(locale), locale);
  const { values } = checkEmployee(state, locale);
  if (values === null) throw new Error(`The calculator does not accept ${href}`);
  return computeEmployee(values, page.residence.comune);
}
