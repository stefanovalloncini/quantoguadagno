import type { Locale } from "@/i18n/locales.ts";
import { moneyText, percentText } from "@/islands/home/fields.ts";
import {
  DEFAULT_CONTRACT_TYPE,
  DEFAULT_GROSS_ANNUAL,
  DEFAULT_MUNICIPAL_RATE,
  DEFAULT_PAYMENT_FREQUENCY,
  DEFAULT_REGION,
  DEFAULT_YEAR,
} from "@/islands/home/choices.ts";
import {
  queryComune,
  queryContractType,
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
import { EMPLOYER_COST_PARAMS } from "@/queryParams.ts";
import { employerCostDefaults, type EmployerCostState } from "./state.ts";

export function employerCostFromQuery(
  values: QueryValues,
  initial: EmployerCostState,
  locale: Locale,
): EmployerCostState {
  const gross = queryPositiveWholeNumber(values.l);
  const year = queryYear(values.y);
  const contractType = queryContractType(values.t);
  const region = queryRegion(values.r);
  const comune = queryComune(values.k);
  const municipalRate = queryRate(values.c);
  const paymentFrequency = queryPaymentFrequency(values.m);
  return {
    ...initial,
    ...(gross === null ? {} : { gross: moneyText(gross, locale) }),
    ...(year === null ? {} : { year }),
    ...(contractType === null ? {} : { contractType }),
    ...(region === null ? {} : { region }),
    ...(comune === null ? {} : { comune }),
    ...(municipalRate === null ? {} : { municipalRate: percentText(municipalRate, locale) }),
    ...(paymentFrequency === null ? {} : { paymentFrequency }),
  };
}

export function employerCostToQuery(state: EmployerCostState, locale: Locale): QueryValues {
  return {
    l: wholeNumberParam(state.gross, "money", locale, DEFAULT_GROSS_ANNUAL),
    y: state.year === DEFAULT_YEAR ? undefined : String(state.year),
    t: state.contractType === DEFAULT_CONTRACT_TYPE ? undefined : state.contractType,
    r: state.region === DEFAULT_REGION ? undefined : state.region,
    k: state.comune ?? undefined,
    c: rateTextParam(state.municipalRate, locale, DEFAULT_MUNICIPAL_RATE),
    m:
      state.paymentFrequency === DEFAULT_PAYMENT_FREQUENCY
        ? undefined
        : String(state.paymentFrequency),
  };
}

export function employerCostQueryString(state: EmployerCostState, locale: Locale): string {
  return writeQuery(employerCostToQuery(state, locale), EMPLOYER_COST_PARAMS);
}

const urlStates = new Map<Locale, UrlStateConfig<EmployerCostState>>();

export function employerCostUrlState(locale: Locale): UrlStateConfig<EmployerCostState> {
  let config = urlStates.get(locale);
  if (config === undefined) {
    config = {
      params: EMPLOYER_COST_PARAMS,
      initial: employerCostDefaults(locale),
      fromQuery: (values, initial) => employerCostFromQuery(values, initial, locale),
      toQuery: (state) => employerCostToQuery(state, locale),
    };
    urlStates.set(locale, config);
  }
  return config;
}
