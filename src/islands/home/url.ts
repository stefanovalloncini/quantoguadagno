import type { Locale } from "@/i18n/locales.ts";
import { writeQuery, type QueryValues } from "@/islands/runtime/query.ts";
import type { UrlStateConfig } from "@/islands/runtime/useUrlState.ts";
import { EMPLOYEE_PARAMS } from "@/queryParams.ts";
import {
  queryWholeNumber,
  queryPositiveWholeNumber,
  queryRate,
  queryYear,
  queryPaymentFrequency,
  queryRegion,
  queryContractType,
  queryFlag,
  queryCompanySize,
  queryComune,
  queryMode,
  rateParam,
  wholeNumberParam,
  rateTextParam,
} from "./queryReaders.ts";
import { moneyText, percentText } from "./fields.ts";
import {
  DEFAULT_CONTRACT_TYPE,
  DEFAULT_GROSS_ANNUAL,
  DEFAULT_MUNICIPAL_RATE,
  DEFAULT_PAYMENT_FREQUENCY,
  DEFAULT_REGION,
  DEFAULT_YEAR,
  EMPLOYEE_RULES,
  employeeDefaults,
  MUNICIPAL_RATE_RULE,
  type EmployeeState,
} from "./state.ts";

export {
  queryWholeNumber,
  queryPositiveWholeNumber,
  queryRate,
  queryYear,
  queryPaymentFrequency,
  queryRegion,
  queryContractType,
  queryFlag,
  queryCompanySize,
  queryComune,
  queryMode,
  rateParam,
  wholeNumberParam,
  rateTextParam,
};

export function employeeFromQuery(
  values: QueryValues,
  initial: EmployeeState,
  locale: Locale,
): EmployeeState {
  const gross = queryPositiveWholeNumber(values.l);
  const year = queryYear(values.y);
  const region = queryRegion(values.r);
  const comune = queryComune(values.k);
  const municipalRate = queryRate(values.c);
  const paymentFrequency = queryPaymentFrequency(values.m);
  const contractType = queryContractType(values.t);
  const companySize = queryCompanySize(values.a);
  const isPublicEmployee = queryFlag(values.p);
  const inpsEmployeeRate = queryRate(values.e);
  const inpsEmployerRate = queryRate(values.d);
  const mode = queryMode(values.s);
  const targetNet = queryPositiveWholeNumber(values.n, EMPLOYEE_RULES.targetNet.max);
  return {
    ...initial,
    ...(gross === null ? {} : { gross: moneyText(gross, locale) }),
    ...(year === null ? {} : { year }),
    ...(region === null ? {} : { region }),
    ...(comune === null ? {} : { comune }),
    ...(municipalRate === null ? {} : { municipalRate: percentText(municipalRate, locale) }),
    ...(paymentFrequency === null ? {} : { paymentFrequency }),
    ...(contractType === null ? {} : { contractType }),
    ...(companySize === null ? {} : { companySize }),
    ...(isPublicEmployee === null ? {} : { isPublicEmployee }),
    ...(inpsEmployeeRate === null || inpsEmployerRate === null
      ? {}
      : {
          inpsOverride: true,
          inpsEmployeeRate: percentText(inpsEmployeeRate, locale),
          inpsEmployerRate: percentText(inpsEmployerRate, locale),
        }),
    ...(mode === null ? {} : { mode }),
    ...(targetNet === null ? {} : { targetNet: moneyText(targetNet, locale) }),
  };
}

function inpsOverrideParams(state: EmployeeState, locale: Locale): QueryValues {
  if (!state.inpsOverride) return {};
  const e = rateTextParam(state.inpsEmployeeRate, locale);
  const d = rateTextParam(state.inpsEmployerRate, locale);
  return e === undefined || d === undefined ? {} : { e, d };
}

export function employeeToQuery(state: EmployeeState, locale: Locale): QueryValues {
  const net = state.mode === "net";
  return {
    l: net
      ? undefined
      : wholeNumberParam(
          state.gross,
          "money",
          locale,
          DEFAULT_GROSS_ANNUAL,
          EMPLOYEE_RULES.gross.max,
        ),
    y: state.year === DEFAULT_YEAR ? undefined : String(state.year),
    r: state.region === DEFAULT_REGION ? undefined : state.region,
    k: state.comune ?? undefined,
    c: rateTextParam(state.municipalRate, locale, DEFAULT_MUNICIPAL_RATE, MUNICIPAL_RATE_RULE.max),
    m:
      state.paymentFrequency === DEFAULT_PAYMENT_FREQUENCY
        ? undefined
        : String(state.paymentFrequency),
    t: state.contractType === DEFAULT_CONTRACT_TYPE ? undefined : state.contractType,
    a: state.companySize === "large" ? "1" : undefined,
    p: state.isPublicEmployee ? "1" : undefined,
    ...inpsOverrideParams(state, locale),
    s: net ? "n" : undefined,
    n: net
      ? wholeNumberParam(state.targetNet, "money", locale, null, EMPLOYEE_RULES.targetNet.max)
      : undefined,
  };
}

export function employeeQueryString(state: EmployeeState, locale: Locale): string {
  return writeQuery(employeeToQuery(state, locale), EMPLOYEE_PARAMS);
}

const urlStates = new Map<Locale, UrlStateConfig<EmployeeState>>();

export function employeeUrlState(locale: Locale): UrlStateConfig<EmployeeState> {
  let config = urlStates.get(locale);
  if (config === undefined) {
    config = {
      params: EMPLOYEE_PARAMS,
      initial: employeeDefaults(locale),
      fromQuery: (values, initial) => employeeFromQuery(values, initial, locale),
      toQuery: (state) => employeeToQuery(state, locale),
    };
    urlStates.set(locale, config);
  }
  return config;
}
