import { cite, effective, verifiedInPhase0 } from "../define.ts";
import { L_190_2014, L_207_2024 } from "../sources.ts";

export type ActivityCategory =
  | "industrie-alimentari"
  | "commercio"
  | "commercio-ambulante-alimentare"
  | "commercio-ambulante-altro"
  | "costruzioni"
  | "intermediari"
  | "servizi-alloggio"
  | "professionisti"
  | "altre-attivita";

export interface ForfettarioTaxRates {
  readonly startupRate: number;
  readonly standardRate: number;
  readonly startupYears: number;
}

export interface ForfettarioLimits {
  readonly maxRevenue: number;
  readonly maxEmployeeCosts: number;
}

export const FORFETTARIO_PARAMS = {
  "forfettario.taxRates": effective<ForfettarioTaxRates>({
    from: "2024-01-01",
    value: { startupRate: 0.05, standardRate: 0.15, startupYears: 5 },
    source: cite(L_190_2014, "art. 1 c. 64-65"),
  }),
  "forfettario.limits": effective<ForfettarioLimits>({
    from: "2024-01-01",
    value: { maxRevenue: 85_000, maxEmployeeCosts: 20_000 },
    source: {
      ...cite(L_190_2014, "art. 1 c. 54, come modificato dalla L. 197/2022"),
      note: "In vigore dal periodo d'imposta 2023",
    },
  }),
  "forfettario.coefficients": effective<Readonly<Record<ActivityCategory, number>>>({
    from: "2024-01-01",
    value: {
      "industrie-alimentari": 0.4,
      commercio: 0.4,
      "commercio-ambulante-alimentare": 0.4,
      "commercio-ambulante-altro": 0.54,
      costruzioni: 0.86,
      intermediari: 0.62,
      "servizi-alloggio": 0.4,
      professionisti: 0.78,
      "altre-attivita": 0.67,
    },
    source: { ...cite(L_190_2014, "allegato 4"), note: "Invariati dalla riforma del 2015" },
  }),
  "forfettario.concurrentEmployeeIncomeLimit": effective<number>(
    { from: "2024-01-01", value: 30_000, source: verifiedInPhase0(L_190_2014) },
    { from: "2025-01-01", value: 35_000, source: verifiedInPhase0(L_207_2024) },
  ),
};
