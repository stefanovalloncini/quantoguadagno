import { describe, expect, it } from "vitest";
import { SUPPORTED_YEARS } from "@/data/index.ts";
import { sumOfCents } from "./_math.ts";
import type { Gestion } from "./inpsGestioni.ts";
import {
  calculateOrdinario,
  compareWithForfettario,
  type OrdinarioBreakdown,
  type OrdinarioInput,
} from "./ordinario.ts";
import { calculateSelfEmployedDeduction } from "./selfEmployedDeduction.ts";
import { getAutonomiConfig, getTaxConfig } from "./taxConfig.ts";

const BASE: OrdinarioInput = {
  revenue: 50_000,
  costs: 10_000,
  taxYear: 2026,
  regionCode: "lombardia",
  municipalTaxRate: 0.008,
  gestion: "gestione-separata",
  hasOtherPension: false,
  mesiAttivita: 12,
  cassaManualAmount: 0,
};

const PROFESSIONISTI = { coefficient: 0.78, startup: false };

function rowsAddUp(b: OrdinarioBreakdown): number {
  return sumOfCents([b.income, -b.contributions, -b.irpefNet, -b.regionalTax, -b.municipalTax]);
}

describe("calculateOrdinario", () => {
  it("toglie i costi, poi i contributi, poi IRPEF e addizionali", () => {
    expect(calculateOrdinario(BASE)).toEqual({
      revenue: 50_000,
      costs: 10_000,
      income: 40_000,
      contributions: 10_428,
      contributionRate: 0.2607,
      fixedContribution: 0,
      taxableIncome: 29_572,
      irpefGross: 6958.76,
      deductionDue: 227.25,
      deductionUsed: 227.25,
      irpefNet: 6731.51,
      regionalTax: 416.94,
      municipalTax: 236.58,
      totalTaxes: 7385.03,
      netAnnual: 22_186.97,
      netMonthly: 1848.91,
    });
  });

  it("calcola la detrazione sul reddito prima dei contributi, non sul reddito imponibile", () => {
    const result = calculateOrdinario({ ...BASE, revenue: 18_000, costs: 2_000, taxYear: 2025 });
    const cfg = getTaxConfig(2025).selfEmployedDeduction;
    expect(result.income).toBe(16_000);
    expect(result.taxableIncome).toBe(11_828.8);
    expect(result.deductionDue).toBe(calculateSelfEmployedDeduction(16_000, cfg));
    expect(result.deductionDue).not.toBe(calculateSelfEmployedDeduction(11_828.8, cfg));
    expect(result.deductionDue).toBe(957.97);
  });

  it("usa l'aliquota ridotta della Gestione Separata per chi ha un'altra copertura", () => {
    const full = calculateOrdinario(BASE);
    const reduced = calculateOrdinario({ ...BASE, hasOtherPension: true });
    expect(reduced.contributionRate).toBe(0.24);
    expect(reduced.contributions).toBe(9600);
    expect(reduced.netAnnual).toBeGreaterThan(full.netAnnual);
  });

  it("si ferma al massimale della Gestione Separata", () => {
    const { massimale, fullRate } = getAutonomiConfig(2026).gestionSeparata;
    const result = calculateOrdinario({ ...BASE, revenue: 250_000, costs: 20_000 });
    expect(result.contributions).toBe(Math.round(massimale * fullRate * 100) / 100);
    expect(result.deductionDue).toBe(0);
  });

  it("riproporziona il minimo di artigiani e commercianti ai mesi di attività", () => {
    const year = calculateOrdinario({ ...BASE, gestion: "commercianti", revenue: 12_000 });
    const half = calculateOrdinario({
      ...BASE,
      gestion: "commercianti",
      revenue: 12_000,
      mesiAttivita: 6,
    });
    expect(year.fixedContribution).toBe(4611.64);
    expect(half.fixedContribution).toBe(2305.82);
    expect(half.contributions).toBe(2305.82);
  });

  it("deduce l'importo della cassa professionale così come lo inserisci", () => {
    const result = calculateOrdinario({
      ...BASE,
      gestion: "cassa-professionale",
      cassaManualAmount: 6000,
    });
    expect(result.contributions).toBe(6000);
    expect(result.taxableIncome).toBe(34_000);
  });

  it("con una perdita non ci sono imposte, ma il minimo dei commercianti resta", () => {
    const result = calculateOrdinario({
      ...BASE,
      gestion: "commercianti",
      revenue: 20_000,
      costs: 25_000,
    });
    expect(result.income).toBe(-5000);
    expect(result.taxableIncome).toBe(0);
    expect(result.irpefGross).toBe(0);
    expect(result.deductionDue).toBe(0);
    expect(result.totalTaxes).toBe(0);
    expect(result.netAnnual).toBe(sumOfCents([-5000, -4611.64]));
  });

  it("non trasforma in credito la detrazione che supera l'imposta, e allora niente addizionali", () => {
    const result = calculateOrdinario({ ...BASE, revenue: 8_000, costs: 2_000 });
    expect(result.deductionDue).toBeGreaterThan(result.irpefGross);
    expect(result.deductionUsed).toBe(result.irpefGross);
    expect(result.irpefNet).toBe(0);
    expect(result.regionalTax).toBe(0);
    expect(result.municipalTax).toBe(0);
  });

  it("segue gli scaglioni dell'anno: nel 2026 il secondo è al 33%", () => {
    const y2025 = calculateOrdinario({ ...BASE, taxYear: 2025 });
    const y2026 = calculateOrdinario(BASE);
    expect(y2025.irpefGross).toBe(6990.2);
    expect(y2026.irpefGross).toBe(6958.76);
  });

  const GESTIONS: readonly Gestion[] = [
    "gestione-separata",
    "artigiani",
    "commercianti",
    "cassa-professionale",
  ];
  const AMOUNTS = [0, 3_000, 9_000, 16_500, 31_000, 64_000, 140_000];

  it("le righe sommano sempre al netto, senza imposte negative", () => {
    for (const taxYear of SUPPORTED_YEARS) {
      for (const gestion of GESTIONS) {
        for (const revenue of AMOUNTS) {
          for (const costs of [0, 2_500, 12_000]) {
            const b = calculateOrdinario({
              ...BASE,
              taxYear,
              gestion,
              revenue,
              costs,
              cassaManualAmount: 2_000,
            });
            expect(rowsAddUp(b)).toBe(b.netAnnual);
            expect(b.irpefNet).toBe(sumOfCents([b.irpefGross, -b.deductionUsed]));
            expect(b.irpefNet).toBeGreaterThanOrEqual(0);
            expect(b.deductionUsed).toBeLessThanOrEqual(b.deductionDue);
            expect(b.taxableIncome).toBeLessThanOrEqual(Math.max(0, b.income));
            if (b.irpefNet === 0) expect(b.regionalTax + b.municipalTax).toBe(0);
          }
        }
      }
    }
  });
});

describe("compareWithForfettario", () => {
  it("toglie anche dal forfettario gli stessi costi, che lì non si deducono", () => {
    const ordinario = calculateOrdinario(BASE);
    const comparison = compareWithForfettario(BASE, ordinario, PROFESSIONISTI);
    expect(comparison.eligible).toBe(true);
    expect(comparison.forfettario.imponibileLordo).toBe(39_000);
    expect(comparison.forfettario.contributoInps).toBe(10_167.3);
    expect(comparison.forfettario.impostaSostitutiva).toBe(4324.91);
    expect(comparison.netAnnual).toBe(25_507.79);
    expect(comparison.difference).toBe(3320.82);
  });

  it("applica il 5% nei primi cinque anni", () => {
    const ordinario = calculateOrdinario(BASE);
    const comparison = compareWithForfettario(BASE, ordinario, {
      ...PROFESSIONISTI,
      startup: true,
    });
    expect(comparison.forfettario.aliquotaSostitutiva).toBe(0.05);
    expect(comparison.forfettario.impostaSostitutiva).toBe(1441.64);
    expect(comparison.netAnnual).toBe(28_391.06);
  });

  it("usa la stessa gestione e gli stessi mesi dell'ordinario", () => {
    const input: OrdinarioInput = { ...BASE, gestion: "artigiani", mesiAttivita: 6 };
    const comparison = compareWithForfettario(input, calculateOrdinario(input), PROFESSIONISTI);
    expect(comparison.forfettario.gestion).toBe("artigiani");
    expect(comparison.forfettario.contributoFisso).toBe(2260.68);
  });

  it("dice quando i ricavi superano il limite del forfettario", () => {
    const { maxRevenue } = getTaxConfig(2026).forfettario;
    const within = { ...BASE, revenue: maxRevenue };
    const above = { ...BASE, revenue: maxRevenue + 1 };
    expect(
      compareWithForfettario(within, calculateOrdinario(within), PROFESSIONISTI).eligible,
    ).toBe(true);
    const outside = compareWithForfettario(above, calculateOrdinario(above), PROFESSIONISTI);
    expect(outside.eligible).toBe(false);
    expect(outside.reasons).toEqual(["revenue-exceeds-limit"]);
  });
});
