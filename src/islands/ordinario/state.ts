import type { RegionCode, SupportedYear } from "@/data/index.ts";
import { ACTIVITY_CATEGORIES, type ActivityCategory } from "@/data/forfettarioActivities.ts";
import type { Gestion } from "@/domain/inpsGestioni.ts";
import type { Locale } from "@/i18n/locales.ts";
import {
  DEFAULT_MUNICIPAL_RATE,
  DEFAULT_REGION,
  DEFAULT_YEAR,
  MUNICIPAL_RATE_RULE,
} from "@/islands/home/choices.ts";
import {
  checkNumber,
  isOneOf,
  moneyText,
  percentText,
  rateFromPercent,
  type FieldError,
  type NumberRule,
} from "@/islands/home/fields.ts";
import { salaryChoiceChange } from "@/islands/home/salaryChoices.ts";
import type { FormControlValue } from "@/islands/runtime/formControls.ts";

export const GESTIONS: readonly Gestion[] = [
  "gestione-separata",
  "artigiani",
  "commercianti",
  "cassa-professionale",
];

export const DEFAULT_REVENUE = 50_000;
export const DEFAULT_COSTS = 10_000;
export const DEFAULT_GESTION: Gestion = "gestione-separata";
export const FULL_YEAR = 12;

// The forfettario activity a scheme suggests until you pick one: traders sell, artisans
// fall mostly under "altre attività", the others are professionals.
const ACTIVITY_FOR_GESTION: Readonly<Record<Gestion, ActivityCategory>> = {
  "gestione-separata": "professionisti",
  artigiani: "altre-attivita",
  commercianti: "commercio",
  "cassa-professionale": "professionisti",
};

export function defaultActivityFor(gestion: Gestion): ActivityCategory {
  return ACTIVITY_FOR_GESTION[gestion];
}

export const REVENUE_RULE: NumberRule = { kind: "money", min: 0, max: 1_000_000 };
export const COSTS_RULE: NumberRule = { kind: "money", min: 0, max: 1_000_000 };
export const MONTHS_RULE: NumberRule = { kind: "integer", min: 1, max: FULL_YEAR };
export const CASSA_RULE: NumberRule = { kind: "money", min: 0, max: 100_000 };

export interface OrdinarioState {
  readonly revenue: string;
  readonly costs: string;
  readonly year: SupportedYear;
  readonly region: RegionCode;
  readonly comune: string | null;
  readonly municipalRate: string;
  readonly gestion: Gestion;
  readonly hasOtherPension: boolean;
  readonly months: string;
  readonly cassaAmount: string;
  readonly activity: ActivityCategory;
  readonly startup: boolean;
}

export type OrdinarioField = keyof OrdinarioState;

export type OrdinarioErrors = Readonly<Partial<Record<OrdinarioField, FieldError>>>;

export interface OrdinarioValues {
  readonly revenue: number;
  readonly costs: number;
  readonly taxYear: SupportedYear;
  readonly regionCode: RegionCode;
  readonly comune: string | null;
  readonly municipalRate: number;
  readonly gestion: Gestion;
  readonly hasOtherPension: boolean;
  readonly months: number;
  readonly cassaAmount: number;
  readonly activity: ActivityCategory;
  readonly startup: boolean;
}

export interface OrdinarioCheck {
  readonly values: OrdinarioValues | null;
  readonly errors: OrdinarioErrors;
}

const defaultsByLocale = new Map<Locale, OrdinarioState>();

export function ordinarioDefaults(locale: Locale): OrdinarioState {
  let defaults = defaultsByLocale.get(locale);
  if (defaults === undefined) {
    defaults = {
      revenue: moneyText(DEFAULT_REVENUE, locale),
      costs: moneyText(DEFAULT_COSTS, locale),
      year: DEFAULT_YEAR,
      region: DEFAULT_REGION,
      comune: null,
      municipalRate: percentText(DEFAULT_MUNICIPAL_RATE, locale),
      gestion: DEFAULT_GESTION,
      hasOtherPension: false,
      months: String(FULL_YEAR),
      cassaAmount: "0",
      activity: defaultActivityFor(DEFAULT_GESTION),
      startup: false,
    };
    defaultsByLocale.set(locale, defaults);
  }
  return defaults;
}

export function hasMinimum(gestion: Gestion): boolean {
  return gestion === "artigiani" || gestion === "commercianti";
}

export function setOrdinarioField<K extends OrdinarioField>(
  state: OrdinarioState,
  field: K,
  value: OrdinarioState[K],
): OrdinarioState {
  if (Object.is(state[field], value)) return state;
  if (field === "region") return { ...state, region: value as RegionCode, comune: null };
  if (field === "gestion") {
    const gestion = value as Gestion;
    const suggested = state.activity === defaultActivityFor(state.gestion);
    return {
      ...state,
      gestion,
      activity: suggested ? defaultActivityFor(gestion) : state.activity,
    };
  }
  return { ...state, [field]: value };
}

const TEXT_FIELDS = ["revenue", "costs", "municipalRate", "months", "cassaAmount"] as const;

export function adoptOrdinarioField(
  state: OrdinarioState,
  name: string,
  value: FormControlValue,
): OrdinarioState {
  if (isOneOf(name, TEXT_FIELDS)) {
    return typeof value === "string" ? setOrdinarioField(state, name, value) : state;
  }
  if (name === "hasOtherPension" || name === "startup") {
    return typeof value === "boolean" ? setOrdinarioField(state, name, value) : state;
  }
  if (name === "gestion") {
    return isOneOf(value, GESTIONS) ? setOrdinarioField(state, "gestion", value) : state;
  }
  if (name === "activity") {
    return isOneOf(value, ACTIVITY_CATEGORIES)
      ? setOrdinarioField(state, "activity", value)
      : state;
  }
  const change = salaryChoiceChange(name, value);
  switch (change?.field) {
    case "year":
      return setOrdinarioField(state, "year", change.value);
    case "region":
      return setOrdinarioField(state, "region", change.value);
    case "comune":
      return setOrdinarioField(state, "comune", change.value);
    default:
      return state;
  }
}

function municipalRateOf(
  state: OrdinarioState,
  locale: Locale,
): { readonly rate: number } | { readonly error: FieldError } {
  const checked = checkNumber(state.municipalRate, MUNICIPAL_RATE_RULE, locale);
  if (checked.ok) return { rate: rateFromPercent(checked.value) };
  return state.comune === null ? { error: checked.error } : { rate: DEFAULT_MUNICIPAL_RATE };
}

type Checked = { readonly value: number } | { readonly error: FieldError };

function checked(raw: string, rule: NumberRule, locale: Locale): Checked {
  const result = checkNumber(raw, rule, locale);
  return result.ok ? { value: result.value } : { error: result.error };
}

const UNUSED: Checked = { value: 0 };

export function isRevenueEmpty(state: OrdinarioState): boolean {
  return state.revenue.trim() === "";
}

export function checkOrdinario(state: OrdinarioState, locale: Locale): OrdinarioCheck {
  const empty = isRevenueEmpty(state);
  const fields = {
    revenue: empty ? UNUSED : checked(state.revenue, REVENUE_RULE, locale),
    costs: checked(state.costs, COSTS_RULE, locale),
    municipalRate: municipalRateOf(state, locale),
    months: hasMinimum(state.gestion)
      ? checked(state.months, MONTHS_RULE, locale)
      : { value: FULL_YEAR },
    cassaAmount:
      state.gestion === "cassa-professionale"
        ? checked(state.cassaAmount, CASSA_RULE, locale)
        : UNUSED,
  };
  const errors: Partial<Record<OrdinarioField, FieldError>> = {};
  for (const [field, outcome] of Object.entries(fields)) {
    if ("error" in outcome) errors[field as OrdinarioField] = outcome.error;
  }
  const { revenue, costs, municipalRate, months, cassaAmount } = fields;
  if (
    empty ||
    "error" in revenue ||
    "error" in costs ||
    "error" in municipalRate ||
    "error" in months ||
    "error" in cassaAmount
  ) {
    return { values: null, errors };
  }
  return {
    values: {
      revenue: revenue.value,
      costs: costs.value,
      taxYear: state.year,
      regionCode: state.region,
      comune: state.comune,
      municipalRate: municipalRate.rate,
      gestion: state.gestion,
      hasOtherPension: state.gestion === "gestione-separata" && state.hasOtherPension,
      months: months.value,
      cassaAmount: cassaAmount.value,
      activity: state.activity,
      startup: state.startup,
    },
    errors,
  };
}
