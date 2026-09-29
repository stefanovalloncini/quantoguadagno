import { describe, it, expect } from "vitest";
import { calculateTrattamentoIntegrativo } from "./trattamentoIntegrativo.ts";
import { getTaxConfig } from "./taxConfig.ts";

const CFG = getTaxConfig(2026).trattamentoIntegrativo;

function ti(income: number, grossTax: number, eligibleDeductions = 0, baseWorkDeduction = 1955) {
  return calculateTrattamentoIntegrativo(
    { income, grossTax, baseWorkDeduction, eligibleDeductions },
    CFG,
  );
}

describe("calculateTrattamentoIntegrativo (DL 3/2020)", () => {
  it("fino a 15.000 €: 1.200 € se l'imposta lorda supera la detrazione meno 75 €", () => {
    expect(ti(14_000, 3220)).toBe(1200);
    expect(ti(14_000, 1880.01)).toBe(1200);
  });

  it("fino a 15.000 €: niente se l'imposta lorda non supera la detrazione meno 75 €", () => {
    expect(ti(8000, 1670.9)).toBe(0);
    expect(ti(8000, 1880)).toBe(0);
  });

  it("oltre 28.000 € non spetta", () => {
    expect(ti(30_000, 6900, 2000)).toBe(0);
  });

  it("tra 15k e 28k: nullo se le detrazioni non superano l'IRPEF", () => {
    expect(ti(20_000, 4600, 2642)).toBe(0);
  });

  it("tra 15k e 28k: parziale = min(1.200, detrazioni − IRPEF)", () => {
    expect(ti(20_000, 4000, 4320)).toBe(320);
  });

  it("parziale plafonato a 1.200 €", () => {
    expect(ti(20_000, 4000, 6000)).toBe(1200);
  });

  it("reddito non positivo → 0", () => {
    expect(ti(0, 0)).toBe(0);
  });
});
