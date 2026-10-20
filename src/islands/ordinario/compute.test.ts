import { describe, expect, it } from "vitest";
import { isComuniDatasetVerified, type Comune } from "@/data/index.ts";
import { computeOrdinario, ordinarioValuesToVerify } from "./compute.ts";
import { checkOrdinario, ordinarioDefaults, type OrdinarioValues } from "./state.ts";

function defaultValues(): OrdinarioValues {
  const { values } = checkOrdinario(ordinarioDefaults("it"), "it");
  if (values === null) throw new Error("The defaults should be valid");
  return values;
}

const VALUES = defaultValues();

const FLAT_COMUNE: Comune = {
  id: "Z999",
  name: "Comune di prova",
  province: "MI",
  years: { "2026": { rate: 0.5 } },
};

describe("computeOrdinario", () => {
  it("gives the hand-computed result for the defaults", () => {
    const result = computeOrdinario(VALUES, null);
    expect(result.municipal).toEqual({ kind: "manual", rate: 0.008 });
    expect(result.breakdown.netAnnual).toBe(22_186.97);
    expect(result.coefficient).toBe(0.78);
    expect(result.comparison.netAnnual).toBe(25_507.79);
    expect(result.comparison.difference).toBe(3320.82);
  });

  it("uses the chosen comune for the municipal surcharge", () => {
    const result = computeOrdinario({ ...VALUES, comune: "Z999" }, FLAT_COMUNE);
    expect(result.municipal.kind).toBe("comune");
    expect(result.breakdown.municipalTax).toBe(147.86);
  });

  it("falls back to the typed rate while the comune is not loaded", () => {
    const result = computeOrdinario({ ...VALUES, comune: "Z999" }, null);
    expect(result.municipal).toEqual({ kind: "manual", rate: 0.008 });
  });

  it("compares with the startup rate when asked", () => {
    expect(computeOrdinario({ ...VALUES, startup: true }, null).comparison.netAnnual).toBe(
      28_391.06,
    );
  });
});

describe("ordinarioValuesToVerify", () => {
  const scope = { taxYear: 2026, gestion: "gestione-separata", regionCode: "lombardia" } as const;

  it("counts the comuni dataset only when a comune is chosen", () => {
    const without = ordinarioValuesToVerify({ ...scope, withComune: false });
    const withComune = ordinarioValuesToVerify({ ...scope, withComune: true });
    expect(withComune - without).toBe(isComuniDatasetVerified() ? 0 : 1);
  });

  it("does not count the contribution values of a professional fund", () => {
    const separata = ordinarioValuesToVerify({ ...scope, withComune: false });
    const cassa = ordinarioValuesToVerify({
      ...scope,
      gestion: "cassa-professionale",
      withComune: false,
    });
    expect(cassa).toBeLessThanOrEqual(separata);
  });
});
