import { effective, revaluedYearly, verifiedInPhase0 } from "../define.ts";
import {
  CIRC_INPS_11_2024,
  CIRC_INPS_21_2024,
  CIRC_INPS_26_2025,
  CIRC_INPS_6_2026,
} from "../sources.ts";

export interface InpsExemptionBracket {
  readonly maxMonthlyIncome: number;
  readonly exemptionRate: number;
}

export interface InpsExemption2024Config {
  readonly brackets: readonly InpsExemptionBracket[];
}

const MASSIMALE_NOTE = "Solo per chi è iscritto dal 1996 (art. 2 c. 18 L. 335/1995)";

export const INPS_PARAMS = {
  "inps.firstBand": revaluedYearly(
    {
      from: "2024-01-01",
      value: 55_008,
      source: verifiedInPhase0({ ...CIRC_INPS_21_2024, note: "4.584 € al mese" }),
    },
    {
      from: "2025-01-01",
      value: 55_448,
      source: verifiedInPhase0({ ...CIRC_INPS_26_2025, note: "4.621 € al mese" }),
    },
    {
      from: "2026-01-01",
      value: 56_224,
      source: verifiedInPhase0({
        ...CIRC_INPS_6_2026,
        note: "56.224,40 € nella circolare; rivalutazione ISTAT +1,40% (Decreto MEF 19/11/2025)",
      }),
    },
  ),
  "inps.massimale": revaluedYearly(
    {
      from: "2024-01-01",
      value: 119_650,
      source: verifiedInPhase0({ ...CIRC_INPS_21_2024, note: MASSIMALE_NOTE }),
    },
    {
      from: "2025-01-01",
      value: 120_607,
      source: verifiedInPhase0({ ...CIRC_INPS_26_2025, note: MASSIMALE_NOTE }),
    },
    {
      from: "2026-01-01",
      value: 122_295,
      source: verifiedInPhase0({ ...CIRC_INPS_6_2026, note: MASSIMALE_NOTE }),
    },
  ),
  "inps.aboveFirstBandSurcharge": effective<number>({
    from: "2024-01-01",
    value: 0.01,
    source: verifiedInPhase0({ ref: "Art. 3-ter D.L. 384/1992, conv. L. 438/1992" }),
  }),
  "inps.employee.rate": effective<number>({
    from: "2024-01-01",
    value: 0.0919,
    source: verifiedInPhase0({
      ...CIRC_INPS_21_2024,
      note: "Confermata dalle circolari 26/2025 e 6/2026",
    }),
  }),
  "inps.employee.apprenticeRate": effective<number>({
    from: "2024-01-01",
    value: 0.0584,
    source: verifiedInPhase0({ ref: "Circ. INPS 22/2007" }),
  }),
  "inps.employee.cigsRate": effective<number>({
    from: "2024-01-01",
    value: 0.003,
    source: {
      ref: "Art. 9 c. 1 L. 407/1990",
      note: "Aziende industriali con più di 15 dipendenti; confermata dalle circolari INPS 21/2024, 26/2025 e 6/2026",
    },
  }),
  "inps.employee.publicRate": effective<number>({
    from: "2024-01-01",
    value: 0.088,
    source: verifiedInPhase0({
      ref: "Art. 22 L. 335/1995 (Gestione Dipendenti Pubblici)",
      url: "https://www.inps.it/it/it/dettaglio-approfondimento.schede-informative.49902.i-contributi-dei-dipendenti-pubblici.html",
    }),
  }),
  "inps.employee.exemption2024": effective<InpsExemption2024Config | null>(
    {
      from: "2024-01-01",
      value: {
        brackets: [
          { maxMonthlyIncome: 1923, exemptionRate: 0.07 },
          { maxMonthlyIncome: 2692, exemptionRate: 0.06 },
        ],
      },
      source: verifiedInPhase0({
        ...CIRC_INPS_11_2024,
        ref: "Art. 1 c. 15 L. 213/2023; Circ. INPS 11/2024",
        note: "Soglia sulla mensilità ordinaria; esonero sulle sole 12 mensilità ordinarie",
      }),
    },
    {
      from: "2025-01-01",
      value: null,
      source: { ref: "Art. 1 c. 15 L. 213/2023", note: "Esonero valido solo per il 2024" },
    },
  ),
};
