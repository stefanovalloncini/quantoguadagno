import type { CompoundInterestBreakdown, CompoundInterestYear } from "@/domain/compoundInterest.ts";

export interface ChartPoint {
  readonly x: number;
  readonly y: number;
  readonly label: string;
}

const VISIBLE_YEARS = 10;

export interface VisibleSchedule {
  readonly rows: readonly CompoundInterestYear[];
  readonly hasMore: boolean;
}

export function visibleSchedule(
  result: CompoundInterestBreakdown,
  showAll: boolean,
): VisibleSchedule {
  const rows = showAll ? result.schedule : result.schedule.slice(0, VISIBLE_YEARS);
  return { rows, hasMore: result.schedule.length > rows.length };
}

export function nominalSeries(result: CompoundInterestBreakdown): readonly ChartPoint[] {
  return result.schedule.map((row) => ({
    x: row.year,
    y: row.nominalBalance,
    label: String(row.year),
  }));
}

export function realSeries(result: CompoundInterestBreakdown): readonly ChartPoint[] {
  return result.schedule.map((row) => ({
    x: row.year,
    y: row.realBalance,
    label: String(row.year),
  }));
}

export function contributionsSeries(result: CompoundInterestBreakdown): readonly ChartPoint[] {
  return result.schedule.map((row) => ({
    x: row.year,
    y: row.contributedSoFar,
    label: String(row.year),
  }));
}
