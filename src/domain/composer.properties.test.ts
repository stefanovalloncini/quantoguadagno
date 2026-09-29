import { describe, expect, it } from "vitest";
import { calculateSalaryBreakdown, type SalaryInput } from "./composer.ts";
import { REGIONS_LIST, SUPPORTED_YEARS } from "@/data/index.ts";

const GROSS_SAMPLES = [
  0, 1_000, 5_000, 8_000, 8_500, 12_000, 15_000, 15_001, 18_000, 20_000, 20_001, 25_000, 28_000,
  30_000, 32_000, 35_000, 40_000, 45_000, 50_000, 60_000, 80_000, 100_000, 150_000, 250_000,
];

function* inputs(): Generator<SalaryInput> {
  for (const taxYear of SUPPORTED_YEARS) {
    for (const region of REGIONS_LIST) {
      for (const grossAnnual of GROSS_SAMPLES) {
        yield { grossAnnual, taxYear, regionCode: region.code, municipalTaxRate: 0.008 };
      }
    }
    for (const grossAnnual of GROSS_SAMPLES) {
      const base = {
        grossAnnual,
        taxYear,
        regionCode: "lombardia",
        municipalTaxRate: 0.008,
      } as const;
      yield {
        ...base,
        paymentFrequency: 14,
        dependents: { hasSpouse: true, childrenOver21: 2, otherDependents: 1 },
      };
      yield {
        ...base,
        expenseDeductions: {
          mortgageInterest: 3_000,
          medicalExpenses: 1_500,
          otherDeductions: 2_000,
          pensionFund: 2_000,
        },
      };
      yield { ...base, contractType: "apprendistato" };
      yield { ...base, isPublicEmployee: true };
      yield {
        ...base,
        specialConditions: { regimeImpatriati: { enabled: true, hasMinorChildren: true } },
      };
    }
  }
}

const cents = (n: number) => Math.round(n * 100);

describe("calculateSalaryBreakdown — regole che valgono sempre", () => {
  it("nessuna imposta o contributo è negativo", () => {
    for (const input of inputs()) {
      const r = calculateSalaryBreakdown(input);
      expect(r.inpsContribution).toBeGreaterThanOrEqual(0);
      expect(r.irpefNet).toBeGreaterThanOrEqual(0);
      expect(r.regionalTax).toBeGreaterThanOrEqual(0);
      expect(r.municipalTax).toBeGreaterThanOrEqual(0);
      expect(r.irpefNet).toBeLessThanOrEqual(r.irpefGross);
    }
  });

  it("le righe del cedolino sommano al netto, al centesimo", () => {
    for (const input of inputs()) {
      const r = calculateSalaryBreakdown(input);
      const ledger =
        cents(r.grossAnnual) -
        cents(r.inpsContribution) -
        cents(r.irpefNet) -
        cents(r.regionalTax) -
        cents(r.municipalTax) +
        cents(r.trattamentoIntegrativo) +
        cents(r.sommaAggiuntiva) +
        cents(r.pdrNet);
      expect(ledger).toBe(cents(r.netAnnual));
    }
  });

  it("l'IRPEF netta è l'IRPEF lorda meno le detrazioni, mai sotto zero", () => {
    for (const input of inputs()) {
      const r = calculateSalaryBreakdown(input);
      const expected = Math.max(0, cents(r.irpefGross) - cents(r.totalDeductions));
      expect(cents(r.irpefNet)).toBe(expected);
    }
  });

  it("senza IRPEF netta non si pagano addizionali (art. 50 c. 3 D.Lgs. 446/1997)", () => {
    for (const input of inputs()) {
      const r = calculateSalaryBreakdown(input);
      if (r.irpefNet === 0) {
        expect(r.regionalTax).toBe(0);
        expect(r.municipalTax).toBe(0);
      }
    }
  });

  it("trattamento integrativo tra 0 e 1.200 €, solo fino a 28.000 € di reddito", () => {
    for (const input of inputs()) {
      const r = calculateSalaryBreakdown(input);
      expect(r.trattamentoIntegrativo).toBeGreaterThanOrEqual(0);
      expect(r.trattamentoIntegrativo).toBeLessThanOrEqual(1200);
      if (r.taxableIncome > 28_000) expect(r.trattamentoIntegrativo).toBe(0);
    }
  });

  it("il taglio del cuneo esiste solo dal 2025, l'esonero contributivo solo nel 2024", () => {
    for (const input of inputs()) {
      const r = calculateSalaryBreakdown(input);
      if (input.taxYear === 2024) {
        expect(r.sommaAggiuntiva).toBe(0);
        expect(r.detrazioneAggiuntiva).toBe(0);
      } else {
        expect(r.inpsExemption).toBe(0);
      }
      expect(cents(r.taxWedgeCutTotal)).toBe(
        cents(r.sommaAggiuntiva) + cents(r.detrazioneAggiuntiva),
      );
    }
  });

  it("l'aliquota effettiva non conta due volte la detrazione aggiuntiva", () => {
    for (const input of inputs()) {
      const r = calculateSalaryBreakdown(input);
      if (r.grossAnnual === 0) continue;
      const taxesNetOfCredits =
        r.inpsContribution +
        r.irpefNet +
        r.regionalTax +
        r.municipalTax -
        r.trattamentoIntegrativo -
        r.sommaAggiuntiva;
      expect(r.effectiveTaxRate).toBeCloseTo(taxesNetOfCredits / r.grossAnnual, 3);
    }
  });
});

describe("calculateSalaryBreakdown — effetti dei singoli input", () => {
  const base: SalaryInput = {
    grossAnnual: 40_000,
    taxYear: 2026,
    regionCode: "lombardia",
    municipalTaxRate: 0.008,
  };

  it("la previdenza complementare riduce l'imponibile e aumenta il netto", () => {
    const without = calculateSalaryBreakdown(base);
    const withFund = calculateSalaryBreakdown({
      ...base,
      expenseDeductions: {
        mortgageInterest: 0,
        medicalExpenses: 0,
        otherDeductions: 0,
        pensionFund: 3_000,
      },
    });
    expect(withFund.pensionFundDeduction).toBe(3_000);
    expect(withFund.taxableIncome).toBeCloseTo(without.taxableIncome - 3_000, 2);
    expect(withFund.netAnnual).toBeGreaterThan(without.netAnnual);
  });

  it("senza mensilità indicate il netto mensile è su 12", () => {
    const r = calculateSalaryBreakdown(base);
    expect(r.netMonthly).toBeCloseTo(r.netAnnual / 12, 2);
  });

  it("chi è iscritto prima del 1996 non ha massimale contributivo", () => {
    const post = calculateSalaryBreakdown({ ...base, grossAnnual: 200_000 });
    const ante = calculateSalaryBreakdown({
      ...base,
      grossAnnual: 200_000,
      insuredBefore1996: true,
    });
    expect(ante.inpsContribution).toBeGreaterThan(post.inpsContribution);
    expect(ante.inpsContribution).toBeCloseTo(56_224 * 0.0919 + (200_000 - 56_224) * 0.1019, 2);
  });
});
