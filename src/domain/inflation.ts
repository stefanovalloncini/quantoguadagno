import { FOI_INDEX, type InflationDataPoint } from "@/data/index.ts";

export interface AdjustedValue {
  readonly nominal: number;
  readonly adjusted: number;
  readonly fromYear: number;
  readonly toYear: number;
  readonly factor: number;
}

function findIndex(year: number): InflationDataPoint | undefined {
  return FOI_INDEX.find((p) => p.year === year);
}

// Convert a nominal value from one year to its purchasing-power equivalent in
// another year, using the FOI index. Returns `null` when either year is missing.
export function adjustValueAcrossYears(
  nominal: number,
  fromYear: number,
  toYear: number,
): AdjustedValue | null {
  const from = findIndex(fromYear);
  const to = findIndex(toYear);
  if (from === undefined || to === undefined) return null;
  if (from.index === 0) return null;
  const factor = to.index / from.index;
  return {
    nominal,
    adjusted: nominal * factor,
    fromYear,
    toYear,
    factor,
  };
}

export interface RaiseToKeepPace {
  readonly fromYear: number;
  readonly toYear: number;
  readonly gross: number;
  readonly grossNeeded: number;
  readonly raiseAmount: number;
  readonly raisePercent: number;
}

// The gross that buys in `toYear` what `gross` bought in `fromYear`.
export function raiseNeededToKeepPace(
  gross: number,
  fromYear: number,
  toYear: number,
): RaiseToKeepPace | null {
  const adjusted = adjustValueAcrossYears(gross, fromYear, toYear);
  if (adjusted === null) return null;
  return {
    fromYear,
    toYear,
    gross,
    grossNeeded: adjusted.adjusted,
    raiseAmount: adjusted.adjusted - gross,
    raisePercent: adjusted.factor - 1,
  };
}

export interface FrozenSalaryYear {
  readonly year: number;
  /** The frozen gross expressed in `fromYear` euros. */
  readonly realValue: number;
  readonly loss: number;
  readonly lossRate: number;
}

export interface FrozenSalary {
  readonly gross: number;
  readonly fromYear: number;
  readonly lastYear: number;
  /** True when the requested horizon runs past the last year the FOI covers. */
  readonly truncated: boolean;
  readonly years: readonly FrozenSalaryYear[];
}

// What a salary left untouched is worth year by year. The walk stops at the
// last FOI year on record: the series is never extended by assumption.
export function frozenSalaryRealValue(
  gross: number,
  fromYear: number,
  years: number,
): FrozenSalary | null {
  const from = findIndex(fromYear);
  if (from === undefined || from.index === 0) return null;

  const horizon = fromYear + Math.max(0, Math.floor(years));
  const covered = FOI_INDEX.filter((p) => p.year >= fromYear && p.year <= horizon);
  const last = covered[covered.length - 1];
  if (last === undefined) return null;

  return {
    gross,
    fromYear,
    lastYear: last.year,
    truncated: horizon > last.year,
    years: covered.map((point) => {
      const realValue = (gross * from.index) / point.index;
      return {
        year: point.year,
        realValue,
        loss: gross - realValue,
        lossRate: 1 - from.index / point.index,
      };
    }),
  };
}

export function cumulativeInflation(fromYear: number, toYear: number): number | null {
  const from = findIndex(fromYear);
  const to = findIndex(toYear);
  if (from === undefined || to === undefined) return null;
  if (from.index === 0) return null;
  return to.index / from.index - 1;
}

export interface YearOverYearRate {
  readonly year: number;
  readonly rate: number;
}

export function foiYearOverYearRates(): readonly YearOverYearRate[] {
  return FOI_INDEX.slice(1).flatMap((point, i) => {
    const previous = FOI_INDEX[i];
    return previous === undefined
      ? []
      : [{ year: point.year, rate: point.index / previous.index - 1 }];
  });
}
