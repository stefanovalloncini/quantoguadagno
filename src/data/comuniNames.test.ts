import { describe, expect, it } from "vitest";
import { buildComuneNames, readRegionFiles } from "../../scripts/data/build-comune-names.mjs";
import { loadComuneNames } from "./comuni.ts";
import { REGION_CODES } from "./regions.ts";

describe("comuni: l'indice dei nomi per la ricerca in tutta Italia", () => {
  it("coincide con i file delle regioni", async () => {
    const names = await loadComuneNames();
    expect(names).toEqual(buildComuneNames(readRegionFiles()));
  });

  it("copre ogni regione", async () => {
    const names = await loadComuneNames();
    expect(Object.keys(names.regions).sort()).toEqual([...REGION_CODES].sort());
  });
});
