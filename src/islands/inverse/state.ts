import type { PaymentFrequency, RegionCode, SupportedYear } from "@/data/index.ts";
import type { ContractType } from "@/domain/employerCostCalculations.ts";
import type { CompanySize } from "@/domain/inpsRates.ts";
import type { Locale } from "@/i18n/locales.ts";
import type { FormControlValue } from "@/islands/runtime/formControls.ts";
import {
  checkNumber,
  moneyText,
  percentText,
  rateFromPercent,
  type FieldError,
  type FieldMessages,
  type NumberRule,
} from "@/islands/home/fields.ts";
import {
  DEFAULT_CONTRACT_TYPE,
  DEFAULT_MUNICIPAL_RATE,
  DEFAULT_PAYMENT_FREQUENCY,
  DEFAULT_REGION,
  DEFAULT_YEAR,
  MUNICIPAL_RATE_RULE,
} from "@/islands/home/choices.ts";
import { salaryChoiceChange } from "@/islands/home/salaryChoices.ts";

export const DEFAULT_TARGET_NET_ANNUAL = 24_000;

export interface InverseState {
  readonly targetNetAnnual: string;
  readonly year: SupportedYear;
  readonly paymentFrequency: PaymentFrequency;
  readonly contractType: ContractType;
  readonly region: RegionCode;
  readonly comune: string | null;
  readonly municipalRate: string;
  readonly companySize: CompanySize;
  readonly isPublicEmployee: boolean;
}

export type InverseField = keyof InverseState;

const NET_ANNUAL_MESSAGES: FieldMessages = {
  required: "field.error.netAnnual.required",
  invalid: "field.error.netAnnual.invalid",
  range: "field.error.netAnnual.range",
};

export const TARGET_NET_ANNUAL_RULE: NumberRule = {
  kind: "money",
  min: 1,
  max: 500_000,
  messages: NET_ANNUAL_MESSAGES,
};

const defaultsByLocale = new Map<Locale, InverseState>();

export function inverseDefaults(locale: Locale): InverseState {
  let defaults = defaultsByLocale.get(locale);
  if (defaults === undefined) {
    defaults = {
      targetNetAnnual: moneyText(DEFAULT_TARGET_NET_ANNUAL, locale),
      year: DEFAULT_YEAR,
      paymentFrequency: DEFAULT_PAYMENT_FREQUENCY,
      contractType: DEFAULT_CONTRACT_TYPE,
      region: DEFAULT_REGION,
      comune: null,
      municipalRate: percentText(DEFAULT_MUNICIPAL_RATE, locale),
      companySize: "small",
      isPublicEmployee: false,
    };
    defaultsByLocale.set(locale, defaults);
  }
  return defaults;
}

export type InverseChange = {
  readonly [K in InverseField]: { readonly field: K; readonly value: InverseState[K] };
}[InverseField];

export function applyInverseChange(state: InverseState, change: InverseChange): InverseState {
  if (Object.is(state[change.field], change.value)) return state;
  if (change.field === "region") return { ...state, region: change.value, comune: null };
  return { ...state, [change.field]: change.value };
}

export function setInverseField<K extends InverseField>(
  state: InverseState,
  field: K,
  value: InverseState[K],
): InverseState {
  return applyInverseChange(state, { field, value } as InverseChange);
}

function controlChange(name: string, value: FormControlValue): InverseChange | null {
  if (name === "targetNetAnnual" || name === "municipalRate") {
    return typeof value === "string" ? { field: name, value } : null;
  }
  return salaryChoiceChange(name, value);
}

export function adoptInverseField(
  state: InverseState,
  name: string,
  value: FormControlValue,
): InverseState {
  const change = controlChange(name, value);
  return change === null ? state : applyInverseChange(state, change);
}

export interface InverseValues {
  readonly targetNetAnnual: number;
  readonly taxYear: SupportedYear;
  readonly paymentFrequency: PaymentFrequency;
  readonly contractType: ContractType;
  readonly regionCode: RegionCode;
  readonly comune: string | null;
  readonly municipalRate: number;
  readonly companySize: CompanySize;
  readonly isPublicEmployee: boolean;
}

export type InverseErrors = Readonly<Partial<Record<InverseField, FieldError>>>;

export interface InverseCheck {
  readonly values: InverseValues | null;
  readonly errors: InverseErrors;
}

function municipalRateOf(
  state: InverseState,
  locale: Locale,
): { readonly rate: number } | { readonly error: FieldError } {
  const checked = checkNumber(state.municipalRate, MUNICIPAL_RATE_RULE, locale);
  if (checked.ok) return { rate: rateFromPercent(checked.value) };
  return state.comune === null ? { error: checked.error } : { rate: DEFAULT_MUNICIPAL_RATE };
}

export function checkInverse(state: InverseState, locale: Locale): InverseCheck {
  const target = checkNumber(state.targetNetAnnual, TARGET_NET_ANNUAL_RULE, locale);
  const municipal = municipalRateOf(state, locale);
  const errors: InverseErrors = {
    ...(target.ok ? {} : { targetNetAnnual: target.error }),
    ...("error" in municipal ? { municipalRate: municipal.error } : {}),
  };
  if (!target.ok || "error" in municipal) return { values: null, errors };
  return {
    values: {
      targetNetAnnual: target.value,
      taxYear: state.year,
      paymentFrequency: state.paymentFrequency,
      contractType: state.contractType,
      regionCode: state.region,
      comune: state.comune,
      municipalRate: municipal.rate,
      companySize: state.companySize,
      isPublicEmployee: state.isPublicEmployee,
    },
    errors,
  };
}
