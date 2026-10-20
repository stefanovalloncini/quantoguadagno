import {
  employerCostBreakdown,
  type EmployerCostBreakdown,
  type EmployerCostLine,
} from "@/islands/home/employerCostBreakdown.ts";
import type { EmployerCostResult } from "./compute.ts";

export interface EmployerCostLedger {
  readonly gross: number;
  readonly inps: number;
  readonly tfr: number;
  readonly others: readonly EmployerCostLine[];
  readonly othersTotal: number;
  readonly total: number;
  readonly totalMonthly: number;
}

function cents(amount: number): number {
  return Math.round(amount * 100);
}

export function employerCostLedger(cost: EmployerCostBreakdown): EmployerCostLedger {
  const othersCents = cost.otherCosts.reduce((sum, line) => sum + cents(line.amount), 0);
  const totalCents =
    cents(cost.grossAnnual) + cents(cost.employerInps) + cents(cost.tfr) + othersCents;
  return {
    gross: cost.grossAnnual,
    inps: cost.employerInps,
    tfr: cost.tfr,
    others: cost.otherCosts,
    othersTotal: othersCents / 100,
    total: totalCents / 100,
    totalMonthly: Math.round(totalCents / 12) / 100,
  };
}

export interface EmployerCostDerived {
  readonly cost: EmployerCostBreakdown;
  readonly ledger: EmployerCostLedger;
  readonly grossAnnual: number;
  readonly netAnnual: number;
  readonly netMonthly: number;
}

export function deriveEmployerCost(result: EmployerCostResult): EmployerCostDerived {
  const cost = employerCostBreakdown(result.breakdown);
  return {
    cost,
    ledger: employerCostLedger(cost),
    grossAnnual: result.breakdown.grossAnnual,
    netAnnual: result.breakdown.netAnnual,
    netMonthly: result.breakdown.netMonthly,
  };
}
