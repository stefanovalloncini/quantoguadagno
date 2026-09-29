import type { ComunaleRule, RegionCode, SupportedYear } from "@/data/index.ts";
import type { NaspiBreakdown } from "@/domain/index.ts";
import { formatPercent } from "@/i18n/numbers.ts";
import type { Locale } from "@/i18n/locales.ts";
import {
  estimateNaspiNet,
  firstYearGross,
  netSchedule,
  type NaspiNetEstimate,
  type NaspiSchedule,
} from "./netEstimate.ts";

export interface ChosenComune {
  readonly name: string;
  readonly rule: ComunaleRule;
  readonly ruleYear: number;
}

export interface Residence {
  readonly region: RegionCode;
  readonly comune: ChosenComune | null;
  readonly flatRate: number;
}

export interface NaspiFacts {
  readonly year: SupportedYear;
  readonly gross: number;
  readonly weeks: number;
  readonly age: number;
  readonly resigned: boolean;
  readonly weeksAfter: number;
  readonly otherIncome: number;
  readonly residence: Residence;
}

export interface NaspiOutcome {
  readonly facts: NaspiFacts;
  readonly breakdown: NaspiBreakdown;
  readonly estimate: NaspiNetEstimate | null;
  readonly schedule: NaspiSchedule | null;
}

export function naspiOutcome(facts: NaspiFacts, breakdown: NaspiBreakdown): NaspiOutcome {
  if (!breakdown.eligible || breakdown.schedule.length === 0) {
    return { facts, breakdown, estimate: null, schedule: null };
  }
  const estimate = estimateNaspiNet(firstYearGross(breakdown.schedule), facts.otherIncome, {
    year: facts.year,
    region: facts.residence.region,
    municipal: facts.residence.comune?.rule ?? facts.residence.flatRate,
  });
  return { facts, breakdown, estimate, schedule: netSchedule(breakdown.schedule, estimate) };
}

export function fullAmountMonths(breakdown: NaspiBreakdown): number {
  return Math.min(breakdown.decalageStartMonth - 1, breakdown.durationMonths);
}

const MINUS = String.fromCharCode(0x2212);

export function signedPercent(rate: number, locale: Locale, digits: number): string {
  const text = formatPercent(Math.abs(rate), locale, digits);
  const visible = Math.abs(rate) >= 0.5 * 10 ** -(digits + 2);
  return rate < 0 && visible ? `${MINUS}${text}` : text;
}

export type WholeParse = number | null;

export function parseWhole(text: string): WholeParse {
  const trimmed = text.trim();
  if (trimmed === "") return null;
  return /^\d{1,6}$/.test(trimmed) ? Number(trimmed) : Number.NaN;
}
