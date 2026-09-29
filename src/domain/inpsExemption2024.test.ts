import { describe, it, expect } from "vitest";
import { calculateInpsExemption2024 } from "./inpsExemption2024.ts";
import { getTaxConfig } from "./taxConfig.ts";

// Esonero contributivo, valido solo per il 2024 (L. 213/2023). 2025/2026 = null.
const CFG = getTaxConfig(2024).inpsExemption2024;
if (!CFG) throw new Error("the 2024 config must define inpsExemption2024");

describe("calculateInpsExemption2024", () => {
  it("RAL 20.000 € su 12 mensilità (mensile ≈ 1.667 ≤ 1.923) → 7% = 1.400 €", () => {
    expect(calculateInpsExemption2024(20_000, 12, CFG)).toBeCloseTo(1400, 2);
  });

  it("RAL 30.000 € su 12 mensilità (mensile 2.500 ≤ 2.692) → 6% = 1.800 €", () => {
    expect(calculateInpsExemption2024(30_000, 12, CFG)).toBeCloseTo(1800, 2);
  });

  it("RAL 36.000 € su 12 mensilità (mensile 3.000 > 2.692) → nessun esonero", () => {
    expect(calculateInpsExemption2024(36_000, 12, CFG)).toBe(0);
  });

  it("13 mensilità: soglia sulla mensilità ordinaria, tredicesima esclusa (Circ. INPS 11/2024)", () => {
    expect(calculateInpsExemption2024(33_000, 13, CFG)).toBeCloseTo(1827.69, 2);
    expect(calculateInpsExemption2024(30_000, 13, CFG)).toBeCloseTo(1661.54, 2);
  });

  it("14 mensilità: esonero sulle 12 mensilità ordinarie", () => {
    expect(calculateInpsExemption2024(35_000, 14, CFG)).toBeCloseTo(1800, 2);
  });

  it("RAL non positiva → 0", () => {
    expect(calculateInpsExemption2024(0, 13, CFG)).toBe(0);
  });
});
