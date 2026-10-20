import type { RegionCode, SupportedYear } from "@/data/index.ts";
import { round, sumOfCents } from "./_math.ts";
import {
  calculateForfettario,
  type ForfettarioBreakdown,
  type ForfettarioIneligibilityReason,
} from "./forfettario.ts";
import { calculateGestionContribution, type Gestion } from "./inpsGestioni.ts";
import { applyProgressiveBrackets } from "./irpef.ts";
import type { MunicipalTaxInput } from "./municipalTaxCalculations.ts";
import { calculateLocalTaxes } from "./regionalTaxCalculations.ts";
import { calculateSelfEmployedDeduction } from "./selfEmployedDeduction.ts";
import { getAutonomiConfig, getTaxConfig } from "./taxConfig.ts";

const MONTHS_IN_YEAR = 12;
const FIRST_YEAR_OF_ACTIVITY = 1;

export interface OrdinarioInput {
  readonly revenue: number;
  readonly costs: number;
  readonly taxYear: SupportedYear;
  readonly regionCode: RegionCode;
  readonly municipalTaxRate: MunicipalTaxInput;
  readonly gestion: Gestion;
  readonly hasOtherPension: boolean;
  readonly mesiAttivita: number;
  readonly cassaManualAmount: number;
}

export interface OrdinarioBreakdown {
  readonly revenue: number;
  readonly costs: number;
  /** Compensi or ricavi minus costs (art. 54 and 66 TUIR); negative for a loss. */
  readonly income: number;
  readonly contributions: number;
  readonly contributionRate: number;
  /** The Artigiani and Commercianti minimum, already prorated by months. */
  readonly fixedContribution: number;
  /** Income minus contributions, which are oneri deducibili (art. 10 c. 1 lett. e) TUIR). */
  readonly taxableIncome: number;
  readonly irpefGross: number;
  /** Art. 13 c. 5 TUIR, on the reddito complessivo before the contributions. */
  readonly deductionDue: number;
  /** The part of the deduction the gross tax can absorb. */
  readonly deductionUsed: number;
  readonly irpefNet: number;
  readonly regionalTax: number;
  readonly municipalTax: number;
  readonly totalTaxes: number;
  readonly netAnnual: number;
  readonly netMonthly: number;
}

export function calculateOrdinario(input: OrdinarioInput): OrdinarioBreakdown {
  const cfg = getTaxConfig(input.taxYear);
  const revenue = round(Math.max(0, input.revenue));
  const costs = round(Math.max(0, input.costs));
  const income = sumOfCents([revenue, -costs]);
  const incomeForTax = Math.max(0, income);

  const contribution = calculateGestionContribution({
    imponibile: incomeForTax,
    gestion: input.gestion,
    cfg: getAutonomiConfig(input.taxYear),
    hasOtherPension: input.hasOtherPension,
    isConcurrentFullTimeEmployee: false,
    mesiAttivita: input.mesiAttivita,
    forfettarioDiscount35: false,
    newRegistrantDiscount50: false,
    cassaManualAmount: input.cassaManualAmount,
    isAnte1996: false,
  });
  const contributions = contribution.contributoTotale;

  const taxableIncome = Math.max(0, sumOfCents([incomeForTax, -contributions]));
  const irpefGross = round(applyProgressiveBrackets(taxableIncome, cfg.irpefBrackets));
  const deductionDue = calculateSelfEmployedDeduction(incomeForTax, cfg.selfEmployedDeduction);
  const deductionUsed = Math.min(deductionDue, irpefGross);
  const irpefNet = sumOfCents([irpefGross, -deductionUsed]);

  // D.Lgs. 446/1997 art. 50 c. 2 and D.Lgs. 360/1998 art. 1 c. 4: the surcharges are due only
  // when some IRPEF is due after the deductions.
  const local = calculateLocalTaxes(
    taxableIncome,
    input.regionCode,
    cfg.year,
    input.municipalTaxRate,
  );
  const irpefDue = irpefNet > 0;
  const regionalTax = irpefDue ? round(local.regionalTax) : 0;
  const municipalTax = irpefDue ? round(local.municipalTax) : 0;

  const totalTaxes = sumOfCents([irpefNet, regionalTax, municipalTax]);
  const netAnnual = sumOfCents([income, -contributions, -totalTaxes]);

  return {
    revenue,
    costs,
    income,
    contributions,
    contributionRate: contribution.aliquotaApplicata,
    fixedContribution: contribution.contributoFisso,
    taxableIncome,
    irpefGross,
    deductionDue,
    deductionUsed,
    irpefNet,
    regionalTax,
    municipalTax,
    totalTaxes,
    netAnnual,
    netMonthly: round(netAnnual / MONTHS_IN_YEAR),
  };
}

export interface ForfettarioOption {
  readonly coefficient: number;
  readonly startup: boolean;
}

export interface RegimeComparison {
  readonly forfettario: ForfettarioBreakdown;
  readonly eligible: boolean;
  readonly reasons: readonly ForfettarioIneligibilityReason[];
  /** The forfettario net after paying the same real costs, which it does not deduct. */
  readonly netAnnual: number;
  /** Forfettario minus ordinario: positive when the forfettario leaves more. */
  readonly difference: number;
}

export function compareWithForfettario(
  input: OrdinarioInput,
  ordinario: OrdinarioBreakdown,
  option: ForfettarioOption,
): RegimeComparison {
  const cfg = getTaxConfig(input.taxYear);
  const forfettario = calculateForfettario(
    {
      revenue: ordinario.revenue,
      coefficient: option.coefficient,
      yearsOfActivity: option.startup ? FIRST_YEAR_OF_ACTIVITY : cfg.forfettario.startupYears,
      hasOtherPension: input.hasOtherPension,
      employeeCosts: 0,
      gestion: input.gestion,
      mesiAttivita: input.mesiAttivita,
      cassaManualAmount: input.cassaManualAmount,
      autonomi: getAutonomiConfig(input.taxYear),
    },
    cfg.forfettario,
    cfg.gestioneSeparata,
  );
  const netAnnual = sumOfCents([forfettario.nettoAnnuale, -ordinario.costs]);
  return {
    forfettario,
    eligible: forfettario.eligibility.eligible,
    reasons: forfettario.eligibility.reasons,
    netAnnual,
    difference: sumOfCents([netAnnual, -ordinario.netAnnual]),
  };
}
