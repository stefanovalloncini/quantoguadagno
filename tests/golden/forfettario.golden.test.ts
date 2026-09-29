import { describe, expect, it } from "vitest";
import {
  calculateForfettario,
  getAutonomiConfig,
  getTaxConfig,
  type ForfettarioBreakdown,
  type Gestion,
} from "@/domain/index.ts";
import { ACTIVITY_COEFFICIENTS, type ActivityCategory } from "@/data/forfettarioActivities.ts";
import type { SupportedYear } from "@/data/index.ts";

type NumericField = {
  [K in keyof ForfettarioBreakdown]-?: ForfettarioBreakdown[K] extends number ? K : never;
}[keyof ForfettarioBreakdown];

interface GoldenCase {
  readonly name: string;
  readonly source: string;
  readonly year: SupportedYear;
  readonly revenue: number;
  readonly activity: ActivityCategory;
  readonly gestion: Gestion;
  readonly yearsOfActivity: number;
  readonly hasOtherPension?: boolean;
  readonly forfettarioDiscount35?: boolean;
  readonly expected: readonly (readonly [NumericField, number])[];
}

const CASES: readonly GoldenCase[] = [
  {
    name: "2026 · professionista 60.000 € · Gestione Separata · primi 5 anni",
    source: "L. 190/2014 c. 54-89; Circ. INPS 8/2026 (26,07%)",
    year: 2026,
    revenue: 60_000,
    activity: "professionisti",
    gestion: "gestione-separata",
    yearsOfActivity: 2,
    expected: [
      ["imponibileLordo", 46_800],
      ["contributoInps", 12_200.76],
      ["impostaSostitutiva", 1729.96],
      ["totaleImposte", 13_930.72],
      ["nettoAnnuale", 46_069.28],
    ],
  },
  {
    name: "2026 · professionista 40.000 € · Gestione Separata con altra copertura",
    source: "Circ. INPS 8/2026 (24%)",
    year: 2026,
    revenue: 40_000,
    activity: "professionisti",
    gestion: "gestione-separata",
    yearsOfActivity: 2,
    hasOtherPension: true,
    expected: [
      ["contributoInps", 7488],
      ["impostaSostitutiva", 1185.6],
      ["nettoAnnuale", 31_326.4],
    ],
  },
  {
    name: "2026 · artigiano 50.000 € · riduzione del 35%",
    source: "Circ. INPS 14/2026: minimo ridotto 4.521,36 × 0,65, maternità compresa",
    year: 2026,
    revenue: 50_000,
    activity: "costruzioni",
    gestion: "artigiani",
    yearsOfActivity: 3,
    forfettarioDiscount35: true,
    expected: [
      ["imponibileLordo", 43_000],
      ["contributoInps", 6712.84],
      ["impostaSostitutiva", 1814.36],
      ["nettoAnnuale", 41_472.8],
    ],
  },
  {
    name: "2024 · artigiano 30.000 €",
    source: "Circ. INPS 33/2024: minimale 18.415 €",
    year: 2024,
    revenue: 30_000,
    activity: "costruzioni",
    gestion: "artigiani",
    yearsOfActivity: 6,
    expected: [
      ["contributoInps", 6199.44],
      ["impostaSostitutiva", 2940.08],
      ["nettoAnnuale", 20_860.48],
    ],
  },
  {
    name: "2025 · artigiano 80.000 € · oltre la prima fascia",
    source: "Circ. INPS 38/2025: 24% fino a 55.448 €, 25% oltre",
    year: 2025,
    revenue: 80_000,
    activity: "costruzioni",
    gestion: "artigiani",
    yearsOfActivity: 6,
    expected: [
      ["imponibileLordo", 68_800],
      ["contributoInps", 16_652.96],
      ["impostaSostitutiva", 7822.06],
      ["nettoAnnuale", 55_524.98],
    ],
  },
  {
    name: "2025 · commerciante 60.000 € · primi 5 anni",
    source: "Circ. INPS 38/2025: 24,48%",
    year: 2025,
    revenue: 60_000,
    activity: "commercio",
    gestion: "commercianti",
    yearsOfActivity: 1,
    expected: [
      ["contributoInps", 5882.64],
      ["impostaSostitutiva", 905.87],
      ["nettoAnnuale", 53_211.49],
    ],
  },
];

describe("regime forfettario: valori calcolati a mano dalle norme", () => {
  it.each(CASES)("$name ($source)", (c) => {
    const config = getTaxConfig(c.year);
    const result = calculateForfettario(
      {
        revenue: c.revenue,
        coefficient: ACTIVITY_COEFFICIENTS[c.activity].coefficient,
        yearsOfActivity: c.yearsOfActivity,
        hasOtherPension: c.hasOtherPension ?? false,
        employeeCosts: 0,
        gestion: c.gestion,
        mesiAttivita: 12,
        forfettarioDiscount35: c.forfettarioDiscount35 ?? false,
        autonomi: getAutonomiConfig(c.year),
      },
      config.forfettario,
      config.gestioneSeparata,
    );
    const actual = c.expected.map(([field]) => [field, result[field]] as const);
    expect(actual).toEqual(c.expected);
  });
});
