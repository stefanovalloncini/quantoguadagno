import { describe, expect, it } from "vitest";
import { calculateTredicesima, getTaxConfig } from "@/domain/index.ts";
import { computeTredicesima } from "./compute.ts";
import { TREDICESIMA_DEFAULTS, updateRal, updateTaxYear } from "./state.ts";

const INPS_2026 = getTaxConfig(2026).inps.standardRate;

describe("computeTredicesima", () => {
  it("matches calling the engine directly for the defaults", () => {
    expect(computeTredicesima(TREDICESIMA_DEFAULTS, "it")).toEqual(
      calculateTredicesima({
        ral: 30_000,
        mensilita: 13,
        inpsRate: INPS_2026,
        brackets: getTaxConfig(2026).irpefBrackets,
        taxWedgeCut: getTaxConfig(2026).taxWedgeCut,
      }),
    );
  });

  it("uses the brackets and INPS rate for the selected tax year", () => {
    const state = updateTaxYear(TREDICESIMA_DEFAULTS, 2025);
    expect(computeTredicesima(state, "it")).toEqual(
      calculateTredicesima({
        ral: 30_000,
        mensilita: 13,
        inpsRate: getTaxConfig(2025).inps.standardRate,
        brackets: getTaxConfig(2025).irpefBrackets,
        taxWedgeCut: getTaxConfig(2025).taxWedgeCut,
      }),
    );
  });

  it("adds the wedge cut sum for a low RAL from 2025, not in 2024", () => {
    const low = updateRal(TREDICESIMA_DEFAULTS, "15.000");
    expect(computeTredicesima(low, "it").somma).toBe(55.53);
    expect(computeTredicesima(updateTaxYear(low, 2024), "it").somma).toBe(0);
  });

  it("parses a shorthand RAL before calling the engine", () => {
    const state = updateRal(TREDICESIMA_DEFAULTS, "45k");
    expect(computeTredicesima(state, "it").gross).toBeCloseTo(45_000 / 13, 2);
  });

  it("treats unparseable text as a zero RAL instead of throwing", () => {
    const state = updateRal(TREDICESIMA_DEFAULTS, "abc");
    expect(computeTredicesima(state, "it").net).toBe(0);
  });

  it("falls back to the latest supported year for an out-of-range tax year", () => {
    const state = updateTaxYear(TREDICESIMA_DEFAULTS, 1999 as typeof TREDICESIMA_DEFAULTS.taxYear);
    expect(computeTredicesima(state, "it")).toEqual(computeTredicesima(TREDICESIMA_DEFAULTS, "it"));
  });
});
