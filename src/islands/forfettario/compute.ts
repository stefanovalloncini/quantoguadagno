import { isSupportedYear, LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import { ACTIVITY_COEFFICIENTS } from "@/data/forfettarioActivities.ts";
import {
  calculateForfettario,
  getAutonomiConfig,
  getTaxConfig,
  type ForfettarioBreakdown,
} from "@/domain/index.ts";
import type { Locale } from "@/i18n/locales.ts";
import {
  FORFETTARIO_DEFAULTS,
  isActivityCategory,
  isGestion,
  MAX_CASSA_MANUAL_AMOUNT,
  MAX_CONCURRENT_EMPLOYEE_RAL,
  MAX_EMPLOYEE_COSTS,
  MAX_MESI_ATTIVITA,
  MAX_REVENUE,
  MAX_YEARS_OF_ACTIVITY,
  MIN_CASSA_MANUAL_AMOUNT,
  MIN_CONCURRENT_EMPLOYEE_RAL,
  MIN_EMPLOYEE_COSTS,
  MIN_MESI_ATTIVITA,
  MIN_REVENUE,
  MIN_YEARS_OF_ACTIVITY,
  parseCassaManualAmount,
  parseConcurrentEmployeeRal,
  parseEmployeeCosts,
  parseRevenue,
  type ForfettarioState,
} from "./state.ts";

function boundedMoney(value: number | null, fallback: number, min: number, max: number): number {
  const safe = value ?? fallback;
  return Math.min(Math.max(safe, min), max);
}

function boundedInteger(value: number, fallback: number, min: number, max: number): number {
  const safe = Number.isFinite(value) ? Math.round(value) : fallback;
  return Math.min(Math.max(safe, min), max);
}

export function computeForfettario(state: ForfettarioState, locale: Locale): ForfettarioBreakdown {
  const year = isSupportedYear(state.year) ? state.year : LATEST_SUPPORTED_YEAR;
  const cfg = getTaxConfig(year);
  const autonomi = getAutonomiConfig(year);
  const activity = isActivityCategory(state.activity)
    ? state.activity
    : FORFETTARIO_DEFAULTS.activity;
  const gestion = isGestion(state.gestion) ? state.gestion : FORFETTARIO_DEFAULTS.gestion;

  const revenue = boundedMoney(parseRevenue(state, locale), 0, MIN_REVENUE, MAX_REVENUE);
  const employeeCosts = boundedMoney(
    parseEmployeeCosts(state, locale),
    0,
    MIN_EMPLOYEE_COSTS,
    MAX_EMPLOYEE_COSTS,
  );
  const concurrentEmployeeRal = boundedMoney(
    parseConcurrentEmployeeRal(state, locale),
    0,
    MIN_CONCURRENT_EMPLOYEE_RAL,
    MAX_CONCURRENT_EMPLOYEE_RAL,
  );
  const cassaManualAmount = boundedMoney(
    parseCassaManualAmount(state, locale),
    0,
    MIN_CASSA_MANUAL_AMOUNT,
    MAX_CASSA_MANUAL_AMOUNT,
  );
  const yearsOfActivity = boundedInteger(
    state.yearsOfActivity,
    FORFETTARIO_DEFAULTS.yearsOfActivity,
    MIN_YEARS_OF_ACTIVITY,
    MAX_YEARS_OF_ACTIVITY,
  );
  const mesiAttivita = boundedInteger(
    state.mesiAttivita,
    FORFETTARIO_DEFAULTS.mesiAttivita,
    MIN_MESI_ATTIVITA,
    MAX_MESI_ATTIVITA,
  );

  return calculateForfettario(
    {
      revenue,
      coefficient: ACTIVITY_COEFFICIENTS[activity].coefficient,
      yearsOfActivity,
      hasOtherPension: state.hasOtherPension,
      employeeCosts,
      gestion,
      mesiAttivita,
      isConcurrentFullTimeEmployee: state.isConcurrentFullTimeEmployee,
      concurrentEmployeeRal,
      forfettarioDiscount35: state.forfettarioDiscount35,
      newRegistrantDiscount50: state.newRegistrantDiscount50,
      cassaManualAmount,
      isAnte1996: state.isAnte1996,
      autonomi,
    },
    cfg.forfettario,
    cfg.gestioneSeparata,
  );
}
