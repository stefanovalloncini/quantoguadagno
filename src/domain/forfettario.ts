import { round, sumOfCents } from "./_math.ts";
import type { AutonomiYear } from "./taxConfig.ts";
import {
  calculateGestionContribution,
  type AutonomiBreakdown,
  type Gestion,
} from "./inpsGestioni.ts";

export interface ForfettarioConfig {
  readonly startupRate: number;
  readonly standardRate: number;
  readonly startupYears: number;
  readonly maxRevenue: number;
  readonly maxEmployeeCosts: number;
}

export interface GestioneSeparataConfig {
  readonly fullRate: number;
  readonly reducedRate: number;
  readonly massimale: number;
  readonly minimaleReddito: number;
}

export type ForfettarioIneligibilityReason =
  "revenue-exceeds-limit" | "employee-costs-exceed-limit" | "concurrent-employee-ral-too-high";

export type ForfettarioPhase = "startup" | "standard";

export interface ForfettarioEligibility {
  readonly eligible: boolean;
  readonly reasons: readonly ForfettarioIneligibilityReason[];
  readonly revenueLimitPercentage: number;
  readonly warning: boolean;
}

export interface ForfettarioInput {
  readonly revenue: number;
  readonly coefficient: number;
  readonly yearsOfActivity: number;
  readonly hasOtherPension: boolean;
  readonly employeeCosts: number;
  readonly gestion?: Gestion;
  readonly mesiAttivita?: number;
  readonly isConcurrentFullTimeEmployee?: boolean;
  readonly concurrentEmployeeRal?: number;
  readonly forfettarioDiscount35?: boolean;
  readonly newRegistrantDiscount50?: boolean;
  readonly cassaManualAmount?: number;
  readonly isAnte1996?: boolean;
  readonly autonomi?: AutonomiYear;
}

export interface GestioneSeparataContribution {
  readonly contribution: number;
  readonly rate: number;
}

export interface ForfettarioBreakdown {
  readonly revenue: number;
  readonly coefficient: number;
  readonly imponibileLordo: number;
  readonly contributoInps: number;
  readonly aliquotaInps: number;
  readonly imponibileNetto: number;
  readonly aliquotaSostitutiva: number;
  readonly impostaSostitutiva: number;
  readonly totaleImposte: number;
  readonly nettoAnnuale: number;
  readonly nettoMensile: number;
  readonly pressioneFiscaleEffettiva: number;
  readonly phase: ForfettarioPhase;
  readonly eligibility: ForfettarioEligibility;
  readonly gestion: Gestion;
  readonly discountApplied: number;
  readonly contributoFisso: number;
  readonly contributoEccedenza: number;
}

interface EligibilityInput {
  readonly revenue: number;
  readonly employeeCosts: number;
  readonly isConcurrentFullTimeEmployee?: boolean;
  readonly concurrentEmployeeRal?: number;
  readonly concurrentEmployeeRalLimit?: number;
}

export function calculateForfettarioEligibility(
  revenue: number,
  employeeCosts: number,
  cfg: ForfettarioConfig,
  extra: Omit<EligibilityInput, "revenue" | "employeeCosts"> = {},
): ForfettarioEligibility {
  const reasons: readonly ForfettarioIneligibilityReason[] = [
    revenue > cfg.maxRevenue ? ("revenue-exceeds-limit" as const) : null,
    employeeCosts > cfg.maxEmployeeCosts ? ("employee-costs-exceed-limit" as const) : null,
    extra.isConcurrentFullTimeEmployee &&
    extra.concurrentEmployeeRalLimit !== undefined &&
    (extra.concurrentEmployeeRal ?? 0) > extra.concurrentEmployeeRalLimit
      ? ("concurrent-employee-ral-too-high" as const)
      : null,
  ].filter((r): r is ForfettarioIneligibilityReason => r !== null);

  const percentage = cfg.maxRevenue > 0 ? (revenue / cfg.maxRevenue) * 100 : 0;

  return {
    eligible: reasons.length === 0,
    reasons,
    revenueLimitPercentage: Math.min(percentage, 100),
    warning: percentage >= 80 && percentage <= 100 && reasons.length === 0,
  };
}

export function calculateGestioneSeparataContribution(
  imponibile: number,
  hasOtherPension: boolean,
  cfg: GestioneSeparataConfig,
): GestioneSeparataContribution {
  const rate = hasOtherPension ? cfg.reducedRate : cfg.fullRate;
  if (imponibile <= 0) {
    return { contribution: 0, rate };
  }
  const cappedBase = Math.min(imponibile, cfg.massimale);
  return { contribution: cappedBase * rate, rate };
}

function gestionContributionFromAutonomi(
  imponibile: number,
  input: ForfettarioInput,
  autonomi: AutonomiYear,
): AutonomiBreakdown {
  return calculateGestionContribution({
    imponibile,
    gestion: input.gestion ?? "gestione-separata",
    cfg: autonomi,
    hasOtherPension: input.hasOtherPension,
    isConcurrentFullTimeEmployee: input.isConcurrentFullTimeEmployee ?? false,
    mesiAttivita: input.mesiAttivita ?? 12,
    forfettarioDiscount35: input.forfettarioDiscount35 ?? false,
    newRegistrantDiscount50: input.newRegistrantDiscount50 ?? false,
    cassaManualAmount: input.cassaManualAmount ?? 0,
    isAnte1996: input.isAnte1996 ?? false,
  });
}

export function calculateForfettario(
  input: ForfettarioInput,
  cfg: ForfettarioConfig,
  gestioneSeparata: GestioneSeparataConfig,
): ForfettarioBreakdown {
  const { revenue, coefficient, yearsOfActivity, hasOtherPension, employeeCosts } = input;

  const eligibility = calculateForfettarioEligibility(
    revenue,
    employeeCosts,
    cfg,
    input.autonomi
      ? {
          ...(input.isConcurrentFullTimeEmployee !== undefined && {
            isConcurrentFullTimeEmployee: input.isConcurrentFullTimeEmployee,
          }),
          ...(input.concurrentEmployeeRal !== undefined && {
            concurrentEmployeeRal: input.concurrentEmployeeRal,
          }),
          concurrentEmployeeRalLimit: input.autonomi.concurrentEmployeeRalLimit,
        }
      : {},
  );

  const imponibileLordo = round(revenue * coefficient);

  let contributoInps: number;
  let aliquotaInps: number;
  let contributoFisso = 0;
  let contributoEccedenza: number;
  let discountApplied = 0;
  let gestionApplied: Gestion = "gestione-separata";

  if (input.autonomi) {
    const breakdown = gestionContributionFromAutonomi(imponibileLordo, input, input.autonomi);
    contributoInps = breakdown.contributoTotale;
    aliquotaInps = breakdown.aliquotaApplicata;
    contributoFisso = breakdown.contributoFisso;
    contributoEccedenza = breakdown.contributoEccedenza;
    discountApplied = breakdown.discountApplied;
    gestionApplied = input.gestion ?? "gestione-separata";
  } else {
    const rate = hasOtherPension ? gestioneSeparata.reducedRate : gestioneSeparata.fullRate;
    const cappedBase = Math.min(Math.max(0, imponibileLordo), gestioneSeparata.massimale);
    contributoInps = cappedBase * rate;
    aliquotaInps = rate;
    contributoEccedenza = contributoInps;
  }

  contributoInps = round(contributoInps);
  const imponibileNetto = Math.max(0, sumOfCents([imponibileLordo, -contributoInps]));
  const phase: ForfettarioPhase = yearsOfActivity < cfg.startupYears ? "startup" : "standard";
  const aliquotaSostitutiva = phase === "startup" ? cfg.startupRate : cfg.standardRate;
  const impostaSostitutiva = round(imponibileNetto * aliquotaSostitutiva);

  const totaleImposte = sumOfCents([contributoInps, impostaSostitutiva]);
  const nettoAnnuale = sumOfCents([revenue, -totaleImposte]);
  const nettoMensile = nettoAnnuale / 12;
  const pressioneFiscaleEffettiva = revenue > 0 ? totaleImposte / revenue : 0;

  return {
    revenue: round(revenue),
    coefficient,
    imponibileLordo: round(imponibileLordo),
    contributoInps: round(contributoInps),
    aliquotaInps,
    imponibileNetto: round(imponibileNetto),
    aliquotaSostitutiva,
    impostaSostitutiva: round(impostaSostitutiva),
    totaleImposte: round(totaleImposte),
    nettoAnnuale: round(nettoAnnuale),
    nettoMensile: round(nettoMensile),
    pressioneFiscaleEffettiva,
    phase,
    eligibility,
    gestion: gestionApplied,
    discountApplied,
    contributoFisso: round(contributoFisso),
    contributoEccedenza: round(contributoEccedenza),
  };
}
