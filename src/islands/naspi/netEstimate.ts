import type { RegionCode, SupportedYear } from "@/data/index.ts";
import {
  applyProgressiveBrackets,
  calculateLocalTaxes,
  calculateWorkDeduction,
  getTaxConfig,
  type MunicipalTaxInput,
  type NaspiScheduleMonth,
} from "@/domain/index.ts";

export const MONTHS_IN_TAX_YEAR = 12;

function cents(value: number): number {
  return Math.round(value * 100);
}

function euros(valueInCents: number): number {
  return valueInCents / 100;
}

function roundedEuros(value: number): number {
  return euros(cents(value));
}

export interface TaxesOnIncome {
  readonly income: number;
  readonly irpefGross: number;
  readonly workDeduction: number;
  readonly irpefNet: number;
  readonly regional: number;
  readonly municipal: number;
  readonly total: number;
}

export interface NaspiTaxContext {
  readonly year: SupportedYear;
  readonly region: RegionCode;
  readonly municipal: MunicipalTaxInput;
}

export function taxesOn(income: number, context: NaspiTaxContext): TaxesOnIncome {
  const config = getTaxConfig(context.year);
  const taxable = Math.max(0, income);
  const irpefGross = roundedEuros(applyProgressiveBrackets(taxable, config.irpefBrackets));
  const workDeduction = roundedEuros(calculateWorkDeduction(taxable, config.workDeduction));
  const irpefNet = roundedEuros(Math.max(0, irpefGross - workDeduction));
  const due = irpefNet > 0;
  const local = calculateLocalTaxes(taxable, context.region, context.year, context.municipal);
  const regional = due ? roundedEuros(local.regionalTax) : 0;
  const municipal = due ? roundedEuros(local.municipalTax) : 0;
  return {
    income: taxable,
    irpefGross,
    workDeduction,
    irpefNet,
    regional,
    municipal,
    total: euros(cents(irpefNet) + cents(regional) + cents(municipal)),
  };
}

export interface NaspiNetEstimate {
  readonly naspiIncome: number;
  readonly otherIncome: number;
  readonly withNaspi: TaxesOnIncome;
  readonly withoutNaspi: TaxesOnIncome;
  readonly irpef: number;
  readonly regional: number;
  readonly municipal: number;
  readonly taxes: number;
  readonly net: number;
  readonly share: number;
}

function difference(a: number, b: number): number {
  return euros(Math.max(0, cents(a) - cents(b)));
}

export function estimateNaspiNet(
  naspiIncome: number,
  otherIncome: number,
  context: NaspiTaxContext,
): NaspiNetEstimate {
  const other = Math.max(0, otherIncome);
  const withNaspi = taxesOn(other + naspiIncome, context);
  const withoutNaspi = taxesOn(other, context);
  const irpef = difference(withNaspi.irpefNet, withoutNaspi.irpefNet);
  const regional = difference(withNaspi.regional, withoutNaspi.regional);
  const municipal = difference(withNaspi.municipal, withoutNaspi.municipal);
  const taxes = euros(cents(irpef) + cents(regional) + cents(municipal));
  return {
    naspiIncome,
    otherIncome: other,
    withNaspi,
    withoutNaspi,
    irpef,
    regional,
    municipal,
    taxes,
    net: euros(cents(naspiIncome) - cents(taxes)),
    share: naspiIncome > 0 ? taxes / naspiIncome : 0,
  };
}

export interface NaspiMonthRow {
  readonly month: number;
  readonly gross: number;
  readonly net: number;
  readonly change: number;
}

export interface NaspiSchedule {
  readonly rows: readonly NaspiMonthRow[];
  readonly months: number;
  readonly firstYearMonths: number;
  readonly firstYearGross: number;
  readonly grossTotal: number;
  readonly netTotal: number;
}

export function firstYearGross(schedule: readonly NaspiScheduleMonth[]): number {
  const firstYear = schedule.slice(0, MONTHS_IN_TAX_YEAR);
  return euros(firstYear.reduce((sum, month) => sum + cents(month.amount), 0));
}

export function netSchedule(
  schedule: readonly NaspiScheduleMonth[],
  estimate: NaspiNetEstimate,
): NaspiSchedule {
  const firstYearMonths = Math.min(MONTHS_IN_TAX_YEAR, schedule.length);
  const firstAmount = schedule[0]?.amount ?? 0;
  const netCents = schedule.map((month) => Math.round(cents(month.amount) * (1 - estimate.share)));
  const firstYearNet = netCents.slice(0, firstYearMonths).reduce((sum, value) => sum + value, 0);
  const remainder = cents(estimate.net) - firstYearNet;
  const lastOfYear = firstYearMonths - 1;
  if (lastOfYear >= 0 && netCents[lastOfYear] !== undefined) {
    netCents[lastOfYear] = (netCents[lastOfYear] ?? 0) + remainder;
  }
  const rows = schedule.map((month, index) => ({
    month: month.month,
    gross: month.amount,
    net: euros(netCents[index] ?? 0),
    change: firstAmount > 0 ? month.amount / firstAmount - 1 : 0,
  }));
  return {
    rows,
    months: schedule.length,
    firstYearMonths,
    firstYearGross: estimate.naspiIncome,
    grossTotal: euros(schedule.reduce((sum, month) => sum + cents(month.amount), 0)),
    netTotal: euros(netCents.reduce((sum, value) => sum + value, 0)),
  };
}

export function roundedToTen(value: number): number {
  return Math.round(value / 10) * 10;
}
