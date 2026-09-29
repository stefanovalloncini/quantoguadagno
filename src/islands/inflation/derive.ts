import { FOI_INDEX } from "@/data/index.ts";
import type { FrozenSalary, RaiseToKeepPace } from "@/domain/inflation.ts";

export interface ChartPoint {
  readonly x: number;
  readonly y: number;
  readonly label: string;
}

export function availableYears(): readonly number[] {
  return FOI_INDEX.map((point) => point.year);
}

export function frozenSeries(frozen: FrozenSalary | null): readonly ChartPoint[] {
  if (frozen === null) return [];
  return frozen.years.map((year) => ({
    x: year.year,
    y: year.realValue,
    label: String(year.year),
  }));
}

export type KeepPaceRowKey = "needed" | "raise";

export interface KeepPaceRow {
  readonly key: KeepPaceRowKey;
  readonly amount: number;
  readonly rate?: number;
}

export function keepPaceRows(keepPace: RaiseToKeepPace | null): readonly KeepPaceRow[] {
  if (keepPace === null) return [];
  return [
    { key: "needed", amount: keepPace.grossNeeded },
    { key: "raise", amount: keepPace.raiseAmount, rate: keepPace.raisePercent },
  ];
}
