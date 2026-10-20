import { describe, expect, it } from "vitest";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import { ACTIVITY_COEFFICIENTS } from "@/data/forfettarioActivities.ts";
import { calculateForfettario, getAutonomiConfig, getTaxConfig } from "@/domain/index.ts";
import {
  deriveForfettario,
  discountRecapKey,
  forfettarioIneligibilityMessageKey,
  forfettarioNotice,
  gestionMessageKey,
} from "./derive.ts";
import { FORFETTARIO_DEFAULTS, updateGestion } from "./state.ts";

const CFG = getTaxConfig(LATEST_SUPPORTED_YEAR);
const AUTONOMI = getAutonomiConfig(LATEST_SUPPORTED_YEAR);

function forfettarioResult(revenue: number) {
  return calculateForfettario(
    {
      revenue,
      coefficient: ACTIVITY_COEFFICIENTS.professionisti.coefficient,
      yearsOfActivity: 1,
      hasOtherPension: false,
      employeeCosts: 0,
      autonomi: AUTONOMI,
    },
    CFG.forfettario,
    CFG.gestioneSeparata,
  );
}

describe("gestionMessageKey", () => {
  it("maps every gestion to its message key", () => {
    expect(gestionMessageKey("gestione-separata")).toBe(
      "forfettario.breakdown.inps.gestione-separata",
    );
    expect(gestionMessageKey("cassa-professionale")).toBe(
      "forfettario.breakdown.inps.cassa-professionale",
    );
  });
});

describe("forfettarioIneligibilityMessageKey", () => {
  it("maps every reason to its message key", () => {
    expect(forfettarioIneligibilityMessageKey("revenue-exceeds-limit")).toBe(
      "forfettario.eligibility.revenueExceeded",
    );
  });
});

describe("forfettarioNotice", () => {
  it("is none when comfortably under the limit", () => {
    const result = forfettarioResult(50_000);
    expect(forfettarioNotice(result.eligibility)).toEqual({ kind: "none" });
  });

  it("is a warning between 80% and 100% of the limit", () => {
    const result = forfettarioResult(70_000);
    expect(forfettarioNotice(result.eligibility)).toEqual({ kind: "warning", percent: 82 });
  });

  it("is ineligible with mapped reasons past the limit", () => {
    const result = forfettarioResult(90_000);
    expect(forfettarioNotice(result.eligibility)).toEqual({
      kind: "ineligible",
      reasons: ["revenue-exceeds-limit"],
      reasonMessageKeys: ["forfettario.eligibility.revenueExceeded"],
    });
  });
});

describe("discountRecapKey", () => {
  it("maps 0.35 and 0.5 to their note keys and everything else to null", () => {
    expect(discountRecapKey(0.35)).toBe("forfettario.recap.previdenza.discount35");
    expect(discountRecapKey(0.5)).toBe("forfettario.recap.previdenza.discount50");
    expect(discountRecapKey(0)).toBeNull();
  });
});

describe("deriveForfettario", () => {
  it("flags artigiani/commercianti and cassa-professionale views", () => {
    const result = forfettarioResult(30_000);
    expect(deriveForfettario(FORFETTARIO_DEFAULTS, result).isArtigianiOrCommercianti).toBe(false);
    expect(deriveForfettario(FORFETTARIO_DEFAULTS, result).isCassaManual).toBe(false);

    const artigiani = updateGestion(FORFETTARIO_DEFAULTS, "artigiani");
    expect(deriveForfettario(artigiani, result).isArtigianiOrCommercianti).toBe(true);

    const cassa = updateGestion(FORFETTARIO_DEFAULTS, "cassa-professionale");
    expect(deriveForfettario(cassa, result).isCassaManual).toBe(true);
  });
});
