import { describe, expect, it } from "vitest";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import { ACTIVITY_COEFFICIENTS } from "@/data/forfettarioActivities.ts";
import { calculateForfettario, getAutonomiConfig, getTaxConfig } from "@/domain/index.ts";
import { computeForfettario } from "./compute.ts";
import {
  FORFETTARIO_DEFAULTS,
  updateGestion,
  updateMesiAttivita,
  updateRevenue,
  updateYearsOfActivity,
} from "./state.ts";

const CFG = getTaxConfig(LATEST_SUPPORTED_YEAR);
const AUTONOMI = getAutonomiConfig(LATEST_SUPPORTED_YEAR);

describe("computeForfettario", () => {
  it("matches calling the engine directly for the defaults (startup professionisti 30k)", () => {
    expect(computeForfettario(FORFETTARIO_DEFAULTS, "it")).toEqual(
      calculateForfettario(
        {
          revenue: 30_000,
          coefficient: ACTIVITY_COEFFICIENTS.professionisti.coefficient,
          yearsOfActivity: 1,
          hasOtherPension: false,
          employeeCosts: 0,
          gestion: "gestione-separata",
          mesiAttivita: 12,
          isConcurrentFullTimeEmployee: false,
          concurrentEmployeeRal: 0,
          forfettarioDiscount35: false,
          newRegistrantDiscount50: false,
          cassaManualAmount: 0,
          isAnte1996: false,
          autonomi: AUTONOMI,
        },
        CFG.forfettario,
        CFG.gestioneSeparata,
      ),
    );
  });

  it("switches to the standard rate once past the startup years", () => {
    const state = updateYearsOfActivity(FORFETTARIO_DEFAULTS, 7);
    expect(computeForfettario(state, "it").aliquotaSostitutiva).toBe(0.15);
  });

  it("parses a shorthand revenue before calling the engine", () => {
    const state = updateRevenue(FORFETTARIO_DEFAULTS, "45k");
    expect(computeForfettario(state, "it").imponibileLordo).toBeCloseTo(
      45_000 * ACTIVITY_COEFFICIENTS.professionisti.coefficient,
      2,
    );
  });

  it("treats unparseable text as a zero revenue instead of throwing", () => {
    const state = updateRevenue(FORFETTARIO_DEFAULTS, "abc");
    expect(computeForfettario(state, "it").revenue).toBe(0);
  });

  it("routes artigiani through the fixed-minimum plus excess split", () => {
    const state = updateGestion(updateYearsOfActivity(FORFETTARIO_DEFAULTS, 7), "artigiani");
    const result = computeForfettario(state, "it");
    expect(result.gestion).toBe("artigiani");
    expect(result.contributoFisso).toBeGreaterThan(0);
  });

  it("prorates the artigiani/commercianti minimum by months of activity", () => {
    const fullYear = computeForfettario(updateGestion(FORFETTARIO_DEFAULTS, "artigiani"), "it");
    const sixMonths = computeForfettario(
      updateMesiAttivita(updateGestion(FORFETTARIO_DEFAULTS, "artigiani"), 6),
      "it",
    );
    expect(sixMonths.contributoFisso).toBeCloseTo(fullYear.contributoFisso / 2, 0);
  });
});
