import { isSupportedYear, LATEST_SUPPORTED_YEAR, type SupportedYear } from "@/data/index.ts";
import { ACTIVITY_CATEGORIES, type ActivityCategory } from "@/data/forfettarioActivities.ts";
import type { Gestion } from "@/domain/index.ts";
import type { Locale } from "@/i18n/locales.ts";
import { formatAmountInput, parseMoneyInput } from "@/i18n/numbers.ts";
import type { MessageKey } from "@/i18n/messages/forfettario/it.ts";
import type { FieldError } from "@/islands/home/fields.ts";

export const MIN_REVENUE = 0;
export const MAX_REVENUE = 500_000;
export const MIN_EMPLOYEE_COSTS = 0;
export const MAX_EMPLOYEE_COSTS = 100_000;
export const MIN_CONCURRENT_EMPLOYEE_RAL = 0;
export const MAX_CONCURRENT_EMPLOYEE_RAL = 500_000;
export const MIN_CASSA_MANUAL_AMOUNT = 0;
export const MAX_CASSA_MANUAL_AMOUNT = 100_000;
export const MIN_YEARS_OF_ACTIVITY = 1;
export const MAX_YEARS_OF_ACTIVITY = 50;
export const MIN_MESI_ATTIVITA = 1;
export const MAX_MESI_ATTIVITA = 12;

export const GESTION_OPTIONS: readonly Gestion[] = [
  "gestione-separata",
  "artigiani",
  "commercianti",
  "cassa-professionale",
];

export interface ForfettarioState {
  readonly revenue: string;
  readonly activity: ActivityCategory;
  readonly year: SupportedYear;
  readonly yearsOfActivity: number;
  readonly hasOtherPension: boolean;
  readonly employeeCosts: string;
  readonly gestion: Gestion;
  readonly mesiAttivita: number;
  readonly isConcurrentFullTimeEmployee: boolean;
  readonly concurrentEmployeeRal: string;
  readonly forfettarioDiscount35: boolean;
  readonly newRegistrantDiscount50: boolean;
  readonly cassaManualAmount: string;
  readonly isAnte1996: boolean;
}

export const DEFAULT_REVENUE = 30_000;

export const FORFETTARIO_DEFAULTS: ForfettarioState = {
  revenue: String(DEFAULT_REVENUE),
  activity: "professionisti",
  year: LATEST_SUPPORTED_YEAR,
  yearsOfActivity: 1,
  hasOtherPension: false,
  employeeCosts: "0",
  gestion: "gestione-separata",
  mesiAttivita: 12,
  isConcurrentFullTimeEmployee: false,
  concurrentEmployeeRal: "0",
  forfettarioDiscount35: false,
  newRegistrantDiscount50: false,
  cassaManualAmount: "0",
  isAnte1996: false,
};

export function forfettarioDefaults(locale: Locale): ForfettarioState {
  return { ...FORFETTARIO_DEFAULTS, revenue: formatAmountInput(DEFAULT_REVENUE, locale) };
}

export function isGestion(value: string): value is Gestion {
  return (GESTION_OPTIONS as readonly string[]).includes(value);
}

export function isActivityCategory(value: string): value is ActivityCategory {
  return (ACTIVITY_CATEGORIES as readonly string[]).includes(value);
}

export function parseRevenue(state: ForfettarioState, locale: Locale): number | null {
  return parseMoneyInput(state.revenue, locale);
}

export function parseEmployeeCosts(state: ForfettarioState, locale: Locale): number | null {
  return parseMoneyInput(state.employeeCosts, locale);
}

export function parseConcurrentEmployeeRal(state: ForfettarioState, locale: Locale): number | null {
  return parseMoneyInput(state.concurrentEmployeeRal, locale);
}

export function parseCassaManualAmount(state: ForfettarioState, locale: Locale): number | null {
  return parseMoneyInput(state.cassaManualAmount, locale);
}

export function updateRevenue(state: ForfettarioState, raw: string): ForfettarioState {
  return { ...state, revenue: raw };
}

export function updateActivity(
  state: ForfettarioState,
  activity: ActivityCategory,
): ForfettarioState {
  return { ...state, activity };
}

export function updateYear(state: ForfettarioState, year: SupportedYear): ForfettarioState {
  return { ...state, year };
}

export function updateYearsOfActivity(
  state: ForfettarioState,
  yearsOfActivity: number,
): ForfettarioState {
  return { ...state, yearsOfActivity };
}

export function updateHasOtherPension(
  state: ForfettarioState,
  hasOtherPension: boolean,
): ForfettarioState {
  return { ...state, hasOtherPension };
}

export function updateEmployeeCosts(state: ForfettarioState, raw: string): ForfettarioState {
  return { ...state, employeeCosts: raw };
}

export function updateGestion(state: ForfettarioState, gestion: Gestion): ForfettarioState {
  return { ...state, gestion };
}

export function updateMesiAttivita(
  state: ForfettarioState,
  mesiAttivita: number,
): ForfettarioState {
  return { ...state, mesiAttivita };
}

export function updateIsConcurrentFullTimeEmployee(
  state: ForfettarioState,
  isConcurrentFullTimeEmployee: boolean,
): ForfettarioState {
  return { ...state, isConcurrentFullTimeEmployee };
}

export function updateConcurrentEmployeeRal(
  state: ForfettarioState,
  raw: string,
): ForfettarioState {
  return { ...state, concurrentEmployeeRal: raw };
}

export function updateForfettarioDiscount35(
  state: ForfettarioState,
  forfettarioDiscount35: boolean,
): ForfettarioState {
  return forfettarioDiscount35
    ? { ...state, forfettarioDiscount35: true, newRegistrantDiscount50: false }
    : { ...state, forfettarioDiscount35: false };
}

export function updateNewRegistrantDiscount50(
  state: ForfettarioState,
  newRegistrantDiscount50: boolean,
): ForfettarioState {
  return newRegistrantDiscount50
    ? { ...state, newRegistrantDiscount50: true, forfettarioDiscount35: false }
    : { ...state, newRegistrantDiscount50: false };
}

export function updateCassaManualAmount(state: ForfettarioState, raw: string): ForfettarioState {
  return { ...state, cassaManualAmount: raw };
}

export function updateIsAnte1996(state: ForfettarioState, isAnte1996: boolean): ForfettarioState {
  return { ...state, isAnte1996 };
}

export type ForfettarioErrorValue = MessageKey | FieldError;

export type ForfettarioFieldErrors = Partial<Record<keyof ForfettarioState, ForfettarioErrorValue>>;

export function validateForfettario(
  state: ForfettarioState,
  locale: Locale,
): ForfettarioFieldErrors {
  const errors: { -readonly [K in keyof ForfettarioFieldErrors]?: ForfettarioErrorValue } = {};

  const revenue = parseRevenue(state, locale);
  if (revenue === null || revenue < MIN_REVENUE || revenue > MAX_REVENUE) {
    errors.revenue = {
      key: "field.error.moneyRange",
      values: { min: MIN_REVENUE, max: MAX_REVENUE },
    };
  }

  if (!isActivityCategory(state.activity)) {
    errors.activity = "forfettario.form.activity.error";
  }

  if (!isSupportedYear(state.year)) {
    errors.year = { key: "field.error.unsupportedYear" };
  }

  if (
    !Number.isInteger(state.yearsOfActivity) ||
    state.yearsOfActivity < MIN_YEARS_OF_ACTIVITY ||
    state.yearsOfActivity > MAX_YEARS_OF_ACTIVITY
  ) {
    errors.yearsOfActivity = {
      key: "field.error.integerRange",
      values: { min: MIN_YEARS_OF_ACTIVITY, max: MAX_YEARS_OF_ACTIVITY },
    };
  }

  const employeeCosts = parseEmployeeCosts(state, locale);
  if (
    employeeCosts === null ||
    employeeCosts < MIN_EMPLOYEE_COSTS ||
    employeeCosts > MAX_EMPLOYEE_COSTS
  ) {
    errors.employeeCosts = {
      key: "field.error.moneyRange",
      values: { min: MIN_EMPLOYEE_COSTS, max: MAX_EMPLOYEE_COSTS },
    };
  }

  if (!isGestion(state.gestion)) {
    errors.gestion = "forfettario.form.gestion.error";
  }

  if (
    !Number.isInteger(state.mesiAttivita) ||
    state.mesiAttivita < MIN_MESI_ATTIVITA ||
    state.mesiAttivita > MAX_MESI_ATTIVITA
  ) {
    errors.mesiAttivita = {
      key: "field.error.integerRange",
      values: { min: MIN_MESI_ATTIVITA, max: MAX_MESI_ATTIVITA },
    };
  }

  const concurrentEmployeeRal = parseConcurrentEmployeeRal(state, locale);
  if (
    concurrentEmployeeRal === null ||
    concurrentEmployeeRal < MIN_CONCURRENT_EMPLOYEE_RAL ||
    concurrentEmployeeRal > MAX_CONCURRENT_EMPLOYEE_RAL
  ) {
    errors.concurrentEmployeeRal = {
      key: "field.error.ral.range",
      values: { min: MIN_CONCURRENT_EMPLOYEE_RAL, max: MAX_CONCURRENT_EMPLOYEE_RAL },
    };
  }

  const cassaManualAmount = parseCassaManualAmount(state, locale);
  if (
    cassaManualAmount === null ||
    cassaManualAmount < MIN_CASSA_MANUAL_AMOUNT ||
    cassaManualAmount > MAX_CASSA_MANUAL_AMOUNT
  ) {
    errors.cassaManualAmount = {
      key: "field.error.moneyRange",
      values: { min: MIN_CASSA_MANUAL_AMOUNT, max: MAX_CASSA_MANUAL_AMOUNT },
    };
  }

  return errors;
}
