import { describe, expect, it } from "vitest";
import { calculateGestionContribution, type AutonomiInput } from "./inpsGestioni.ts";
import { getAutonomiConfig } from "./taxConfig.ts";

const cfg = getAutonomiConfig(2026);

const base = (overrides: Partial<AutonomiInput> = {}): AutonomiInput => ({
  imponibile: 30_000,
  gestion: "gestione-separata",
  cfg,
  hasOtherPension: false,
  isConcurrentFullTimeEmployee: false,
  mesiAttivita: 12,
  forfettarioDiscount35: false,
  newRegistrantDiscount50: false,
  cassaManualAmount: 0,
  isAnte1996: false,
  ...overrides,
});

describe("Gestione Separata", () => {
  it("applies the full rate when no other pension", () => {
    const r = calculateGestionContribution(base());
    expect(r.aliquotaApplicata).toBe(0.2607);
    expect(r.contributoTotale).toBeCloseTo(7_821, 0);
  });

  it("applies the reduced rate when other pension is held", () => {
    const r = calculateGestionContribution(base({ hasOtherPension: true }));
    expect(r.aliquotaApplicata).toBe(0.24);
    expect(r.contributoTotale).toBeCloseTo(7_200, 0);
  });

  it("applies the reduced rate when concurrent full-time employee", () => {
    const r = calculateGestionContribution(base({ isConcurrentFullTimeEmployee: true }));
    expect(r.aliquotaApplicata).toBe(0.24);
  });

  it("caps the contribution base at the massimale", () => {
    const r = calculateGestionContribution(base({ imponibile: 200_000 }));
    expect(r.contributoTotale).toBeCloseTo(cfg.gestionSeparata.massimale * 0.2607, 0);
  });
});

describe("Artigiani", () => {
  it("applies the minimo and excess split at the band ceiling", () => {
    const r = calculateGestionContribution(base({ gestion: "artigiani" }));
    // fixed = 18_808 * 0.24 + 7.44 = 4_521.36
    expect(r.contributoFisso).toBeCloseTo(4_521.36, 1);
    // excess = (30_000 - 18_808) * 0.24 = 2_686.08
    expect(r.contributoEccedenza).toBeCloseTo(2_686.08, 1);
    expect(r.contributoTotale).toBeCloseTo(4_521.36 + 2_686.08, 1);
  });

  it("uses the higher rate above the band-1 ceiling", () => {
    const r = calculateGestionContribution(base({ gestion: "artigiani", imponibile: 80_000 }));
    // fixed = 4_521.36
    // band1 = (56_224 - 18_808) * 0.24 = 8_979.84
    // overBand1 = (80_000 - 56_224) * 0.25 = 5_944
    // total = 4_521.36 + 8_979.84 + 5_944 = 19_445.20
    expect(r.contributoTotale).toBeCloseTo(19_445.2, 0);
  });

  it("prorates the contributo fisso when mesiAttivita < 12", () => {
    const r = calculateGestionContribution(
      base({ gestion: "artigiani", mesiAttivita: 6, imponibile: 18_808 }),
    );
    expect(r.contributoFisso).toBeCloseTo(4_521.36 / 2, 1);
  });

  it("applies the 35 % discount on the total when forfettarioDiscount35", () => {
    const noDiscount = calculateGestionContribution(base({ gestion: "artigiani" }));
    const withDiscount = calculateGestionContribution(
      base({ gestion: "artigiani", forfettarioDiscount35: true }),
    );
    expect(withDiscount.contributoTotale).toBeCloseTo(noDiscount.contributoTotale * 0.65, 1);
    expect(withDiscount.discountApplied).toBe(0.35);
  });

  it("applies the 50 % discount only on IVS components, preserving maternity", () => {
    const r = calculateGestionContribution(
      base({ gestion: "artigiani", newRegistrantDiscount50: true }),
    );
    // ivsFisso = 4_521.36 - 7.44 = 4_513.92 → halved = 2_256.96
    // eccedenza = 2_686.08 → halved = 1_343.04
    // total = 2_256.96 + 1_343.04 + 7.44 = 3_607.44
    expect(r.contributoTotale).toBeCloseTo(3_607.44, 1);
    expect(r.discountApplied).toBe(0.5);
  });
});

describe("Commercianti", () => {
  it("uses the 0.2448 / 0.2548 rates", () => {
    const r = calculateGestionContribution(base({ gestion: "commercianti" }));
    expect(r.aliquotaApplicata).toBe(0.2448);
  });
});

describe("Ante-1996 massimale", () => {
  it("caps the highest band at the ante-1996 massimale", () => {
    const ante = calculateGestionContribution(
      base({ gestion: "artigiani", imponibile: 100_000, isAnte1996: true }),
    );
    const post = calculateGestionContribution(
      base({ gestion: "artigiani", imponibile: 100_000, isAnte1996: false }),
    );
    // ante1996 cap is 86_334; post is 122_295 — ante imponibile is capped lower, so post > ante.
    expect(post.contributoTotale).toBeGreaterThan(ante.contributoTotale);
  });
});

describe("Cassa professionale (manual)", () => {
  it("returns the manual amount verbatim", () => {
    const r = calculateGestionContribution(
      base({ gestion: "cassa-professionale", cassaManualAmount: 3_000 }),
    );
    expect(r.contributoTotale).toBe(3_000);
  });

  it("clamps negative manual amounts to zero", () => {
    const r = calculateGestionContribution(
      base({ gestion: "cassa-professionale", cassaManualAmount: -500 }),
    );
    expect(r.contributoTotale).toBe(0);
  });
});
