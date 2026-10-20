import { ACTIVITY_CATEGORIES } from "@/data/forfettarioActivities.ts";
import type { Locale } from "@/i18n/locales.ts";
import { DEFAULT_MUNICIPAL_RATE, DEFAULT_REGION, DEFAULT_YEAR } from "@/islands/home/choices.ts";
import { isOneOf, moneyText, parseNumberText, percentText } from "@/islands/home/fields.ts";
import {
  queryComune,
  queryFlag,
  queryRate,
  queryRegion,
  queryWholeNumber,
  queryYear,
  rateTextParam,
} from "@/islands/home/queryReaders.ts";
import type { QueryValues } from "@/islands/runtime/query.ts";
import type { UrlStateConfig } from "@/islands/runtime/useUrlState.ts";
import { ORDINARIO_PARAMS } from "@/queryParams.ts";
import {
  CASSA_RULE,
  COSTS_RULE,
  DEFAULT_COSTS,
  DEFAULT_GESTION,
  DEFAULT_REVENUE,
  defaultActivityFor,
  FULL_YEAR,
  GESTIONS,
  hasMinimum,
  MONTHS_RULE,
  ordinarioDefaults,
  REVENUE_RULE,
  type OrdinarioState,
} from "./state.ts";

function queryAmount(raw: string | undefined, max: number): number | null {
  const value = queryWholeNumber(raw);
  return value !== null && value <= max ? value : null;
}

function queryMonths(raw: string | undefined): number | null {
  const value = queryWholeNumber(raw);
  return value !== null && value >= MONTHS_RULE.min && value <= MONTHS_RULE.max ? value : null;
}

function amountParam(
  raw: string,
  locale: Locale,
  fallback: number,
  max: number,
): string | undefined {
  const parsed = parseNumberText(raw, "money", locale);
  if (parsed === null) return undefined;
  const value = Math.round(parsed);
  return value >= 0 && value <= max && value !== fallback ? String(value) : undefined;
}

function flagParam(value: boolean): string | undefined {
  return value ? "1" : undefined;
}

export function ordinarioFromQuery(
  values: QueryValues,
  initial: OrdinarioState,
  locale: Locale,
): OrdinarioState {
  const revenue = queryAmount(values.f, REVENUE_RULE.max);
  const costs = queryAmount(values.s, COSTS_RULE.max);
  const year = queryYear(values.y);
  const region = queryRegion(values.r);
  const comune = queryComune(values.k);
  const municipalRate = queryRate(values.c);
  const gestion = isOneOf(values.g, GESTIONS) ? values.g : null;
  const hasOtherPension = queryFlag(values.o);
  const months = queryMonths(values.m);
  const cassaAmount = queryAmount(values.q, CASSA_RULE.max);
  const activity = isOneOf(values.a, ACTIVITY_CATEGORIES) ? values.a : null;
  const startup = queryFlag(values.n);
  return {
    ...initial,
    ...(revenue === null ? {} : { revenue: moneyText(revenue, locale) }),
    ...(costs === null ? {} : { costs: moneyText(costs, locale) }),
    ...(year === null ? {} : { year }),
    ...(region === null ? {} : { region }),
    ...(comune === null ? {} : { comune }),
    ...(municipalRate === null ? {} : { municipalRate: percentText(municipalRate, locale) }),
    ...(gestion === null ? {} : { gestion, activity: defaultActivityFor(gestion) }),
    ...(hasOtherPension === null ? {} : { hasOtherPension }),
    ...(months === null ? {} : { months: String(months) }),
    ...(cassaAmount === null ? {} : { cassaAmount: moneyText(cassaAmount, locale) }),
    ...(activity === null ? {} : { activity }),
    ...(startup === null ? {} : { startup }),
  };
}

export function ordinarioToQuery(state: OrdinarioState, locale: Locale): QueryValues {
  const months = Number(state.months);
  return {
    f: amountParam(state.revenue, locale, DEFAULT_REVENUE, REVENUE_RULE.max),
    s: amountParam(state.costs, locale, DEFAULT_COSTS, COSTS_RULE.max),
    y: state.year === DEFAULT_YEAR ? undefined : String(state.year),
    r: state.region === DEFAULT_REGION ? undefined : state.region,
    k: state.comune ?? undefined,
    c: rateTextParam(state.municipalRate, locale, DEFAULT_MUNICIPAL_RATE),
    g: state.gestion === DEFAULT_GESTION ? undefined : state.gestion,
    o: flagParam(state.gestion === "gestione-separata" && state.hasOtherPension),
    m:
      hasMinimum(state.gestion) && queryMonths(state.months) !== null && months !== FULL_YEAR
        ? String(months)
        : undefined,
    q:
      state.gestion === "cassa-professionale"
        ? amountParam(state.cassaAmount, locale, 0, CASSA_RULE.max)
        : undefined,
    a: state.activity === defaultActivityFor(state.gestion) ? undefined : state.activity,
    n: flagParam(state.startup),
  };
}

const urlStates = new Map<Locale, UrlStateConfig<OrdinarioState>>();

export function ordinarioUrlState(locale: Locale): UrlStateConfig<OrdinarioState> {
  let config = urlStates.get(locale);
  if (config === undefined) {
    config = {
      params: ORDINARIO_PARAMS,
      initial: ordinarioDefaults(locale),
      fromQuery: (values, initial) => ordinarioFromQuery(values, initial, locale),
      toQuery: (state) => ordinarioToQuery(state, locale),
    };
    urlStates.set(locale, config);
  }
  return config;
}
