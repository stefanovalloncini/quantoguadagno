import { cite, effective } from "../define.ts";
import { L_199_2025, L_207_2024 } from "../sources.ts";

export interface MadreLavoratriceRules {
  readonly maxAnnualExemption: number;
  readonly minChildrenFullExemption: number;
  readonly maxYoungestChildAge: number;
}

export interface RegimeImpatriatiConfig {
  readonly standardExemptionRate: number;
  readonly withMinorChildrenExemptionRate: number;
  readonly maxEligibleIncome: number;
  readonly durationYears: number;
}

export interface PdrSostitutivaConfig {
  readonly rate: number;
  readonly maxAmount: number;
}

export const SPECIAL_CONDITION_PARAMS = {
  madreLavoratrice: effective<MadreLavoratriceRules>({
    from: "2024-01-01",
    value: { maxAnnualExemption: 3000, minChildrenFullExemption: 3, maxYoungestChildAge: 18 },
    source: cite(L_207_2024, "art. 1 c. 219-220"),
  }),
  impatriati: effective<RegimeImpatriatiConfig>({
    from: "2024-01-01",
    value: {
      standardExemptionRate: 0.5,
      withMinorChildrenExemptionRate: 0.6,
      maxEligibleIncome: 600_000,
      durationYears: 5,
    },
    source: { ref: "Art. 5 D.Lgs. 209/2023" },
  }),
  pdr: effective<PdrSostitutivaConfig>(
    {
      from: "2024-01-01",
      value: { rate: 0.05, maxAmount: 3000 },
      source: {
        ref: "Art. 1 c. 182-189 L. 208/2015; L. 213/2023",
        note: "Aliquota sostitutiva al 5% prorogata per il 2024",
      },
    },
    {
      from: "2025-01-01",
      value: { rate: 0.05, maxAmount: 3000 },
      source: { ...L_207_2024, note: "Conferma del 5% per il 2025" },
    },
    {
      from: "2026-01-01",
      value: { rate: 0.01, maxAmount: 5000 },
      source: {
        ...cite(L_199_2025, "art. 1 c. 9"),
        note: "Chiarimenti nella Circ. AdE 2/E del 24/02/2026",
      },
    },
  ),
};
