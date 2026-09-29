import type { SalaryBreakdown } from "@/domain/composer.ts";
import { roundTo } from "@/islands/home/fields.ts";
import type { ComparedOffers, OfferResult } from "./compute.ts";
import type { OfferId } from "./state.ts";

export const TIE_MONTHLY_LIMIT = 1;
export const MONTHS_IN_YEAR = 12;

export type ComparisonWinner = OfferId | "equal";

export interface ComparisonVerdict {
  readonly winner: ComparisonWinner;
  readonly netAnnualDelta: number;
  readonly netAnnualGap: number;
  readonly averageMonthlyGap: number;
  readonly grossGap: number;
  readonly taxesGap: number;
  readonly keptShare: number | null;
  readonly sharedNet: number;
  readonly exactTie: boolean;
}

export function averageMonthly(result: OfferResult): number {
  return roundTo(result.breakdown.netAnnual / MONTHS_IN_YEAR, 2);
}

export function otherOffer(id: OfferId): OfferId {
  return id === "a" ? "b" : "a";
}

export function verdict(offers: ComparedOffers): ComparisonVerdict {
  const netAnnualDelta = roundTo(offers.b.breakdown.netAnnual - offers.a.breakdown.netAnnual, 2);
  const tie = Math.abs(netAnnualDelta) / MONTHS_IN_YEAR < TIE_MONTHLY_LIMIT;
  const winner: ComparisonWinner = tie ? "equal" : netAnnualDelta > 0 ? "b" : "a";
  const top = offers[winner === "a" ? "a" : "b"].breakdown;
  const other = offers[winner === "a" ? "b" : "a"].breakdown;
  const netAnnualGap = Math.abs(netAnnualDelta);
  const grossGap = roundTo(top.grossAnnual - other.grossAnnual, 2);
  return {
    winner,
    netAnnualDelta,
    netAnnualGap,
    averageMonthlyGap: Math.abs(roundTo(averageMonthly(offers.b) - averageMonthly(offers.a), 2)),
    grossGap,
    taxesGap: roundTo(other.totalTaxes - top.totalTaxes, 2),
    keptShare: !tie && grossGap > 0 ? netAnnualGap / grossGap : null,
    sharedNet: roundTo((offers.a.breakdown.netAnnual + offers.b.breakdown.netAnnual) / 2, 2),
    exactTie: netAnnualDelta === 0,
  };
}

export type ComparisonRowKey =
  | "gross"
  | "inps"
  | "irpef"
  | "regional"
  | "municipal"
  | "credits"
  | "netAnnual"
  | "netMonthly"
  | "average";

export type ComparisonRowKind = "plain" | "deducted" | "credited" | "total";

export interface ComparisonRow {
  readonly key: ComparisonRowKey;
  readonly kind: ComparisonRowKind;
  readonly a: number;
  readonly b: number;
  readonly delta: number;
}

function row(key: ComparisonRowKey, kind: ComparisonRowKind, a: number, b: number): ComparisonRow {
  return { key, kind, a, b, delta: roundTo(b - a, 2) };
}

function withheld(amount: number): number {
  return amount === 0 ? 0 : -amount;
}

export function creditsOf(breakdown: SalaryBreakdown): number {
  return roundTo(
    breakdown.trattamentoIntegrativo + breakdown.sommaAggiuntiva + breakdown.pdrNet,
    2,
  );
}

export function comparisonRows(offers: ComparedOffers): readonly ComparisonRow[] {
  const a = offers.a.breakdown;
  const b = offers.b.breakdown;
  const credits = { a: creditsOf(a), b: creditsOf(b) };
  return [
    row("gross", "plain", a.grossAnnual, b.grossAnnual),
    row("inps", "deducted", withheld(a.inpsContribution), withheld(b.inpsContribution)),
    row("irpef", "deducted", withheld(a.irpefNet), withheld(b.irpefNet)),
    row("regional", "deducted", withheld(a.regionalTax), withheld(b.regionalTax)),
    row("municipal", "deducted", withheld(a.municipalTax), withheld(b.municipalTax)),
    ...(credits.a > 0 || credits.b > 0 ? [row("credits", "credited", credits.a, credits.b)] : []),
    row("netAnnual", "total", a.netAnnual, b.netAnnual),
    row("netMonthly", "plain", a.netMonthly, b.netMonthly),
    row("average", "plain", averageMonthly(offers.a), averageMonthly(offers.b)),
  ];
}
