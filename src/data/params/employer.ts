import { effective, verifiedInPhase0 } from "../define.ts";
import { NO_SOURCE_CITED } from "../sources.ts";

export interface EmployerInpsRates {
  readonly rate: number;
  readonly apprenticeshipRate: number;
}

export interface OtherEmployerCostsConfig {
  readonly inailRate: number;
  readonly maternityRate: number;
  readonly naspiRate: number;
  readonly naspiAdditionalDeterminatoRate: number;
  readonly cigRate: number;
  readonly otherRate: number;
}

export interface TfrConfig {
  readonly accrualDivisor: number;
  readonly ivsContributionRate: number;
  readonly fixedRevaluationRate: number;
  readonly inflationPercentage: number;
  readonly revaluationTaxRate: number;
}

export const EMPLOYER_PARAMS = {
  "employer.inps": effective<EmployerInpsRates>({
    from: "2024-01-01",
    value: { rate: 0.2381, apprenticeshipRate: 0.1181 },
    source: NO_SOURCE_CITED,
  }),
  "employer.otherCosts": effective<OtherEmployerCostsConfig>({
    from: "2024-01-01",
    value: {
      inailRate: 0.004,
      maternityRate: 0.0046,
      naspiRate: 0.0161,
      naspiAdditionalDeterminatoRate: 0.014,
      cigRate: 0.009,
      otherRate: 0.0068,
    },
    source: NO_SOURCE_CITED,
  }),
  tfr: effective<TfrConfig>({
    from: "2024-01-01",
    value: {
      accrualDivisor: 13.5,
      ivsContributionRate: 0.005,
      fixedRevaluationRate: 0.015,
      inflationPercentage: 0.75,
      revaluationTaxRate: 0.17,
    },
    source: verifiedInPhase0({
      ref: "Art. 2120 c.c.; art. 3 c. 15-16 L. 297/1982; art. 1 D.L. 47/2014",
      note: "Rivalutazione sull'aumento dell'indice FOI da dicembre a dicembre; imposta sostitutiva 17%",
    }),
  }),
};
