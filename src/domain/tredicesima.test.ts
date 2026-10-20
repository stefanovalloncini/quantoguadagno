import { describe, it, expect } from "vitest";
import { calculateTredicesima, monthlyBrackets } from "./tredicesima.ts";
import { getTaxConfig } from "./taxConfig.ts";
import { round } from "./_math.ts";

const B2025 = getTaxConfig(2025).irpefBrackets;
const B2026 = getTaxConfig(2026).irpefBrackets;
const WEDGE_2026 = getTaxConfig(2026).taxWedgeCut;
const INPS = 0.0919;

// Art. 23 c. 2 lett. b) DPR 600/1973: the extra month is taxed on its own, with the
// annual brackets divided by 12, no detrazioni and no addizionali. Every vector is
// worked by hand in docs/data-verification/tredicesima.md.
describe("monthlyBrackets", () => {
  it("divides every annual limit by 12 and keeps the rates", () => {
    expect(monthlyBrackets(B2026)).toEqual([
      { min: 0, max: 28_000 / 12, rate: 0.23 },
      { min: 28_000 / 12, max: 50_000 / 12, rate: 0.33 },
      { min: 50_000 / 12, max: null, rate: 0.43 },
    ]);
  });
});

describe("calculateTredicesima", () => {
  it("RAL 30.000, 13 mensilità: tutto nel primo scaglione mensile, netto 1.613,62 €", () => {
    for (const brackets of [B2025, B2026]) {
      const r = calculateTredicesima({ ral: 30_000, mensilita: 13, inpsRate: INPS, brackets });
      expect(r.gross).toBe(2307.69);
      expect(r.inps).toBe(212.08);
      expect(r.taxable).toBe(2095.61);
      expect(r.irpef).toBe(481.99);
      expect(r.net).toBe(1613.62);
      expect(r.extraMonths).toBe(1);
      expect(r.netTotal).toBe(1613.62);
    }
  });

  it("RAL 60.000, 13 mensilità, 2026: tre scaglioni mensili, netto 3.039,00 €", () => {
    const r = calculateTredicesima({ ral: 60_000, mensilita: 13, inpsRate: INPS, brackets: B2026 });
    expect(r.gross).toBe(4615.38);
    expect(r.inps).toBe(424.15);
    expect(r.taxable).toBe(4191.23);
    expect(r.irpef).toBe(1152.23);
    expect(r.net).toBe(3039);
  });

  it("RAL 60.000: il 43% su tutta la tredicesima tratteneva 650,00 € di troppo", () => {
    const r = calculateTredicesima({ ral: 60_000, mensilita: 13, inpsRate: INPS, brackets: B2026 });
    expect(round(r.taxable * 0.43) - r.irpef).toBeCloseTo(650, 2);
  });

  it("RAL 60.000, 13 mensilità, 2025: secondo scaglione al 35%, netto 3.002,33 €", () => {
    const r = calculateTredicesima({ ral: 60_000, mensilita: 13, inpsRate: INPS, brackets: B2025 });
    expect(r.irpef).toBe(1188.9);
    expect(r.net).toBe(3002.33);
  });

  it("RAL 45.000, 14 mensilità, 2026: due mensilità aggiuntive da 2.189,00 €", () => {
    const r = calculateTredicesima({ ral: 45_000, mensilita: 14, inpsRate: INPS, brackets: B2026 });
    expect(r.gross).toBe(3214.29);
    expect(r.inps).toBe(295.39);
    expect(r.taxable).toBe(2918.9);
    expect(r.irpef).toBe(729.9);
    expect(r.net).toBe(2189);
    expect(r.extraMonths).toBe(2);
    expect(r.grossTotal).toBe(6428.58);
    expect(r.netTotal).toBe(4378);
  });

  it("RAL 40.000, 13 mensilità: il 33% del 2026 lascia 9,21 € in più del 35% del 2025", () => {
    const r2025 = calculateTredicesima({
      ral: 40_000,
      mensilita: 13,
      inpsRate: INPS,
      brackets: B2025,
    });
    const r2026 = calculateTredicesima({
      ral: 40_000,
      mensilita: 13,
      inpsRate: INPS,
      brackets: B2026,
    });
    expect(r2025.irpef).toBe(697.95);
    expect(r2025.net).toBe(2096.2);
    expect(r2026.irpef).toBe(688.74);
    expect(r2026.net).toBe(2105.41);
  });

  it("RAL 15.000, 13 mensilità, 2026: aggiunge la somma del cuneo al 5,3%, netto 862,34 €", () => {
    const r = calculateTredicesima({
      ral: 15_000,
      mensilita: 13,
      inpsRate: INPS,
      brackets: B2026,
      taxWedgeCut: WEDGE_2026,
    });
    expect(r.gross).toBe(1153.85);
    expect(r.inps).toBe(106.04);
    expect(r.taxable).toBe(1047.81);
    expect(r.irpef).toBe(241);
    expect(r.sommaRate).toBe(0.053);
    expect(r.somma).toBe(55.53);
    expect(r.net).toBe(862.34);
  });

  it("uses the annual taxable income it is given to pick the percentage", () => {
    const r = calculateTredicesima({
      ral: 15_000,
      mensilita: 13,
      inpsRate: INPS,
      brackets: B2026,
      taxWedgeCut: WEDGE_2026,
      annualTaxableIncome: 8_000,
    });
    expect(r.sommaRate).toBe(0.071);
    expect(r.somma).toBe(74.39);
  });

  it("adds no sum without the wedge cut or above 20.000 € of taxable income", () => {
    const without = calculateTredicesima({
      ral: 15_000,
      mensilita: 13,
      inpsRate: INPS,
      brackets: B2026,
    });
    expect(without.somma).toBe(0);
    expect(without.net).toBe(806.81);
    const above = calculateTredicesima({
      ral: 30_000,
      mensilita: 13,
      inpsRate: INPS,
      brackets: B2026,
      taxWedgeCut: WEDGE_2026,
    });
    expect(above.somma).toBe(0);
    expect(above.net).toBe(1613.62);
  });

  it("returns the monthly brackets it used", () => {
    const r = calculateTredicesima({ ral: 30_000, mensilita: 13, inpsRate: INPS, brackets: B2026 });
    expect(r.monthlyBrackets).toEqual(monthlyBrackets(B2026));
  });

  it("effective rate = (INPS + IRPEF) / lordo", () => {
    const r = calculateTredicesima({ ral: 30_000, mensilita: 13, inpsRate: INPS, brackets: B2025 });
    expect(r.effectiveRate).toBeCloseTo((r.inps + r.irpef) / r.gross, 4);
  });

  it("12 mensilità → nessuna tredicesima", () => {
    const r = calculateTredicesima({ ral: 30_000, mensilita: 12, inpsRate: INPS, brackets: B2025 });
    expect(r.net).toBe(0);
    expect(r.extraMonths).toBe(0);
  });

  it("RAL non positiva → tutto a zero", () => {
    const r = calculateTredicesima({ ral: 0, mensilita: 13, inpsRate: INPS, brackets: B2025 });
    expect(r.net).toBe(0);
  });
});
