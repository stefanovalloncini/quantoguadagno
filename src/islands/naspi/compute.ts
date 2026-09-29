import { isSupportedYear, LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import {
  calculateNaspi,
  getNaspiConfig,
  getTaxConfig,
  type NaspiBreakdown,
} from "@/domain/index.ts";
import type { Locale } from "@/i18n/locales.ts";
import {
  MAX_AGE,
  MAX_GROSS_PAY_4_YEARS,
  MAX_WEEKS_AFTER_VOLUNTARY_RESIGNATION,
  MAX_WEEKS_CONTRIBUTION_4_YEARS,
  MIN_AGE,
  MIN_GROSS_PAY_4_YEARS,
  MIN_WEEKS_AFTER_VOLUNTARY_RESIGNATION,
  MIN_WEEKS_CONTRIBUTION_4_YEARS,
  NASPI_DEFAULTS,
  parseGrossPay4Years,
  type NaspiState,
} from "./state.ts";

function boundedInteger(value: number, fallback: number, min: number, max: number): number {
  const safe = Number.isFinite(value) ? Math.round(value) : fallback;
  return Math.min(Math.max(safe, min), max);
}

export function computeNaspi(state: NaspiState, locale: Locale): NaspiBreakdown {
  const parsedGrossPay = parseGrossPay4Years(state, locale);
  const grossPay4Years = Math.min(
    Math.max(parsedGrossPay ?? 0, MIN_GROSS_PAY_4_YEARS),
    MAX_GROSS_PAY_4_YEARS,
  );
  const weeksContribution4Years = boundedInteger(
    state.weeksContribution4Years,
    NASPI_DEFAULTS.weeksContribution4Years,
    MIN_WEEKS_CONTRIBUTION_4_YEARS,
    MAX_WEEKS_CONTRIBUTION_4_YEARS,
  );
  const age = boundedInteger(state.age, NASPI_DEFAULTS.age, MIN_AGE, MAX_AGE);
  const weeksAfterVoluntaryResignation = boundedInteger(
    state.weeksAfterVoluntaryResignation,
    NASPI_DEFAULTS.weeksAfterVoluntaryResignation,
    MIN_WEEKS_AFTER_VOLUNTARY_RESIGNATION,
    MAX_WEEKS_AFTER_VOLUNTARY_RESIGNATION,
  );
  const year = isSupportedYear(state.year) ? state.year : LATEST_SUPPORTED_YEAR;

  return calculateNaspi({
    grossPay4Years,
    weeksContribution4Years,
    age,
    voluntaryResignationInLast12Months: state.voluntaryResignationInLast12Months,
    weeksAfterVoluntaryResignation,
    config: getNaspiConfig(year),
    irpefBrackets: getTaxConfig(year).irpefBrackets,
  });
}
