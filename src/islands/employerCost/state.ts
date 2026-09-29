import type { PaymentFrequency, RegionCode, SupportedYear } from "@/data/index.ts";
import type { ContractType } from "@/domain/employerCostCalculations.ts";
import type { Locale } from "@/i18n/locales.ts";
import type { FormControlValue } from "@/islands/runtime/formControls.ts";
import {
  checkNumber,
  moneyText,
  percentText,
  rateFromPercent,
  type FieldError,
  type NumberRule,
} from "@/islands/home/fields.ts";
import {
  DEFAULT_CONTRACT_TYPE,
  DEFAULT_GROSS_ANNUAL,
  DEFAULT_MUNICIPAL_RATE,
  DEFAULT_PAYMENT_FREQUENCY,
  DEFAULT_REGION,
  DEFAULT_YEAR,
  MUNICIPAL_RATE_RULE,
  RAL_MESSAGES,
} from "@/islands/home/choices.ts";
import { salaryChoiceChange } from "@/islands/home/salaryChoices.ts";

export interface EmployerCostState {
  readonly gross: string;
  readonly year: SupportedYear;
  readonly contractType: ContractType;
  readonly region: RegionCode;
  readonly comune: string | null;
  readonly municipalRate: string;
  readonly paymentFrequency: PaymentFrequency;
}

export type EmployerCostField = keyof EmployerCostState;

export const EMPLOYER_COST_GROSS_RULE: NumberRule = {
  kind: "money",
  min: 1,
  max: 500_000,
  messages: RAL_MESSAGES,
};

const defaultsByLocale = new Map<Locale, EmployerCostState>();

export function employerCostDefaults(locale: Locale): EmployerCostState {
  let defaults = defaultsByLocale.get(locale);
  if (defaults === undefined) {
    defaults = {
      gross: moneyText(DEFAULT_GROSS_ANNUAL, locale),
      year: DEFAULT_YEAR,
      contractType: DEFAULT_CONTRACT_TYPE,
      region: DEFAULT_REGION,
      comune: null,
      municipalRate: percentText(DEFAULT_MUNICIPAL_RATE, locale),
      paymentFrequency: DEFAULT_PAYMENT_FREQUENCY,
    };
    defaultsByLocale.set(locale, defaults);
  }
  return defaults;
}

export function setEmployerCostField<K extends EmployerCostField>(
  state: EmployerCostState,
  field: K,
  value: EmployerCostState[K],
): EmployerCostState {
  if (Object.is(state[field], value)) return state;
  if (field === "region") return { ...state, region: value as RegionCode, comune: null };
  return { ...state, [field]: value };
}

export function adoptEmployerCostField(
  state: EmployerCostState,
  name: string,
  value: FormControlValue,
): EmployerCostState {
  if (name === "gross" || name === "municipalRate") {
    return typeof value === "string" ? setEmployerCostField(state, name, value) : state;
  }
  const change = salaryChoiceChange(name, value);
  switch (change?.field) {
    case "year":
      return setEmployerCostField(state, "year", change.value);
    case "contractType":
      return setEmployerCostField(state, "contractType", change.value);
    case "region":
      return setEmployerCostField(state, "region", change.value);
    case "comune":
      return setEmployerCostField(state, "comune", change.value);
    case "paymentFrequency":
      return setEmployerCostField(state, "paymentFrequency", change.value);
    default:
      return state;
  }
}

export interface EmployerCostValues {
  readonly grossAnnual: number;
  readonly taxYear: SupportedYear;
  readonly contractType: ContractType;
  readonly regionCode: RegionCode;
  readonly comune: string | null;
  readonly municipalRate: number;
  readonly paymentFrequency: PaymentFrequency;
}

export type EmployerCostErrors = Readonly<Partial<Record<EmployerCostField, FieldError>>>;

export interface EmployerCostCheck {
  readonly values: EmployerCostValues | null;
  readonly errors: EmployerCostErrors;
}

function municipalRateOf(
  state: EmployerCostState,
  locale: Locale,
): { readonly rate: number } | { readonly error: FieldError } {
  const checked = checkNumber(state.municipalRate, MUNICIPAL_RATE_RULE, locale);
  if (checked.ok) return { rate: rateFromPercent(checked.value) };
  return state.comune === null ? { error: checked.error } : { rate: DEFAULT_MUNICIPAL_RATE };
}

export function checkEmployerCost(state: EmployerCostState, locale: Locale): EmployerCostCheck {
  const gross = checkNumber(state.gross, EMPLOYER_COST_GROSS_RULE, locale);
  const municipal = municipalRateOf(state, locale);
  const errors: EmployerCostErrors = {
    ...(gross.ok ? {} : { gross: gross.error }),
    ...("error" in municipal ? { municipalRate: municipal.error } : {}),
  };
  if (!gross.ok || "error" in municipal) return { values: null, errors };
  return {
    values: {
      grossAnnual: gross.value,
      taxYear: state.year,
      contractType: state.contractType,
      regionCode: state.region,
      comune: state.comune,
      municipalRate: municipal.rate,
      paymentFrequency: state.paymentFrequency,
    },
    errors,
  };
}
