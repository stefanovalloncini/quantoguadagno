import type {
  AutonomiYear,
  GestionAutonomiConfig,
  GestionSeparataAutonomiConfig,
} from "./taxConfig.ts";
import { round } from "./_math.ts";

export type Gestion = "gestione-separata" | "artigiani" | "commercianti" | "cassa-professionale";

export interface AutonomiInput {
  readonly imponibile: number;
  readonly gestion: Gestion;
  readonly cfg: AutonomiYear;
  readonly hasOtherPension: boolean;
  readonly isConcurrentFullTimeEmployee: boolean;
  readonly mesiAttivita: number;
  readonly forfettarioDiscount35: boolean;
  readonly newRegistrantDiscount50: boolean;
  readonly cassaManualAmount: number;
  readonly isAnte1996: boolean;
}

export interface AutonomiBreakdown {
  readonly contributoTotale: number;
  readonly contributoFisso: number;
  readonly contributoEccedenza: number;
  readonly aliquotaApplicata: number;
  readonly discountApplied: number;
  readonly notes: readonly string[];
}

function calcGestionSeparata(
  input: AutonomiInput,
  gs: GestionSeparataAutonomiConfig,
): AutonomiBreakdown {
  const useReduced = input.hasOtherPension || input.isConcurrentFullTimeEmployee;
  const rate = useReduced ? gs.reducedRate : gs.fullRate;
  const base = Math.max(0, Math.min(input.imponibile, gs.massimale));
  const contributo = base * rate;
  return {
    contributoTotale: round(contributo),
    contributoFisso: 0,
    contributoEccedenza: round(contributo),
    aliquotaApplicata: rate,
    discountApplied: 0,
    notes: useReduced ? ["aliquota-ridotta"] : [],
  };
}

function calcArtigianiCommercianti(
  input: AutonomiInput,
  g: GestionAutonomiConfig,
): AutonomiBreakdown {
  const mesi = Math.min(12, Math.max(1, Math.floor(input.mesiAttivita)));
  const share = mesi / 12;

  const fissoMinimoYearly = g.minimaleReddito * g.rate + g.maternityYearly;
  const contributoFisso = fissoMinimoYearly * share;

  // Redditi PF, quadro RR sez. I: for an activity that covers part of the year the minimale is
  // prorated by months, and so is the massimale of those insured before 1996; the massimale
  // from 1996 and the first band stay annual.
  const minimale = g.minimaleReddito * share;
  const cap = input.isAnte1996 ? g.massimaleAnte1996 * share : g.massimale;

  let eccedenza = 0;
  if (input.imponibile > minimale) {
    const overMinimo = Math.min(input.imponibile, g.band1Ceiling, cap) - minimale;
    eccedenza += Math.max(0, overMinimo) * g.rate;
    if (input.imponibile > g.band1Ceiling) {
      const over1st = Math.min(input.imponibile, cap) - g.band1Ceiling;
      eccedenza += Math.max(0, over1st) * g.rateOver1stBand;
    }
  }

  let contributoTotale = contributoFisso + eccedenza;
  let discountApplied = 0;
  const notes: string[] = [];

  if (input.newRegistrantDiscount50) {
    const discount = input.cfg.newRegistrantDiscount;
    const maternityPart = (g.maternityYearly * mesi) / 12;
    const ivsFisso = contributoFisso - maternityPart;
    contributoTotale = (ivsFisso + eccedenza) * (1 - discount) + maternityPart;
    discountApplied = discount;
    notes.push("riduzione-nuovi-iscritti-50");
  } else if (input.forfettarioDiscount35) {
    const discount = input.cfg.forfettarioDiscount;
    contributoTotale = contributoTotale * (1 - discount);
    discountApplied = discount;
    notes.push("riduzione-forfettario-35");
  }

  return {
    contributoTotale: round(contributoTotale),
    contributoFisso: round(contributoFisso),
    contributoEccedenza: round(eccedenza),
    aliquotaApplicata: g.rate,
    discountApplied,
    notes,
  };
}

export function calculateGestionContribution(input: AutonomiInput): AutonomiBreakdown {
  switch (input.gestion) {
    case "gestione-separata":
      return calcGestionSeparata(input, input.cfg.gestionSeparata);
    case "artigiani":
      return calcArtigianiCommercianti(input, input.cfg.artigiani);
    case "commercianti":
      return calcArtigianiCommercianti(input, input.cfg.commercianti);
    case "cassa-professionale": {
      const amount = Math.max(0, input.cassaManualAmount);
      return {
        contributoTotale: round(amount),
        contributoFisso: 0,
        contributoEccedenza: round(amount),
        aliquotaApplicata: input.imponibile > 0 ? amount / input.imponibile : 0,
        discountApplied: 0,
        notes: ["cassa-manuale"],
      };
    }
  }
}
