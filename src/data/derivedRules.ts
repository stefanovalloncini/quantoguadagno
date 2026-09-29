import { verifiedInPhase0 } from "./define.ts";
import type { DerivedKey } from "./derived.ts";
import type { Source } from "./types.ts";

const ABOVE_FIRST_BAND = verifiedInPhase0({
  ref: "Aliquota più un punto oltre la prima fascia (art. 3-ter D.L. 384/1992)",
});

const MINIMUM_CONTRIBUTION: Source = {
  ref: "Minimale × aliquota + contributo di maternità",
  note: "Coincide con il contributo minimo pubblicato nelle circolari INPS",
};

export const DERIVED_RULES: Readonly<Record<DerivedKey, Source>> = {
  "inps.employee.rateAboveFirstBand": ABOVE_FIRST_BAND,
  "inps.employee.publicRateAboveFirstBand": ABOVE_FIRST_BAND,
  "inps.artigiani.rateAboveFirstBand": ABOVE_FIRST_BAND,
  "inps.commercianti.rateAboveFirstBand": ABOVE_FIRST_BAND,
  "inps.autonomi.massimaleAnte1996": verifiedInPhase0({
    ref: "Prima fascia più due terzi, per chi ha contributi prima del 1996",
    note: "La Circ. INPS 14/2026 lo scrive per esteso: 56.224 + 37.483 = 93.707",
  }),
  "inps.gestioneSeparata.minimale": { ref: "Minimale di artigiani e commercianti" },
  "inps.artigiani.minimumContribution": MINIMUM_CONTRIBUTION,
  "inps.commercianti.minimumContribution": MINIMUM_CONTRIBUTION,
  "madreLavoratrice.maxMonthlyExemption": { ref: "Limite annuo riparametrato su base mensile" },
};
