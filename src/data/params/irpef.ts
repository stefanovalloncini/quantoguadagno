import { cite, effective, verifiedInPhase0 } from "../define.ts";
import { L_199_2025, L_207_2024 } from "../sources.ts";
import type { Bracket } from "../types.ts";

export interface WorkDeductionBonus {
  readonly above: number;
  readonly upTo: number;
  readonly amount: number;
}

export interface WorkDeductionConfig {
  readonly thresholds: readonly [number, number, number];
  readonly baseDeduction: number;
  readonly additionalDeduction: number;
  readonly midBracketFixed: number;
  readonly midBracketBonus: WorkDeductionBonus;
}

export interface TrattamentoIntegrativoConfig {
  readonly maxAnnualBonus: number;
  readonly fullBonusThreshold: number;
  readonly partialBonusThreshold: number;
  readonly capienzaAllowance: number;
}

export interface SommaAggiuntivaBracket {
  readonly maxIncome: number;
  readonly rate: number;
}

export interface DetrazioneAggiuntivaConfig {
  readonly maxDeduction: number;
  readonly fullDeductionThreshold: number;
  readonly phaseOutEnd: number;
}

export interface TaxWedgeCutConfig {
  readonly sommaAggiuntiva: readonly SommaAggiuntivaBracket[];
  readonly detrazioneAggiuntiva: DetrazioneAggiuntivaConfig;
}

const BRACKETS_2024: readonly Bracket[] = [
  { min: 0, max: 28_000, rate: 0.23 },
  { min: 28_000, max: 50_000, rate: 0.35 },
  { min: 50_000, max: null, rate: 0.43 },
];

const BRACKETS_2026: readonly Bracket[] = [
  { min: 0, max: 28_000, rate: 0.23 },
  { min: 28_000, max: 50_000, rate: 0.33 },
  { min: 50_000, max: null, rate: 0.43 },
];

const L_207_2024_WEDGE = cite(L_207_2024, "art. 1 c. 4-9");

export const IRPEF_PARAMS = {
  "irpef.brackets": effective<readonly Bracket[]>(
    {
      from: "2024-01-01",
      value: BRACKETS_2024,
      source: { ref: "Art. 11 TUIR, come modificato dall'art. 1 c. 1 D.Lgs. 216/2023" },
    },
    {
      from: "2025-01-01",
      value: BRACKETS_2024,
      source: { ...L_207_2024, note: "Conferma i tre scaglioni del 2024" },
    },
    {
      from: "2026-01-01",
      value: BRACKETS_2026,
      source: {
        ...cite(L_199_2025, "art. 1 c. 2"),
        note: "Secondo scaglione dal 35% al 33%",
      },
    },
  ),
  "irpef.workDeduction": effective<WorkDeductionConfig>({
    from: "2024-01-01",
    value: {
      thresholds: [15_000, 28_000, 50_000],
      baseDeduction: 1955,
      additionalDeduction: 1190,
      midBracketFixed: 1910,
      midBracketBonus: { above: 25_000, upTo: 35_000, amount: 65 },
    },
    source: {
      ref: "Art. 13 TUIR, come modificato dall'art. 1 c. 2 L. 213/2023",
      note: "I 65 € tra 25.000 e 35.000 € sono quelli dell'art. 13 c. 1.1",
    },
  }),
  "irpef.trattamentoIntegrativo": effective<TrattamentoIntegrativoConfig>({
    from: "2024-01-01",
    value: {
      maxAnnualBonus: 1200,
      fullBonusThreshold: 15_000,
      partialBonusThreshold: 28_000,
      capienzaAllowance: 75,
    },
    source: verifiedInPhase0({
      ref: "Art. 1 D.L. 3/2020, conv. L. 21/2020; art. 1 c. 3 L. 234/2021",
    }),
  }),
  "irpef.taxWedgeCut": effective<TaxWedgeCutConfig | null>(
    {
      from: "2024-01-01",
      value: null,
      source: {
        ...L_207_2024_WEDGE,
        note: "In vigore dal 2025: nel 2024 valeva l'esonero contributivo",
      },
    },
    {
      from: "2025-01-01",
      value: {
        sommaAggiuntiva: [
          { maxIncome: 8_500, rate: 0.071 },
          { maxIncome: 15_000, rate: 0.053 },
          { maxIncome: 20_000, rate: 0.048 },
        ],
        detrazioneAggiuntiva: {
          maxDeduction: 1000,
          fullDeductionThreshold: 32_000,
          phaseOutEnd: 40_000,
        },
      },
      source: L_207_2024_WEDGE,
    },
  ),
};
