// Coefficienti di redditività per il regime forfettario.
// Fonte: Allegato 4 alla L. 190/2014 (Legge di Stabilità 2015), tabella codici ATECO
// raggruppati per categoria. Le percentuali sono rimaste invariate dalla riforma del 2015.

import type { ActivityCategory } from "./params/forfettario.ts";
import { LATEST_SUPPORTED_YEAR, param, yearStart } from "./registry.ts";

export type { ActivityCategory };

const COEFFICIENTS = param("forfettario.coefficients", yearStart(LATEST_SUPPORTED_YEAR));

export interface ActivityCoefficient {
  readonly code: ActivityCategory;
  readonly label: string;
  readonly coefficient: number;
  readonly description: string;
}

export const ACTIVITY_COEFFICIENTS: Record<ActivityCategory, ActivityCoefficient> = {
  "industrie-alimentari": {
    code: "industrie-alimentari",
    label: "Industrie alimentari e bevande",
    coefficient: COEFFICIENTS["industrie-alimentari"],
    description: "Codici ATECO 10-11.",
  },
  commercio: {
    code: "commercio",
    label: "Commercio all'ingrosso e al dettaglio",
    coefficient: COEFFICIENTS.commercio,
    description: "Codici ATECO 45.1-45.3, 45.4 (escluso 45.42), 46.2-46.9, 47.1-47.7, 47.9.",
  },
  "commercio-ambulante-alimentare": {
    code: "commercio-ambulante-alimentare",
    label: "Commercio ambulante di alimentari e bevande",
    coefficient: COEFFICIENTS["commercio-ambulante-alimentare"],
    description: "ATECO 47.81.",
  },
  "commercio-ambulante-altro": {
    code: "commercio-ambulante-altro",
    label: "Commercio ambulante di altri prodotti",
    coefficient: COEFFICIENTS["commercio-ambulante-altro"],
    description: "ATECO 47.82, 47.89.",
  },
  costruzioni: {
    code: "costruzioni",
    label: "Costruzioni e attività immobiliari",
    coefficient: COEFFICIENTS.costruzioni,
    description: "ATECO 41-43, 68.",
  },
  intermediari: {
    code: "intermediari",
    label: "Intermediari del commercio",
    coefficient: COEFFICIENTS.intermediari,
    description: "ATECO 46.1.",
  },
  "servizi-alloggio": {
    code: "servizi-alloggio",
    label: "Servizi di alloggio e ristorazione",
    coefficient: COEFFICIENTS["servizi-alloggio"],
    description: "ATECO 55, 56.",
  },
  professionisti: {
    code: "professionisti",
    label: "Attività professionali, scientifiche, tecniche, sanitarie, di istruzione",
    coefficient: COEFFICIENTS.professionisti,
    description: "ATECO 64-66, 69-75, 85, 86-88.",
  },
  "altre-attivita": {
    code: "altre-attivita",
    label: "Altre attività economiche",
    coefficient: COEFFICIENTS["altre-attivita"],
    description: "Tutti i codici ATECO non rientranti nelle altre categorie.",
  },
};

export const ACTIVITY_CATEGORIES: readonly ActivityCategory[] = [
  "professionisti",
  "altre-attivita",
  "intermediari",
  "commercio",
  "commercio-ambulante-altro",
  "commercio-ambulante-alimentare",
  "industrie-alimentari",
  "servizi-alloggio",
  "costruzioni",
];
