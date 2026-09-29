import { verifiedInPhase0 } from "./define.ts";
import type { Source } from "./types.ts";

export interface InflationDataPoint {
  readonly year: number;
  readonly index: number; // base 2015 = 100
  readonly provisional?: true;
}

export const FOI_SOURCE: Source = verifiedInPhase0({
  ref: "ISTAT, indice dei prezzi al consumo per le famiglie di operai e impiegati (FOI) senza tabacchi, base 2015 = 100, medie annue",
  url: "http://dati.istat.it",
  note: "Il 2025 coincide con il coefficiente di raccordo 1,214 verso la base 2025 = 100; il 2026 è la media provvisoria dei mesi pubblicati (gennaio-agosto, 102,2 in base 2025)",
});

export const FOI_INDEX: readonly InflationDataPoint[] = [
  { year: 2015, index: 100.0 },
  { year: 2016, index: 99.9 },
  { year: 2017, index: 101.1 },
  { year: 2018, index: 102.2 },
  { year: 2019, index: 102.6 },
  { year: 2020, index: 102.4 },
  { year: 2021, index: 104.2 },
  { year: 2022, index: 112.5 },
  { year: 2023, index: 118.6 },
  { year: 2024, index: 119.7 },
  { year: 2025, index: 121.4 },
  { year: 2026, index: 124.1, provisional: true },
];

function baseYear(): number {
  const base = FOI_INDEX.find((point) => point.index === 100);
  if (base === undefined) throw new Error("The FOI series has no base year (index 100)");
  return base.year;
}

function latestYear(): number {
  const last = FOI_INDEX[FOI_INDEX.length - 1];
  if (last === undefined) throw new Error("The FOI series is empty");
  return last.year;
}

export const FOI_BASE_YEAR = baseYear();
export const FOI_LATEST_YEAR = latestYear();
