import {
  isSupportedYear,
  LATEST_SUPPORTED_YEAR,
  REGION_CODES,
  type PaymentFrequency,
  type RegionCode,
  type SupportedYear,
} from "@/data/index.ts";
import type { DependentsInput } from "@/domain/deductionCalculations.ts";
import type { ContractType } from "@/domain/employerCostCalculations.ts";
import type { Locale } from "@/i18n/locales.ts";
import {
  checkNumber,
  isOneOf,
  moneyText,
  percentText,
  rateFromPercent,
  type FieldError,
  type NumberRule,
} from "@/islands/home/fields.ts";
import type { EmployeeValues } from "@/islands/home/state.ts";
import type { FormControlValue } from "@/islands/runtime/formControls.ts";

export type OfferId = "a" | "b";

export const OFFER_IDS: readonly OfferId[] = ["a", "b"];

export type Offers<T> = Readonly<Record<OfferId, T>>;

export const PAYMENT_FREQUENCIES: readonly PaymentFrequency[] = [12, 13, 14, 15, 16];
export const CONTRACT_TYPES: readonly ContractType[] = [
  "indeterminato",
  "determinato",
  "apprendistato",
];

export const DEFAULT_GROSS: Offers<number> = { a: 30_000, b: 35_000 };
export const DEFAULT_OFFER_FREQUENCY: PaymentFrequency = 13;
export const DEFAULT_YEAR: SupportedYear = LATEST_SUPPORTED_YEAR;
export const DEFAULT_REGION: RegionCode = "lombardia";
export const DEFAULT_MUNICIPAL_RATE = 0.008;
export const DEFAULT_CONTRACT_TYPE: ContractType = "indeterminato";

export interface OfferState {
  readonly gross: string;
  readonly paymentFrequency: PaymentFrequency;
}

export interface ConditionsState {
  readonly year: SupportedYear;
  readonly region: RegionCode;
  readonly comune: string | null;
  readonly municipalRate: string;
  readonly contractType: ContractType;
  readonly isPublicEmployee: boolean;
  readonly insuredBefore1996: boolean;
  readonly hasSpouse: boolean;
  readonly childrenOver21: string;
  readonly otherDependents: string;
}

export interface ComparisonState {
  readonly offers: Offers<OfferState>;
  readonly conditions: ConditionsState;
}

export type ConditionField = keyof ConditionsState;

export type ConditionUpdate = <K extends ConditionField>(
  field: K,
  value: ConditionsState[K],
) => void;

export type OfferField = keyof OfferState;

export type ComparisonField =
  "grossA" | "grossB" | "municipalRate" | "childrenOver21" | "otherDependents";

export type ComparisonErrors = Readonly<Partial<Record<ComparisonField, FieldError>>>;

export const GROSS_FIELDS: Offers<ComparisonField> = { a: "grossA", b: "grossB" };

const FREQUENCY_NAMES: Offers<string> = { a: "paymentFrequencyA", b: "paymentFrequencyB" };

export const RULES = {
  gross: {
    kind: "money",
    min: 1,
    max: 1_000_000,
    messages: {
      required: "field.error.ral.required",
      invalid: "field.error.ral.invalid",
      range: "field.error.ral.range",
    },
  },
  municipalRate: { kind: "percent", min: 0, max: 1.5 },
  dependentsCount: { kind: "integer", min: 0, max: 10 },
} as const satisfies Readonly<Record<string, NumberRule>>;

const defaultsByLocale = new Map<Locale, ComparisonState>();

export function comparisonDefaults(locale: Locale): ComparisonState {
  let defaults = defaultsByLocale.get(locale);
  if (defaults === undefined) {
    const offer = (gross: number): OfferState => ({
      gross: moneyText(gross, locale),
      paymentFrequency: DEFAULT_OFFER_FREQUENCY,
    });
    defaults = {
      offers: { a: offer(DEFAULT_GROSS.a), b: offer(DEFAULT_GROSS.b) },
      conditions: {
        year: DEFAULT_YEAR,
        region: DEFAULT_REGION,
        comune: null,
        municipalRate: percentText(DEFAULT_MUNICIPAL_RATE, locale),
        contractType: DEFAULT_CONTRACT_TYPE,
        isPublicEmployee: false,
        insuredBefore1996: false,
        hasSpouse: false,
        childrenOver21: "0",
        otherDependents: "0",
      },
    };
    defaultsByLocale.set(locale, defaults);
  }
  return defaults;
}

export function setOffer<K extends OfferField>(
  state: ComparisonState,
  id: OfferId,
  field: K,
  value: OfferState[K],
): ComparisonState {
  if (Object.is(state.offers[id][field], value)) return state;
  return {
    ...state,
    offers: { ...state.offers, [id]: { ...state.offers[id], [field]: value } },
  };
}

export function setCondition<K extends ConditionField>(
  state: ComparisonState,
  field: K,
  value: ConditionsState[K],
): ComparisonState {
  if (Object.is(state.conditions[field], value)) return state;
  const conditions = { ...state.conditions, [field]: value };
  if (field === "region") conditions.comune = null;
  return { ...state, conditions };
}

export interface ComparisonCheck {
  readonly offers: Offers<EmployeeValues | null>;
  readonly errors: ComparisonErrors;
}

function sharedValues(
  conditions: ConditionsState,
  locale: Locale,
  errors: Partial<Record<ComparisonField, FieldError>>,
): Omit<EmployeeValues, "amount" | "paymentFrequency"> | null {
  const read = (field: ComparisonField & ConditionField, rule: NumberRule): number => {
    const checked = checkNumber(conditions[field], rule, locale);
    if (checked.ok) return checked.value;
    errors[field] = checked.error;
    return 0;
  };
  const typedRate = checkNumber(conditions.municipalRate, RULES.municipalRate, locale);
  const municipalRate =
    conditions.comune === null
      ? rateFromPercent(read("municipalRate", RULES.municipalRate))
      : typedRate.ok
        ? rateFromPercent(typedRate.value)
        : DEFAULT_MUNICIPAL_RATE;
  const childrenOver21 = read("childrenOver21", RULES.dependentsCount);
  const otherDependents = read("otherDependents", RULES.dependentsCount);
  if (Object.keys(errors).length > 0) return null;
  const dependents: DependentsInput | null =
    !conditions.hasSpouse && childrenOver21 === 0 && otherDependents === 0
      ? null
      : conditions.hasSpouse
        ? { hasSpouse: true, spouseIncome: 0, childrenOver21, otherDependents }
        : { hasSpouse: false, childrenOver21, otherDependents };
  return {
    taxYear: conditions.year,
    contractType: conditions.contractType,
    regionCode: conditions.region,
    comune: conditions.comune,
    municipalRate,
    companySize: "small",
    isPublicEmployee: conditions.isPublicEmployee,
    insuredBefore1996: conditions.insuredBefore1996,
    inpsOverride: null,
    dependents,
    expenseDeductions: null,
    specialConditions: null,
    premioRisultato: null,
    fringeBenefits: null,
  };
}

export function checkComparison(state: ComparisonState, locale: Locale): ComparisonCheck {
  const errors: Partial<Record<ComparisonField, FieldError>> = {};
  const shared = sharedValues(state.conditions, locale, errors);
  const offerValues = (id: OfferId): EmployeeValues | null => {
    const offer = state.offers[id];
    const checked = checkNumber(offer.gross, RULES.gross, locale);
    if (!checked.ok) {
      errors[GROSS_FIELDS[id]] = checked.error;
      return null;
    }
    if (shared === null) return null;
    return {
      ...shared,
      amount: { mode: "gross", grossAnnual: checked.value },
      paymentFrequency: offer.paymentFrequency,
    };
  };
  const offers = { a: offerValues("a"), b: offerValues("b") };
  return { offers, errors };
}

function conditionChange(
  state: ComparisonState,
  name: string,
  value: FormControlValue,
): ComparisonState {
  switch (name) {
    case "year": {
      const year = Number(value);
      return isSupportedYear(year) ? setCondition(state, "year", year) : state;
    }
    case "region":
      return isOneOf(value, REGION_CODES) ? setCondition(state, "region", value) : state;
    case "contractType":
      return isOneOf(value, CONTRACT_TYPES) ? setCondition(state, "contractType", value) : state;
    case "municipalRate":
    case "childrenOver21":
    case "otherDependents":
      return typeof value === "string" ? setCondition(state, name, value) : state;
    case "isPublicEmployee":
    case "insuredBefore1996":
    case "hasSpouse":
      return typeof value === "boolean" ? setCondition(state, name, value) : state;
    default:
      return state;
  }
}

export function adoptField(
  state: ComparisonState,
  name: string,
  value: FormControlValue,
): ComparisonState {
  for (const id of OFFER_IDS) {
    if (name === GROSS_FIELDS[id]) {
      return typeof value === "string" ? setOffer(state, id, "gross", value) : state;
    }
    if (name === FREQUENCY_NAMES[id]) {
      const frequency = Number(value);
      return isOneOf(frequency, PAYMENT_FREQUENCIES)
        ? setOffer(state, id, "paymentFrequency", frequency)
        : state;
    }
  }
  return conditionChange(state, name, value);
}

export function frequencyName(id: OfferId): string {
  return FREQUENCY_NAMES[id];
}
