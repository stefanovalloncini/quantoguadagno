import type { Locale } from "@/i18n/locales.ts";
import { moneyText, percentText } from "@/islands/home/fields.ts";
import {
  DEFAULT_CONTRACT_TYPE,
  DEFAULT_MUNICIPAL_RATE,
  DEFAULT_PAYMENT_FREQUENCY,
  DEFAULT_REGION,
  DEFAULT_YEAR,
} from "@/islands/home/choices.ts";
import {
  queryComune,
  queryCompanySize,
  queryContractType,
  queryFlag,
  queryPaymentFrequency,
  queryPositiveWholeNumber,
  queryRate,
  queryRegion,
  queryYear,
  rateTextParam,
  wholeNumberParam,
} from "@/islands/home/queryReaders.ts";
import { writeQuery, type QueryValues } from "@/islands/runtime/query.ts";
import type { UrlStateConfig } from "@/islands/runtime/useUrlState.ts";
import { INVERSE_PARAMS } from "@/queryParams.ts";
import {
  DEFAULT_TARGET_NET_ANNUAL,
  inverseDefaults,
  TARGET_NET_ANNUAL_RULE,
  type InverseState,
} from "./state.ts";

export function inverseFromQuery(
  values: QueryValues,
  initial: InverseState,
  locale: Locale,
): InverseState {
  const target = queryPositiveWholeNumber(values.n, TARGET_NET_ANNUAL_RULE.max);
  const year = queryYear(values.y);
  const region = queryRegion(values.r);
  const comune = queryComune(values.k);
  const municipalRate = queryRate(values.c);
  const paymentFrequency = queryPaymentFrequency(values.m);
  const contractType = queryContractType(values.t);
  const companySize = queryCompanySize(values.a);
  const isPublicEmployee = queryFlag(values.p);
  return {
    ...initial,
    ...(target === null ? {} : { targetNetAnnual: moneyText(target, locale) }),
    ...(year === null ? {} : { year }),
    ...(region === null ? {} : { region }),
    ...(comune === null ? {} : { comune }),
    ...(municipalRate === null ? {} : { municipalRate: percentText(municipalRate, locale) }),
    ...(paymentFrequency === null ? {} : { paymentFrequency }),
    ...(contractType === null ? {} : { contractType }),
    ...(companySize === null ? {} : { companySize }),
    ...(isPublicEmployee === null ? {} : { isPublicEmployee }),
  };
}

export function inverseToQuery(state: InverseState, locale: Locale): QueryValues {
  return {
    n: wholeNumberParam(
      state.targetNetAnnual,
      "money",
      locale,
      DEFAULT_TARGET_NET_ANNUAL,
      TARGET_NET_ANNUAL_RULE.max,
    ),
    y: state.year === DEFAULT_YEAR ? undefined : String(state.year),
    r: state.region === DEFAULT_REGION ? undefined : state.region,
    k: state.comune ?? undefined,
    c: rateTextParam(state.municipalRate, locale, DEFAULT_MUNICIPAL_RATE),
    m:
      state.paymentFrequency === DEFAULT_PAYMENT_FREQUENCY
        ? undefined
        : String(state.paymentFrequency),
    t: state.contractType === DEFAULT_CONTRACT_TYPE ? undefined : state.contractType,
    a: state.companySize === "large" ? "1" : undefined,
    p: state.isPublicEmployee ? "1" : undefined,
  };
}

export function inverseQueryString(state: InverseState, locale: Locale): string {
  return writeQuery(inverseToQuery(state, locale), INVERSE_PARAMS);
}

const urlStates = new Map<Locale, UrlStateConfig<InverseState>>();

export function inverseUrlState(locale: Locale): UrlStateConfig<InverseState> {
  let config = urlStates.get(locale);
  if (config === undefined) {
    config = {
      params: INVERSE_PARAMS,
      initial: inverseDefaults(locale),
      fromQuery: (values, initial) => inverseFromQuery(values, initial, locale),
      toQuery: (state) => inverseToQuery(state, locale),
    };
    urlStates.set(locale, config);
  }
  return config;
}
