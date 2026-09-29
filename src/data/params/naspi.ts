import { effective, revaluedYearly } from "../define.ts";
import type { Source } from "../types.ts";

export interface NaspiRules {
  readonly weeklyToMonthlyCoef: number;
  readonly pctBase: number;
  readonly pctMarginal: number;
  readonly decalageRate: number;
  readonly decalageStartUnder55: number;
  readonly decalageStart55plus: number;
  readonly minWeeks: number;
  readonly maxDurationWeeks: number;
  readonly lookbackYears: number;
}

const CIRC_INPS_26_2024: Source = { ref: "Circ. INPS 26/2024" };
const CIRC_INPS_25_2025: Source = { ref: "Circ. INPS 25/2025" };
const CIRC_INPS_4_2026: Source = {
  ref: "Circ. INPS 4/2026",
  published: "2026-01-28",
  note: "Rivalutazione ISTAT +1,40%",
};

export const NASPI_PARAMS = {
  "naspi.soglia": revaluedYearly(
    { from: "2024-01-01", value: 1_425.21, source: CIRC_INPS_26_2024 },
    { from: "2025-01-01", value: 1_436.78, source: CIRC_INPS_25_2025 },
    { from: "2026-01-01", value: 1_456.72, source: CIRC_INPS_4_2026 },
  ),
  "naspi.massimale": revaluedYearly(
    { from: "2024-01-01", value: 1_550.42, source: CIRC_INPS_26_2024 },
    { from: "2025-01-01", value: 1_562.82, source: CIRC_INPS_25_2025 },
    { from: "2026-01-01", value: 1_584.7, source: CIRC_INPS_4_2026 },
  ),
  "naspi.rules": effective<NaspiRules>({
    from: "2024-01-01",
    value: {
      weeklyToMonthlyCoef: 52 / 12,
      pctBase: 0.75,
      pctMarginal: 0.25,
      decalageRate: 0.03,
      decalageStartUnder55: 6,
      decalageStart55plus: 8,
      minWeeks: 13,
      maxDurationWeeks: 104,
      lookbackYears: 4,
    },
    source: {
      ref: "D.Lgs. 22/2015, artt. 3-7",
      note: "Dal 2025, dopo dimissioni volontarie servono 13 settimane nuove (L. 207/2024 art. 1 c. 171)",
    },
  }),
};
