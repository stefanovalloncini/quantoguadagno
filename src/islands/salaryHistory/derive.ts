import { foiYearOverYearRates, type AdjustedValue, type SalaryBreakdown } from "@/domain/index.ts";
import {
  adjustedValueFor,
  computeHistoryNet,
  projectSalary,
  type ProjectionYear,
} from "./compute.ts";
import { DEFAULT_ENTRY_SETTINGS, type SalaryEntry, type SalaryEntrySettings } from "./storage.ts";

export interface AdjustedEntry {
  readonly entry: SalaryEntry;
  readonly adjusted: AdjustedValue | null;
  readonly net: SalaryBreakdown | null;
}

export function adjustedRows(
  entries: readonly SalaryEntry[],
  targetYear: number,
): readonly AdjustedEntry[] {
  return entries.map((entry) => ({
    entry,
    adjusted: adjustedValueFor(entry, targetYear),
    net: computeHistoryNet(entry),
  }));
}

export function lastSettings(entries: readonly SalaryEntry[]): SalaryEntrySettings {
  const last = entries[entries.length - 1];
  return last ? last.settings : DEFAULT_ENTRY_SETTINGS;
}

export function latestSupportedEntry(rows: readonly AdjustedEntry[]): SalaryEntry | null {
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    const row = rows[i];
    if (row && row.net !== null) return row.entry;
  }
  return null;
}

export function realChangeSinceFirst(rows: readonly AdjustedEntry[]): number | null {
  const first = rows[0];
  const latest = rows[rows.length - 1];
  if (!first || !latest || !first.adjusted || !latest.adjusted || first.adjusted.adjusted <= 0) {
    return null;
  }
  return latest.adjusted.adjusted / first.adjusted.adjusted - 1;
}

const ROLLING_WINDOW = 3;
const FALLBACK_GROWTH_RATE = 0.015;

export function defaultGrowthRate(): number {
  const recent = foiYearOverYearRates().slice(-ROLLING_WINDOW);
  if (recent.length === 0) return FALLBACK_GROWTH_RATE;
  const sum = recent.reduce((acc, point) => acc + point.rate, 0);
  return sum / recent.length;
}

export interface ProjectionBundle {
  readonly expected: readonly ProjectionYear[];
  readonly low: readonly ProjectionYear[];
  readonly high: readonly ProjectionYear[];
  readonly growthRate: number;
  readonly horizonYears: number;
}

const BAND_DELTA = 0.01;

export function projectionBundle(
  baseEntry: SalaryEntry | null,
  horizonYears: number,
  growthPct: number,
): ProjectionBundle {
  const growthRate = growthPct / 100;
  if (baseEntry === null || horizonYears <= 0) {
    return { expected: [], low: [], high: [], growthRate, horizonYears };
  }
  return {
    expected: projectSalary({ baseEntry, horizonYears, growthRate }),
    low: projectSalary({ baseEntry, horizonYears, growthRate: growthRate - BAND_DELTA }),
    high: projectSalary({ baseEntry, horizonYears, growthRate: growthRate + BAND_DELTA }),
    growthRate,
    horizonYears,
  };
}

export interface ChartPoint {
  readonly x: number;
  readonly y: number;
  readonly label: string;
}

export function nominalSeries(rows: readonly AdjustedEntry[]): readonly ChartPoint[] {
  return rows.map((row) => ({
    x: row.entry.year,
    y: row.entry.grossAnnual,
    label: String(row.entry.year),
  }));
}

export function netSeries(rows: readonly AdjustedEntry[]): readonly ChartPoint[] {
  return rows
    .filter((row) => row.net !== null)
    .map((row) => ({
      x: row.entry.year,
      y: row.net ? row.net.netAnnual : 0,
      label: String(row.entry.year),
    }));
}

export function projectionSeries(years: readonly ProjectionYear[]): readonly ChartPoint[] {
  return years.map((year) => ({
    x: year.year,
    y: year.net !== null ? year.net.netAnnual : year.grossAnnual,
    label: String(year.year),
  }));
}

export interface TableRow {
  readonly id: string;
  readonly year: number;
  readonly grossAnnual: number;
  readonly netAnnual: number | null;
  readonly adjusted: number | null;
  readonly note: string | undefined;
  readonly isMigrated: boolean;
  readonly settings: SalaryEntrySettings;
}

export function tableRows(rows: readonly AdjustedEntry[]): readonly TableRow[] {
  return rows.map((row) => ({
    id: row.entry.id,
    year: row.entry.year,
    grossAnnual: row.entry.grossAnnual,
    netAnnual: row.net ? row.net.netAnnual : null,
    adjusted: row.adjusted ? row.adjusted.adjusted : null,
    note: row.entry.note,
    isMigrated: row.entry.isMigrated === true,
    settings: row.entry.settings,
  }));
}
