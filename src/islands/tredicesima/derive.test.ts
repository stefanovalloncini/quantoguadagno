import { describe, expect, it } from "vitest";
import { calculateTredicesima, getTaxConfig } from "@/domain/index.ts";
import { deriveTredicesima } from "./derive.ts";

const CFG = getTaxConfig(2026);

describe("deriveTredicesima", () => {
  it("hides the combined total for 13 mensilita", () => {
    const result = calculateTredicesima({
      ral: 30_000,
      mensilita: 13,
      inpsRate: CFG.inps.standardRate,
      brackets: CFG.irpefBrackets,
    });
    expect(deriveTredicesima(result)).toEqual({ showCombinedTotal: false });
  });

  it("shows the combined total for 14 mensilita", () => {
    const result = calculateTredicesima({
      ral: 30_000,
      mensilita: 14,
      inpsRate: CFG.inps.standardRate,
      brackets: CFG.irpefBrackets,
    });
    expect(deriveTredicesima(result)).toEqual({ showCombinedTotal: true });
  });
});
