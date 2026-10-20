import type { SupportedYear } from "@/data/index.ts";
import type { Locale } from "@/i18n/locales.ts";
import {
  DEFAULT_CONTRACT_TYPE,
  DEFAULT_PAYMENT_FREQUENCY,
  DEFAULT_REGION,
  DEFAULT_YEAR,
} from "@/islands/home/choices.ts";
import { hrefFor, type QueryInput } from "@/routePaths.ts";
import {
  REFERENCE_FREQUENCY,
  SCENARIO_COMPANY_SIZE,
  SCENARIO_CONTRACT,
  type Residence,
} from "./model.ts";

// The calculators read the same short keys (src/queryParams.ts) and fall back to their
// defaults, so a link names only what the scenario changes.
function scenarioQuery(
  gross: number | undefined,
  year: SupportedYear,
  residence: Residence,
): QueryInput {
  return {
    l: gross,
    y: year === DEFAULT_YEAR ? undefined : year,
    r: residence.region === DEFAULT_REGION ? undefined : residence.region,
    k: residence.comuneId,
    m: REFERENCE_FREQUENCY === DEFAULT_PAYMENT_FREQUENCY ? undefined : REFERENCE_FREQUENCY,
    t: SCENARIO_CONTRACT === DEFAULT_CONTRACT_TYPE ? undefined : SCENARIO_CONTRACT,
    a: SCENARIO_COMPANY_SIZE === "large" ? 1 : undefined,
  };
}

/** The net salary calculator, filled in with the scenario and, if given, the gross. */
export function calculatorHref(
  locale: Locale,
  year: SupportedYear,
  residence: Residence,
  gross?: number,
): string {
  return hrefFor("home", locale, scenarioQuery(gross, year, residence));
}

export function employerCostHref(
  locale: Locale,
  year: SupportedYear,
  residence: Residence,
  gross: number,
): string {
  const { l, y, t, r, k, m } = scenarioQuery(gross, year, residence);
  return hrefFor("employerCost", locale, { l, y, t, r, k, m });
}
