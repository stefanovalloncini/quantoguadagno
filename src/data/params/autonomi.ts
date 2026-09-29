import { cite, effective, revaluedYearly, verifiedInPhase0 } from "../define.ts";
import {
  CIRC_INPS_14_2026,
  CIRC_INPS_33_2024,
  CIRC_INPS_38_2025,
  CIRC_INPS_8_2024,
  L_190_2014,
  L_207_2024,
} from "../sources.ts";

export interface GestioneSeparataRates {
  readonly fullRate: number;
  readonly reducedRate: number;
}

const CONFIRMED_EVERY_YEAR = "Confermata dalle circolari 38/2025 e 14/2026";

export const AUTONOMI_PARAMS = {
  "inps.autonomi.minimale": revaluedYearly(
    { from: "2024-01-01", value: 18_415, source: verifiedInPhase0(CIRC_INPS_33_2024) },
    { from: "2025-01-01", value: 18_555, source: verifiedInPhase0(CIRC_INPS_38_2025) },
    { from: "2026-01-01", value: 18_808, source: verifiedInPhase0(CIRC_INPS_14_2026) },
  ),
  "inps.artigiani.rate": effective<number>({
    from: "2024-01-01",
    value: 0.24,
    source: verifiedInPhase0({ ...CIRC_INPS_33_2024, note: CONFIRMED_EVERY_YEAR }),
  }),
  "inps.commercianti.rate": effective<number>({
    from: "2024-01-01",
    value: 0.2448,
    source: verifiedInPhase0({ ...CIRC_INPS_33_2024, note: CONFIRMED_EVERY_YEAR }),
  }),
  "inps.autonomi.maternity": effective<number>({
    from: "2024-01-01",
    value: 7.44,
    source: verifiedInPhase0({ ...CIRC_INPS_33_2024, note: "0,62 € al mese" }),
  }),
  "inps.autonomi.forfettarioReduction": effective<number>({
    from: "2024-01-01",
    value: 0.35,
    source: verifiedInPhase0({
      ...cite(L_190_2014, "art. 1 c. 77"),
      note: "Si applica all'intero contributo, maternità compresa",
    }),
  }),
  "inps.autonomi.newRegistrantReduction": effective<number>({
    from: "2024-01-01",
    value: 0.5,
    source: {
      ...cite(L_207_2024, "art. 1 c. 186"),
      note: "Per chi si iscrive per la prima volta dal 2025, per 36 mesi, in alternativa alla riduzione del 35%",
    },
  }),
  "inps.gestioneSeparata.rates": effective<GestioneSeparataRates>({
    from: "2024-01-01",
    value: { fullRate: 0.2607, reducedRate: 0.24 },
    source: verifiedInPhase0({
      ...CIRC_INPS_8_2024,
      note: "Confermate dalle circolari 27/2025 e 8/2026",
    }),
  }),
};
