import {
  isSupportedYear,
  REGION_CODES,
  type PaymentFrequency,
  type RegionCode,
  type SupportedYear,
} from "@/data/index.ts";
import type { ContractType } from "@/domain/employerCostCalculations.ts";
import type { CompanySize } from "@/domain/inpsRates.ts";
import type { Locale } from "@/i18n/locales.ts";
import { CONTRACT_TYPES, PAYMENT_FREQUENCIES, type SalaryMode } from "./choices.ts";
import { isOneOf, parseNumberText, rateFromPercent, roundTo, type NumberKind } from "./fields.ts";
import { comuneIdOf } from "./salaryChoices.ts";

export function queryWholeNumber(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.floor(value);
}

export function queryPositiveWholeNumber(
  raw: string | undefined,
  max = Number.POSITIVE_INFINITY,
): number | null {
  const value = queryWholeNumber(raw);
  return value !== null && value > 0 && value <= max ? value : null;
}

export function queryRate(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0 || value > 100) return null;
  return rateFromPercent(value);
}

export function queryYear(raw: string | undefined): SupportedYear | null {
  if (raw === undefined) return null;
  const year = Number(raw);
  return isSupportedYear(year) ? year : null;
}

export function queryPaymentFrequency(raw: string | undefined): PaymentFrequency | null {
  if (raw === undefined) return null;
  const frequency = Number(raw);
  return isOneOf(frequency, PAYMENT_FREQUENCIES) ? frequency : null;
}

export function queryRegion(raw: string | undefined): RegionCode | null {
  return isOneOf(raw, REGION_CODES) ? raw : null;
}

export function queryContractType(raw: string | undefined): ContractType | null {
  return isOneOf(raw, CONTRACT_TYPES) ? raw : null;
}

export function queryFlag(raw: string | undefined): boolean | null {
  if (raw === "1") return true;
  if (raw === "0") return false;
  return null;
}

export function queryCompanySize(raw: string | undefined): CompanySize | null {
  const large = queryFlag(raw);
  if (large === null) return null;
  return large ? "large" : "small";
}

export function queryComune(raw: string | undefined): string | null {
  return raw === undefined ? null : comuneIdOf(raw);
}

export function queryMode(raw: string | undefined): SalaryMode | null {
  if (raw === "n") return "net";
  if (raw === "l") return "gross";
  return null;
}

export function rateParam(rate: number): string {
  return String(roundTo(rate * 100, 4));
}

export function wholeNumberParam(
  raw: string,
  kind: NumberKind,
  locale: Locale,
  fallback: number | null,
  max = Number.POSITIVE_INFINITY,
): string | undefined {
  const parsed = parseNumberText(raw, kind, locale);
  if (parsed === null) return undefined;
  const value = Math.round(parsed);
  return value > 0 && value <= max && value !== fallback ? String(value) : undefined;
}

export function rateTextParam(
  raw: string,
  locale: Locale,
  fallback?: number,
  maxPercent = 100,
): string | undefined {
  const percent = parseNumberText(raw, "percent", locale);
  if (percent === null || percent < 0 || percent > maxPercent) return undefined;
  return rateFromPercent(percent) === fallback ? undefined : rateParam(rateFromPercent(percent));
}
