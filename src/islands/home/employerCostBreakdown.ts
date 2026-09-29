import type { SalaryBreakdown } from "@/domain/composer.ts";

export type EmployerCostLineId =
  "inail" | "maternity" | "naspi" | "naspiAdditional" | "cig" | "other";

export interface EmployerCostLine {
  readonly id: EmployerCostLineId;
  readonly amount: number;
}

export interface EmployerCostBreakdown {
  readonly grossAnnual: number;
  readonly employerInps: number;
  readonly employerInpsRate: number;
  readonly tfr: number;
  readonly tfrRate: number;
  readonly otherCosts: readonly EmployerCostLine[];
  readonly totalOtherCosts: number;
  readonly total: number;
  readonly totalMonthly: number;
  readonly costPerNetEuro: number | null;
}

export function employerCostBreakdown(breakdown: SalaryBreakdown): EmployerCostBreakdown {
  const otherCosts: readonly EmployerCostLine[] = [
    { id: "inail", amount: breakdown.inailContribution },
    { id: "maternity", amount: breakdown.maternityContribution },
    { id: "naspi", amount: breakdown.naspiContribution },
    { id: "naspiAdditional", amount: breakdown.naspiAdditionalContribution },
    { id: "cig", amount: breakdown.cigContribution },
    { id: "other", amount: breakdown.otherEmployerContributions },
  ];
  const showsRatio = breakdown.netAnnual > 0 && breakdown.totalEmployerCost > 0;
  return {
    grossAnnual: breakdown.grossAnnual,
    employerInps: breakdown.employerInps,
    employerInpsRate: breakdown.employerInpsRate,
    tfr: breakdown.tfrAnnual,
    tfrRate: breakdown.tfrRate,
    otherCosts: otherCosts.filter((line) => line.amount > 0),
    totalOtherCosts: breakdown.totalOtherEmployerCosts,
    total: breakdown.totalEmployerCost,
    totalMonthly: breakdown.totalEmployerCostMonthly,
    costPerNetEuro: showsRatio ? breakdown.employerCostPerNetEuro : null,
  };
}
