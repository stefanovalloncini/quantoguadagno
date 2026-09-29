import { effective, verifiedInPhase0 } from "../define.ts";
import { L_199_2025, L_207_2024 } from "../sources.ts";
import type { Source } from "../types.ts";

export interface SpouseDeductionIncrement {
  readonly above: number;
  readonly upTo: number;
  readonly amount: number;
}

export interface SpouseDeductionConfig {
  readonly lowIncomeLimit: number;
  readonly lowIncomeMax: number;
  readonly lowIncomeTaper: number;
  readonly standard: number;
  readonly standardLimit: number;
  readonly phaseOutEnd: number;
  readonly increments: readonly SpouseDeductionIncrement[];
}

export interface ChildrenDeductionConfig {
  readonly childOver21Deduction: number;
  readonly childPhaseOutBase: number;
  readonly childPhaseOutPerExtraChild: number;
}

export interface OtherFamilyDeductionConfig {
  readonly otherFamilyDeduction: number;
  readonly otherFamilyPhaseOutEnd: number;
}

export interface DependentIncomeLimits {
  readonly dependentIncomeLimit: number;
  readonly dependentIncomeLimitYoung: number;
}

export interface ExpenseRatesConfig {
  readonly maxMortgageInterest: number;
  readonly medicalExpenseFloor: number;
  readonly medicalDeductionRate: number;
  readonly standardDeductionRate: number;
}

export interface ExpensePhaseOut {
  readonly phaseOutStart: number;
  readonly phaseOutEnd: number;
}

export interface ExpenseCapBand {
  readonly upTo: number | null;
  readonly base: number;
}

export interface ExpenseHighIncomeCap {
  readonly minIncome: number;
  readonly bands: readonly ExpenseCapBand[];
  readonly coefficientsByChildren: readonly number[];
}

export interface ExpenseHighIncomeReduction {
  readonly minIncome: number;
  readonly amount: number;
}

const ART_16_TER: Source = { ...L_207_2024, ref: "Art. 16-ter TUIR, introdotto dalla L. 207/2024" };

export const DEDUCTION_PARAMS = {
  "deductions.spouse": effective<SpouseDeductionConfig>({
    from: "2024-01-01",
    value: {
      lowIncomeLimit: 15_000,
      lowIncomeMax: 800,
      lowIncomeTaper: 110,
      standard: 690,
      standardLimit: 40_000,
      phaseOutEnd: 80_000,
      increments: [
        { above: 29_000, upTo: 29_200, amount: 10 },
        { above: 29_200, upTo: 34_700, amount: 20 },
        { above: 34_700, upTo: 35_000, amount: 30 },
        { above: 35_000, upTo: 35_100, amount: 20 },
        { above: 35_100, upTo: 35_200, amount: 10 },
      ],
    },
    source: verifiedInPhase0({ ref: "Art. 12 c. 1 lett. a TUIR" }),
  }),
  "deductions.children": effective<ChildrenDeductionConfig>({
    from: "2024-01-01",
    value: {
      childOver21Deduction: 950,
      childPhaseOutBase: 95_000,
      childPhaseOutPerExtraChild: 15_000,
    },
    source: verifiedInPhase0({
      ref: "Art. 12 c. 1 lett. c TUIR",
      note: "Dal 2025 figli da 21 a 29 anni, senza limiti di età se disabili (L. 207/2024)",
    }),
  }),
  "deductions.otherFamily": effective<OtherFamilyDeductionConfig>({
    from: "2024-01-01",
    value: { otherFamilyDeduction: 750, otherFamilyPhaseOutEnd: 80_000 },
    source: verifiedInPhase0({
      ref: "Art. 12 c. 1 lett. d e c. 4-bis TUIR",
      note: "Dal 2025 solo ascendenti conviventi (L. 207/2024)",
    }),
  }),
  "deductions.dependentIncomeLimit": effective<DependentIncomeLimits>({
    from: "2024-01-01",
    value: { dependentIncomeLimit: 2840.51, dependentIncomeLimitYoung: 4000 },
    source: { ref: "Art. 12 TUIR", note: "4.000 € per i figli fino a 24 anni" },
  }),
  "deductions.expenses": effective<ExpenseRatesConfig>({
    from: "2024-01-01",
    value: {
      maxMortgageInterest: 4000,
      medicalExpenseFloor: 129.11,
      medicalDeductionRate: 0.19,
      standardDeductionRate: 0.19,
    },
    source: verifiedInPhase0({ ref: "Art. 15 c. 1 TUIR" }),
  }),
  "deductions.pensionFund": effective<number>({
    from: "2024-01-01",
    value: 5164.57,
    source: {
      ref: "Art. 10 c. 1 lett. e-bis TUIR; art. 8 c. 4 D.Lgs. 252/2005",
      note: "Onere deducibile dal reddito, non detrazione",
    },
  }),
  "deductions.expensePhaseOut": effective<ExpensePhaseOut>({
    from: "2024-01-01",
    value: { phaseOutStart: 120_000, phaseOutEnd: 240_000 },
    source: verifiedInPhase0({
      ref: "Art. 15 c. 3-bis e 3-ter TUIR",
      note: "Esclusi gli interessi sul mutuo e le spese sanitarie",
    }),
  }),
  "deductions.expenseCap": effective<ExpenseHighIncomeCap | null>(
    {
      from: "2024-01-01",
      value: null,
      source: verifiedInPhase0({ ...ART_16_TER, note: "In vigore dal 2025" }),
    },
    {
      from: "2025-01-01",
      value: {
        minIncome: 75_000,
        bands: [
          { upTo: 100_000, base: 14_000 },
          { upTo: null, base: 8_000 },
        ],
        coefficientsByChildren: [0.5, 0.7, 0.85, 1],
      },
      source: verifiedInPhase0({
        ...ART_16_TER,
        note: "Escluse le spese sanitarie e gli interessi sui mutui stipulati fino al 31/12/2024",
      }),
    },
  ),
  "deductions.expenseReduction": effective<ExpenseHighIncomeReduction | null>(
    {
      from: "2024-01-01",
      value: null,
      source: verifiedInPhase0({ ...L_199_2025, note: "In vigore dal 2026" }),
    },
    {
      from: "2026-01-01",
      value: { minIncome: 200_000, amount: 440 },
      source: verifiedInPhase0({ ...L_199_2025, note: "Escluse le spese sanitarie" }),
    },
  ),
};
