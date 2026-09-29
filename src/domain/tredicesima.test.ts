import { describe, it, expect } from "vitest";
import { calculateTredicesima } from "./tredicesima.ts";
import { getTaxConfig } from "./taxConfig.ts";

const B2025 = getTaxConfig(2025).irpefBrackets;
const B2026 = getTaxConfig(2026).irpefBrackets;
const INPS = 0.0919;

// Net of the 13th: gross/mensilità − INPS − IRPEF at the marginal rate, no
// detrazioni, no addizionali. Golden vectors traced to docs/data-verification.
describe("calculateTredicesima", () => {
  it("RAL 30.000, 13 mensilità → netto ≈ 1.613,62 € (marginale 23%)", () => {
    const r = calculateTredicesima({ ral: 30_000, mensilita: 13, inpsRate: INPS, brackets: B2025 });
    expect(r.gross).toBeCloseTo(2307.69, 2);
    expect(r.inps).toBeCloseTo(212.08, 2);
    expect(r.marginalRate).toBe(0.23);
    expect(r.irpef).toBeCloseTo(481.99, 2);
    expect(r.net).toBeCloseTo(1613.62, 2);
    expect(r.extraMonths).toBe(1);
    expect(r.netTotal).toBeCloseTo(1613.62, 2);
  });

  it("RAL 60.000, 13 mensilità → marginale 43%, netto ≈ 2.389,00 €", () => {
    const r = calculateTredicesima({ ral: 60_000, mensilita: 13, inpsRate: INPS, brackets: B2025 });
    expect(r.marginalRate).toBe(0.43);
    expect(r.irpef).toBeCloseTo(1802.23, 2);
    expect(r.net).toBeCloseTo(2389.0, 2);
  });

  it("14 mensilità → due mensilità extra di pari importo", () => {
    const r = calculateTredicesima({ ral: 30_000, mensilita: 14, inpsRate: INPS, brackets: B2025 });
    expect(r.extraMonths).toBe(2);
    expect(r.netTotal).toBeCloseTo(r.net * 2, 2);
    expect(r.grossTotal).toBeCloseTo(r.gross * 2, 2);
  });

  it("il taglio 2026 del secondo scaglione (33%) lascia più netto del 2025 (35%)", () => {
    const net2025 = calculateTredicesima({
      ral: 40_000,
      mensilita: 13,
      inpsRate: INPS,
      brackets: B2025,
    });
    const net2026 = calculateTredicesima({
      ral: 40_000,
      mensilita: 13,
      inpsRate: INPS,
      brackets: B2026,
    });
    expect(net2025.marginalRate).toBe(0.35);
    expect(net2026.marginalRate).toBe(0.33);
    expect(net2026.net).toBeGreaterThan(net2025.net);
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
