import type { NaspiConfig } from "./taxConfig.ts";
import { round, sumOfCents } from "./_math.ts";
import { applyProgressiveBrackets, type IrpefBracket } from "./irpef.ts";

export type NaspiIneligibilityReason = "insufficient-weeks" | "voluntary-resignation-lockout";

export interface NaspiInput {
  readonly grossPay4Years: number;
  readonly weeksContribution4Years: number;
  readonly age: number;
  readonly voluntaryResignationInLast12Months: boolean;
  readonly weeksAfterVoluntaryResignation: number;
  readonly config: NaspiConfig;
  readonly irpefBrackets?: readonly IrpefBracket[];
}

export interface NaspiScheduleMonth {
  readonly month: number;
  readonly amount: number;
  readonly amountNet: number;
}

export interface NaspiBreakdown {
  readonly eligible: boolean;
  readonly reasons: readonly NaspiIneligibilityReason[];
  readonly referenceMonthlyPay: number;
  readonly monthlyAmount: number;
  readonly monthlyAmountNet: number;
  readonly capped: boolean;
  readonly durationWeeks: number;
  readonly durationMonths: number;
  readonly decalageStartMonth: number;
  readonly schedule: readonly NaspiScheduleMonth[];
  readonly totalGross: number;
  readonly totalNet: number;
  readonly effectiveIrpefRate: number;
}

function emptyResult(reasons: readonly NaspiIneligibilityReason[]): NaspiBreakdown {
  return {
    eligible: reasons.length === 0,
    reasons,
    referenceMonthlyPay: 0,
    monthlyAmount: 0,
    monthlyAmountNet: 0,
    capped: false,
    durationWeeks: 0,
    durationMonths: 0,
    decalageStartMonth: 0,
    schedule: [],
    totalGross: 0,
    totalNet: 0,
    effectiveIrpefRate: 0,
  };
}

export function calculateNaspi(input: NaspiInput): NaspiBreakdown {
  const { config } = input;
  const reasons: NaspiIneligibilityReason[] = [];

  if (input.weeksContribution4Years < config.minWeeks) {
    reasons.push("insufficient-weeks");
  }
  if (
    input.voluntaryResignationInLast12Months &&
    input.weeksAfterVoluntaryResignation < config.minWeeks
  ) {
    reasons.push("voluntary-resignation-lockout");
  }
  if (reasons.length > 0) return emptyResult(reasons);

  const refMonthly =
    input.weeksContribution4Years > 0
      ? (input.grossPay4Years / input.weeksContribution4Years) * config.weeklyToMonthlyCoef
      : 0;

  const base =
    refMonthly <= config.soglia
      ? config.pctBase * refMonthly
      : config.pctBase * config.soglia + config.pctMarginal * (refMonthly - config.soglia);

  const capped = base > config.massimale;
  const monthlyAmount = Math.min(base, config.massimale);

  const durationWeeks = Math.min(
    Math.floor(input.weeksContribution4Years / 2),
    config.maxDurationWeeks,
  );
  const durationMonths = Math.floor(durationWeeks / config.weeklyToMonthlyCoef);

  const decalageStart = input.age >= 55 ? config.decalageStart55plus : config.decalageStartUnder55;

  const schedule: NaspiScheduleMonth[] = [];
  let totalGrossSum = 0;
  for (let m = 1; m <= durationMonths; m += 1) {
    const decalageSteps = m < decalageStart ? 0 : m - decalageStart + 1;
    const amount = monthlyAmount * Math.pow(1 - config.decalageRate, decalageSteps);
    schedule.push({ month: m, amount: round(amount), amountNet: 0 });
    totalGrossSum += amount;
  }
  const totalGross = sumOfCents(schedule.map((row) => row.amount));

  const brackets = input.irpefBrackets;
  let totalIrpef = 0;
  let monthlyAmountNet = monthlyAmount;
  if (brackets && totalGrossSum > 0) {
    totalIrpef = applyProgressiveBrackets(totalGrossSum, brackets);
    const factor = (totalGrossSum - totalIrpef) / totalGrossSum;
    for (let i = 0; i < schedule.length; i += 1) {
      const row = schedule[i];
      if (!row) continue;
      const net = row.amount * factor;
      schedule[i] = { month: row.month, amount: row.amount, amountNet: round(net) };
    }
    monthlyAmountNet = monthlyAmount * factor;
  } else {
    for (let i = 0; i < schedule.length; i += 1) {
      const row = schedule[i];
      if (!row) continue;
      schedule[i] = { month: row.month, amount: row.amount, amountNet: row.amount };
    }
  }

  const totalNet = sumOfCents(schedule.map((row) => row.amountNet));
  const effectiveIrpefRate = totalGrossSum > 0 ? totalIrpef / totalGrossSum : 0;

  return {
    eligible: true,
    reasons: [],
    referenceMonthlyPay: round(refMonthly),
    monthlyAmount: round(monthlyAmount),
    monthlyAmountNet: round(monthlyAmountNet),
    capped,
    durationWeeks,
    durationMonths,
    decalageStartMonth: decalageStart,
    schedule,
    totalGross,
    totalNet,
    effectiveIrpefRate,
  };
}
