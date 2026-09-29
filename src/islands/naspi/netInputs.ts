import { comunaleRuleFor, type RegionCode, type SupportedYear } from "@/data/index.ts";
import type { Locale } from "@/i18n/locales.ts";
import { parseDecimal, parseMoneyInput } from "@/i18n/numbers.ts";
import type { FieldError } from "@/islands/home/fields.ts";
import type { ComuneLookup } from "@/islands/home/useComune.ts";
import type { Residence } from "./outcome.ts";

export const DEFAULT_NASPI_REGION: RegionCode = "lombardia";
export const DEFAULT_NASPI_MUNICIPAL_RATE = 0.008;
export const MAX_OTHER_INCOME = 1_000_000;
export const MAX_MUNICIPAL_PERCENT = 2;

export interface NetInputs {
  readonly otherIncome: string;
  readonly region: RegionCode;
  readonly comune: string | null;
  readonly comuneBeforeManual: string | null;
  readonly manual: boolean;
  readonly municipalRate: string;
}

export function netDefaults(locale: Locale): NetInputs {
  return {
    otherIncome: "",
    region: DEFAULT_NASPI_REGION,
    comune: null,
    comuneBeforeManual: null,
    manual: false,
    municipalRate: locale === "it" ? "0,8" : "0.8",
  };
}

export type NetField = "otherIncome" | "municipalRate";

export interface CheckedNetInputs {
  readonly otherIncome: number;
  readonly flatRate: number;
  readonly errors: Readonly<Partial<Record<NetField, FieldError>>>;
}

function manualRate(text: string, locale: Locale): number | null {
  const percent = parseDecimal(text.trim().replace(/\s*%$/, ""), locale);
  if (percent === null || percent < 0 || percent > MAX_MUNICIPAL_PERCENT) return null;
  return percent / 100;
}

export function checkNetInputs(inputs: NetInputs, locale: Locale): CheckedNetInputs {
  const errors: Partial<Record<NetField, FieldError>> = {};
  const otherText = inputs.otherIncome.trim();
  const other = otherText === "" ? 0 : parseMoneyInput(otherText, locale);
  if (other === null || other < 0 || other > MAX_OTHER_INCOME) {
    errors.otherIncome = {
      key: "field.error.moneyRange",
      values: { min: 0, max: MAX_OTHER_INCOME },
    };
  }
  const rate = inputs.manual
    ? manualRate(inputs.municipalRate, locale)
    : DEFAULT_NASPI_MUNICIPAL_RATE;
  if (rate === null) {
    errors.municipalRate = {
      key: "field.error.percentRange",
      values: { min: 0, max: MAX_MUNICIPAL_PERCENT },
    };
  }
  return {
    otherIncome: other === null ? 0 : Math.max(0, other),
    flatRate: rate ?? DEFAULT_NASPI_MUNICIPAL_RATE,
    errors,
  };
}

export function residenceOf(
  inputs: NetInputs,
  lookup: ComuneLookup,
  flatRate: number,
  year: SupportedYear,
): Residence {
  const found = lookup.status === "ready" ? comunaleRuleFor(lookup.comune, year) : null;
  return {
    region: inputs.region,
    flatRate,
    comune:
      lookup.status === "ready" && found !== null
        ? { name: lookup.comune.name, rule: found.rule, ruleYear: found.year }
        : null,
  };
}
