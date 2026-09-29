import { describe, expect, it } from "vitest";
import { SUPPORTED_YEARS, type SupportedYear } from "@/data/index.ts";
import { getAutonomiConfig, getTaxConfig } from "./taxConfig.ts";

interface CircularValues {
  readonly source: string;
  readonly minimale: number;
  readonly band1Ceiling: number;
  readonly massimale: number;
  readonly massimaleAnte1996: number;
  readonly minimumArtigiani: number;
  readonly minimumCommercianti: number;
  readonly concurrentEmployeeRalLimit: number;
}

const CIRCULARS: Record<SupportedYear, CircularValues> = {
  2024: {
    source: "Circ. INPS 33/2024",
    minimale: 18_415,
    band1Ceiling: 55_008,
    massimale: 119_650,
    massimaleAnte1996: 91_680,
    minimumArtigiani: 4427.04,
    minimumCommercianti: 4515.43,
    concurrentEmployeeRalLimit: 30_000,
  },
  2025: {
    source: "Circ. INPS 38/2025",
    minimale: 18_555,
    band1Ceiling: 55_448,
    massimale: 120_607,
    massimaleAnte1996: 92_413,
    minimumArtigiani: 4460.64,
    minimumCommercianti: 4549.7,
    concurrentEmployeeRalLimit: 35_000,
  },
  2026: {
    source: "Circ. INPS 14/2026",
    minimale: 18_808,
    band1Ceiling: 56_224,
    massimale: 122_295,
    massimaleAnte1996: 93_707,
    minimumArtigiani: 4521.36,
    minimumCommercianti: 4611.64,
    concurrentEmployeeRalLimit: 35_000,
  },
};

function minimumContribution(minimale: number, rate: number, maternity: number): number {
  return Math.round((minimale * rate + maternity) * 100) / 100;
}

describe("contributi INPS di artigiani e commercianti", () => {
  it.each(SUPPORTED_YEARS)("%i: valori della circolare", (year) => {
    const expected = CIRCULARS[year];
    const cfg = getAutonomiConfig(year);
    for (const gestion of [cfg.artigiani, cfg.commercianti]) {
      expect(gestion.minimaleReddito).toBe(expected.minimale);
      expect(gestion.band1Ceiling).toBe(expected.band1Ceiling);
      expect(gestion.massimale).toBe(expected.massimale);
      expect(gestion.massimaleAnte1996).toBe(expected.massimaleAnte1996);
    }
    expect(cfg.gestionSeparata.minimaleReddito).toBe(expected.minimale);
    expect(cfg.gestionSeparata.massimale).toBe(expected.massimale);
    expect(cfg.concurrentEmployeeRalLimit).toBe(expected.concurrentEmployeeRalLimit);
  });

  it.each(SUPPORTED_YEARS)("%i: contributo minimo pubblicato da INPS", (year) => {
    const expected = CIRCULARS[year];
    const { artigiani, commercianti } = getAutonomiConfig(year);
    expect(
      minimumContribution(artigiani.minimaleReddito, artigiani.rate, artigiani.maternityYearly),
    ).toBe(expected.minimumArtigiani);
    expect(
      minimumContribution(
        commercianti.minimaleReddito,
        commercianti.rate,
        commercianti.maternityYearly,
      ),
    ).toBe(expected.minimumCommercianti);
  });

  it("il massimale ante 1996 è la prima fascia più due terzi", () => {
    for (const year of SUPPORTED_YEARS) {
      const { artigiani } = getAutonomiConfig(year);
      expect(artigiani.massimaleAnte1996).toBe(Math.round((artigiani.band1Ceiling * 5) / 3));
    }
  });

  it("i valori rivalutati crescono ogni anno: nessun anno copiato dal successivo", () => {
    for (let i = 1; i < SUPPORTED_YEARS.length; i++) {
      const previousYear = SUPPORTED_YEARS[i - 1];
      const year = SUPPORTED_YEARS[i];
      if (previousYear === undefined || year === undefined) continue;
      const before = getAutonomiConfig(previousYear);
      const after = getAutonomiConfig(year);
      expect(after.artigiani.minimaleReddito).toBeGreaterThan(before.artigiani.minimaleReddito);
      expect(after.artigiani.band1Ceiling).toBeGreaterThan(before.artigiani.band1Ceiling);
      expect(after.artigiani.massimale).toBeGreaterThan(before.artigiani.massimale);
      expect(after.artigiani.massimaleAnte1996).toBeGreaterThan(before.artigiani.massimaleAnte1996);
      expect(after.gestionSeparata.massimale).toBeGreaterThan(before.gestionSeparata.massimale);
      expect(getTaxConfig(year).inps.ceiling).toBeGreaterThan(
        getTaxConfig(previousYear).inps.ceiling,
      );
      expect(getTaxConfig(year).inps.massimale).toBeGreaterThan(
        getTaxConfig(previousYear).inps.massimale,
      );
    }
  });

  it("la Gestione Separata ha una sola fonte per anno", () => {
    for (const year of SUPPORTED_YEARS) {
      expect(getTaxConfig(year).gestioneSeparata).toBe(getAutonomiConfig(year).gestionSeparata);
    }
  });
});
