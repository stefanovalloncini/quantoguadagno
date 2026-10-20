import { describe, expect, it } from "vitest";
import type { RegionCode, SupportedYear } from "@/data/index.ts";
import {
  calculateOrdinario,
  compareWithForfettario,
  type Gestion,
  type OrdinarioBreakdown,
} from "@/domain/index.ts";

type NumericField = {
  [K in keyof OrdinarioBreakdown]-?: OrdinarioBreakdown[K] extends number ? K : never;
}[keyof OrdinarioBreakdown];

interface GoldenCase {
  readonly name: string;
  readonly source: string;
  readonly year: SupportedYear;
  readonly gestion: Gestion;
  readonly revenue: number;
  readonly costs: number;
  readonly region: RegionCode;
  readonly mesiAttivita?: number;
  readonly expected: readonly (readonly [NumericField, number])[];
  readonly forfettario: {
    readonly coefficient: number;
    readonly startup: boolean;
    readonly netAnnual: number;
    readonly difference: number;
  };
}

// Calcolati a mano dalle norme e ricontrollati con un calcolo indipendente in decimali:
// docs/data-verification/regime-ordinario.md, "Vettori". Addizionale comunale 0,80% in tutti.
const CASES: readonly GoldenCase[] = [
  {
    name: "2026 · professionista in Gestione Separata · 50.000 € di compensi, 10.000 € di costi",
    source: "Art. 54 e 13 c. 5 lett. b-bis) TUIR; Circ. INPS 8/2026 (26,07%); Lombardia 2026",
    year: 2026,
    gestion: "gestione-separata",
    revenue: 50_000,
    costs: 10_000,
    region: "lombardia",
    expected: [
      ["income", 40_000],
      ["contributions", 10_428],
      ["taxableIncome", 29_572],
      ["irpefGross", 6958.76],
      ["deductionDue", 227.25],
      ["irpefNet", 6731.51],
      ["regionalTax", 416.94],
      ["municipalTax", 236.58],
      ["netAnnual", 22_186.97],
      ["netMonthly", 1848.91],
    ],
    forfettario: { coefficient: 0.78, startup: false, netAnnual: 25_507.79, difference: 3320.82 },
  },
  {
    name: "2026 · commerciante · 80.000 € di ricavi, 45.000 € di costi",
    source: "Art. 66 e 13 c. 5 lett. b-bis) TUIR; Circ. INPS 14/2026 (24,48%); Veneto 2026",
    year: 2026,
    gestion: "commercianti",
    revenue: 80_000,
    costs: 45_000,
    region: "veneto",
    expected: [
      ["income", 35_000],
      ["contributions", 8575.44],
      ["taxableIncome", 26_424.56],
      ["irpefGross", 6077.65],
      ["deductionDue", 340.9],
      ["irpefNet", 5736.75],
      ["regionalTax", 325.02],
      ["municipalTax", 211.4],
      ["netAnnual", 20_151.39],
    ],
    forfettario: { coefficient: 0.4, startup: false, netAnnual: 23_535.12, difference: 3383.73 },
  },
  {
    name: "2025 · professionista in Gestione Separata · reddito basso con i 50 € del comma 5-ter",
    source: "Art. 13 c. 5 lett. b), 5-ter e 6 TUIR; Circ. INPS 27/2025 (26,07%); Lombardia 2025",
    year: 2025,
    gestion: "gestione-separata",
    revenue: 18_000,
    costs: 2_000,
    region: "lombardia",
    expected: [
      ["income", 16_000],
      ["contributions", 4171.2],
      ["taxableIncome", 11_828.8],
      ["irpefGross", 2720.62],
      ["deductionDue", 957.97],
      ["irpefNet", 1762.65],
      ["regionalTax", 145.49],
      ["municipalTax", 94.63],
      ["netAnnual", 9826.03],
    ],
    forfettario: { coefficient: 0.78, startup: false, netAnnual: 10_782.8, difference: 956.77 },
  },
  {
    name: "2024 · artigiano per 6 mesi · la detrazione copre tutta l'imposta",
    source: "Art. 13 c. 5 lett. b) TUIR; Circ. INPS 33/2024 (minimale 18.415 €, 24%)",
    year: 2024,
    gestion: "artigiani",
    revenue: 20_000,
    costs: 14_000,
    region: "lombardia",
    mesiAttivita: 6,
    expected: [
      ["income", 6000],
      ["contributions", 2213.52],
      ["taxableIncome", 3786.48],
      ["irpefGross", 870.89],
      ["deductionDue", 1247.94],
      ["deductionUsed", 870.89],
      ["irpefNet", 0],
      ["regionalTax", 0],
      ["municipalTax", 0],
      ["netAnnual", 3786.48],
    ],
    forfettario: { coefficient: 0.67, startup: false, netAnnual: 2108.51, difference: -1677.97 },
  },
];

describe("regime ordinario: valori calcolati a mano dalle norme", () => {
  it.each(CASES)("$name ($source)", (c) => {
    const input = {
      revenue: c.revenue,
      costs: c.costs,
      taxYear: c.year,
      regionCode: c.region,
      municipalTaxRate: 0.008,
      gestion: c.gestion,
      hasOtherPension: false,
      mesiAttivita: c.mesiAttivita ?? 12,
      cassaManualAmount: 0,
    };
    const result = calculateOrdinario(input);
    const actual = c.expected.map(([field]) => [field, result[field]] as const);
    expect(actual).toEqual(c.expected);

    const comparison = compareWithForfettario(input, result, c.forfettario);
    expect([comparison.netAnnual, comparison.difference]).toEqual([
      c.forfettario.netAnnual,
      c.forfettario.difference,
    ]);
  });
});
