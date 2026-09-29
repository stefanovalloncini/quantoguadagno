import { cite, effective, verifiedInPhase0 } from "../define.ts";
import { L_199_2025, L_207_2024, L_213_2023 } from "../sources.ts";
import type { Source } from "../types.ts";

export type PowertrainType = "bev" | "phev" | "other";

export interface CompanyCarCo2Threshold {
  readonly maxCO2: number | null;
  readonly taxablePercentage: number;
}

export interface CompanyCarPowertrainRate {
  readonly powertrainType: PowertrainType;
  readonly taxablePercentage: number;
}

export interface WelfareThresholds {
  readonly welfareThresholdGeneral: number;
  readonly welfareThresholdWithChildren: number;
}

const MEAL_VOUCHERS_2020: Source = {
  ref: "Art. 51 c. 2 lett. c TUIR, come modificato dalla L. 160/2019",
  note: "In vigore dal 2020",
};

const COMPANY_CAR_POWERTRAIN = cite(L_207_2024, "art. 1 c. 48");

export const FRINGE_BENEFIT_PARAMS = {
  "fringe.mealVouchers.electronic": effective<number>(
    { from: "2024-01-01", value: 8, source: MEAL_VOUCHERS_2020 },
    { from: "2026-01-01", value: 10, source: cite(L_199_2025, "art. 1 c. 16") },
  ),
  "fringe.mealVouchers.paper": effective<number>({
    from: "2024-01-01",
    value: 4,
    source: MEAL_VOUCHERS_2020,
  }),
  "fringe.healthInsurance": effective<number>({
    from: "2024-01-01",
    value: 3615.2,
    source: { ref: "Art. 51 c. 2 lett. a TUIR" },
  }),
  "fringe.welfare": effective<WelfareThresholds>(
    {
      from: "2024-01-01",
      value: { welfareThresholdGeneral: 1000, welfareThresholdWithChildren: 2000 },
      source: verifiedInPhase0(cite(L_213_2023, "art. 1 c. 16")),
    },
    {
      from: "2025-01-01",
      value: { welfareThresholdGeneral: 1000, welfareThresholdWithChildren: 2000 },
      source: verifiedInPhase0({ ...L_207_2024, note: "Triennio 2025-2027" }),
    },
  ),
  "fringe.companyCar.co2": effective<readonly CompanyCarCo2Threshold[]>({
    from: "2024-01-01",
    value: [
      { maxCO2: 60, taxablePercentage: 0.25 },
      { maxCO2: 160, taxablePercentage: 0.3 },
      { maxCO2: 190, taxablePercentage: 0.5 },
      { maxCO2: null, taxablePercentage: 0.6 },
    ],
    source: {
      ref: "Art. 51 c. 4 lett. a TUIR",
      note: "Per i contratti stipulati fino al 31/12/2024",
    },
  }),
  "fringe.companyCar.powertrain": effective<readonly CompanyCarPowertrainRate[] | null>(
    {
      from: "2024-01-01",
      value: null,
      source: { ...COMPANY_CAR_POWERTRAIN, note: "Per i contratti stipulati dal 01/01/2025" },
    },
    {
      from: "2025-01-01",
      value: [
        { powertrainType: "bev", taxablePercentage: 0.1 },
        { powertrainType: "phev", taxablePercentage: 0.2 },
        { powertrainType: "other", taxablePercentage: 0.5 },
      ],
      source: COMPANY_CAR_POWERTRAIN,
    },
  ),
  "fringe.companyCar.conventionalKm": effective<number>({
    from: "2024-01-01",
    value: 15_000,
    source: { ref: "Art. 51 c. 4 lett. a TUIR" },
  }),
};
