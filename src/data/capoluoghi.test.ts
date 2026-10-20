import { describe, expect, it } from "vitest";
import { CAPOLUOGHI } from "./capoluoghi.ts";
import { comunaleRuleFor, findComune, loadRegionComuni } from "./comuni.ts";
import { REGION_CODES } from "./regions.ts";
import { SUPPORTED_YEARS } from "./registry.ts";

describe("capoluoghi di regione", () => {
  it("name one comune for every region and autonomous province", () => {
    expect(Object.keys(CAPOLUOGHI).sort()).toEqual([...REGION_CODES].sort());
    const ids = Object.values(CAPOLUOGHI).map((capoluogo) => capoluogo.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(REGION_CODES)("point to a comune of %s with the expected name", async (region) => {
    const { id, name } = CAPOLUOGHI[region];
    const comune = findComune(await loadRegionComuni(region), id);
    expect(comune?.name).toBe(name);
  });

  it.each(REGION_CODES)(
    "have an addizionale rule in every supported year in %s",
    async (region) => {
      const comune = findComune(await loadRegionComuni(region), CAPOLUOGHI[region].id);
      if (comune === undefined) throw new Error(`missing capoluogo of ${region}`);
      for (const year of SUPPORTED_YEARS) expect(comunaleRuleFor(comune, year)).not.toBeNull();
    },
  );
});
