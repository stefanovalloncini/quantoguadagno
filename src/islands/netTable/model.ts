import {
  CAPOLUOGHI,
  comunaleRuleFor,
  findComune,
  REGION_CODES,
  type Bracket,
  type ComunaleRule,
  type PaymentFrequency,
  type RegionCode,
  type RegionComuni,
  type SupportedYear,
} from "@/data/index.ts";
import { round } from "@/domain/_math.ts";
import {
  calculateRaiseImpact,
  calculateSalaryBreakdown,
  getTaxConfig,
  resolveInpsRates,
  type CompanySize,
  type ContractType,
  type SalaryBreakdown,
  type SalaryInput,
} from "@/domain/index.ts";
import { monthlyShares } from "@/islands/home/monthly.ts";
import { regionSummary } from "@/islands/home/regionSummary.ts";
import { neighboursOf } from "./amounts.ts";

/** The reference scenario: a capoluogo, its regional and municipal rules, 13 payslips. */
export const REFERENCE_REGION: RegionCode = "lombardia";
export const REFERENCE_FREQUENCY: PaymentFrequency = 13;
export const SCENARIO_CONTRACT: ContractType = "indeterminato";
export const SCENARIO_COMPANY_SIZE: CompanySize = "small";
export const MONTH_COUNTS: readonly PaymentFrequency[] = [12, 13, 14];
export const RAISE_STEP = 1_000;

export interface Residence {
  readonly region: RegionCode;
  readonly comuneId: string;
  readonly comuneName: string;
  readonly rule: ComunaleRule;
  readonly ruleYear: number;
}

export type Residences = Readonly<Record<RegionCode, Residence>>;

export function residenceIn(regionComuni: RegionComuni, year: SupportedYear): Residence {
  const { region } = regionComuni;
  const { id } = CAPOLUOGHI[region];
  const comune = findComune(regionComuni, id);
  if (comune === undefined) throw new Error(`Capoluogo ${id} is not in the ${region} data`);
  const found = comunaleRuleFor(comune, year);
  if (found === null) throw new Error(`${comune.name} has no addizionale for ${String(year)}`);
  return {
    region,
    comuneId: comune.id,
    comuneName: comune.name,
    rule: found.rule,
    ruleYear: found.year,
  };
}

export function scenarioInput(
  grossAnnual: number,
  year: SupportedYear,
  residence: Residence,
): SalaryInput {
  return {
    grossAnnual,
    taxYear: year,
    regionCode: residence.region,
    municipalTaxRate: residence.rule,
    contractType: SCENARIO_CONTRACT,
    paymentFrequency: REFERENCE_FREQUENCY,
    companySize: SCENARIO_COMPANY_SIZE,
    isPublicEmployee: false,
    insuredBefore1996: false,
    inpsOverride: null,
    dependents: null,
    expenseDeductions: null,
    fringeBenefits: null,
    specialConditions: null,
    premioRisultato: null,
  };
}

export interface MonthlyNet {
  readonly count: PaymentFrequency;
  readonly net: number;
}

export interface NetRow {
  readonly gross: number;
  readonly netAnnual: number;
  readonly monthly: readonly MonthlyNet[];
  readonly withheld: number;
  readonly withheldShare: number;
  readonly credits: number;
}

export function monthlyNet(netAnnual: number, count: number): number {
  return round(netAnnual / count);
}

export function monthlyOf(row: NetRow, count: PaymentFrequency): number {
  return (
    row.monthly.find((entry) => entry.count === count)?.net ?? monthlyNet(row.netAnnual, count)
  );
}

function rowOf(breakdown: SalaryBreakdown): NetRow {
  const { grossAnnual, netAnnual, totalTaxes } = breakdown;
  return {
    gross: grossAnnual,
    netAnnual,
    monthly: MONTH_COUNTS.map((count) => ({ count, net: monthlyNet(netAnnual, count) })),
    withheld: totalTaxes,
    withheldShare: grossAnnual > 0 ? totalTaxes / grossAnnual : 0,
    credits: round(breakdown.sommaAggiuntiva + breakdown.trattamentoIntegrativo),
  };
}

export function netRow(grossAnnual: number, year: SupportedYear, residence: Residence): NetRow {
  return rowOf(calculateSalaryBreakdown(scenarioInput(grossAnnual, year, residence)));
}

export function netRows(
  amounts: readonly number[],
  year: SupportedYear,
  residence: Residence,
): readonly NetRow[] {
  return amounts.map((gross) => netRow(gross, year, residence));
}

export type LedgerLineId =
  "gross" | "inps" | "taxable" | "irpef" | "regional" | "municipal" | "somma" | "trattamento";

export type LedgerLineKind = "plain" | "deducted" | "credited" | "subtotal";

export interface LedgerLine {
  readonly id: LedgerLineId;
  readonly kind: LedgerLineKind;
  /** Signed as it moves the net: negative for deductions, positive otherwise. */
  readonly annual: number;
  readonly monthly: number;
}

export interface IrpefStep {
  readonly id: "gross" | "work" | "wedge";
  /** The gross tax is positive, each deduction negative. */
  readonly amount: number;
}

export type InpsRule =
  | { readonly kind: "flat"; readonly rate: number }
  | { readonly kind: "relief"; readonly rate: number }
  | {
      readonly kind: "above";
      readonly rate: number;
      readonly band: number;
      readonly rateAbove: number;
    }
  | {
      readonly kind: "capped";
      readonly rate: number;
      readonly band: number;
      readonly rateAbove: number;
      readonly cap: number;
    };

export interface RateRange {
  readonly min: number;
  readonly max: number;
}

export type LedgerNote =
  | { readonly kind: "municipalExempt"; readonly threshold: number }
  | { readonly kind: "municipalNone" }
  | { readonly kind: "surchargesNotDue" };

export interface AmountLedger {
  readonly lines: readonly LedgerLine[];
  readonly net: { readonly annual: number; readonly monthly: number };
  readonly irpefSteps: readonly IrpefStep[];
  readonly brackets: readonly Bracket[];
  readonly inps: InpsRule;
  readonly regionalRates: RateRange;
  readonly municipalRates: RateRange;
  readonly maxTrattamento: number;
  readonly notes: readonly LedgerNote[];
}

function inpsRule(breakdown: SalaryBreakdown, year: SupportedYear): InpsRule {
  const config = getTaxConfig(year).inps;
  const { standardRate: rate, aboveCeilingRate: rateAbove } = resolveInpsRates(config, {
    contractType: SCENARIO_CONTRACT,
    companySize: SCENARIO_COMPANY_SIZE,
    isPublicEmployee: false,
  });
  const gross = breakdown.grossAnnual;
  if (breakdown.inpsExemption > 0) return { kind: "relief", rate };
  if (gross <= config.ceiling || rateAbove === rate) return { kind: "flat", rate };
  if (gross <= config.massimale) return { kind: "above", rate, band: config.ceiling, rateAbove };
  return { kind: "capped", rate, band: config.ceiling, rateAbove, cap: config.massimale };
}

/** The brackets the income reaches, the first one always included. */
export function reachedBrackets(income: number, brackets: readonly Bracket[]): readonly Bracket[] {
  return brackets.filter((bracket, index) => index === 0 || income > bracket.min);
}

function irpefSteps(breakdown: SalaryBreakdown): readonly IrpefStep[] {
  const applied = round(breakdown.irpefGross - breakdown.irpefNet);
  if (applied <= 0) return [];
  const work = Math.min(breakdown.irpefDeduction, applied);
  const wedge = round(applied - work);
  return [
    { id: "gross", amount: breakdown.irpefGross },
    ...(work > 0 ? [{ id: "work" as const, amount: -work }] : []),
    ...(wedge > 0 ? [{ id: "wedge" as const, amount: -wedge }] : []),
  ];
}

function rangeOf(rates: readonly number[]): RateRange {
  return { min: Math.min(...rates), max: Math.max(...rates) };
}

function municipalRates(rule: ComunaleRule): RateRange {
  const percents = rule.brackets === undefined ? [rule.rate] : rule.brackets.map((b) => b.rate);
  return rangeOf(percents.map((percent) => percent / 100));
}

function ledgerNotes(breakdown: SalaryBreakdown, residence: Residence): readonly LedgerNote[] {
  if (breakdown.irpefNet <= 0) return [{ kind: "surchargesNotDue" }];
  if (breakdown.municipalTax > 0) return [];
  if (municipalRates(residence.rule).max === 0) return [{ kind: "municipalNone" }];
  const threshold = residence.rule.exemption ?? 0;
  return threshold > 0 && breakdown.taxableIncome <= threshold
    ? [{ kind: "municipalExempt", threshold }]
    : [];
}

interface ChainEntry {
  readonly id: LedgerLineId;
  readonly kind: "deducted" | "credited";
  readonly annual: number;
}

export function amountLedger(
  breakdown: SalaryBreakdown,
  year: SupportedYear,
  residence: Residence,
): AmountLedger {
  const b = breakdown;
  const entries: readonly ChainEntry[] = [
    { id: "inps", kind: "deducted", annual: -b.inpsContribution },
    { id: "irpef", kind: "deducted", annual: -b.irpefNet },
    { id: "regional", kind: "deducted", annual: -b.regionalTax },
    { id: "municipal", kind: "deducted", annual: -b.municipalTax },
    { id: "somma", kind: "credited", annual: b.sommaAggiuntiva },
    { id: "trattamento", kind: "credited", annual: b.trattamentoIntegrativo },
  ];
  const chain = entries.filter((entry) => entry.annual !== 0);
  const shares = monthlyShares(
    chain.map((entry) => entry.annual),
    REFERENCE_FREQUENCY,
    b.netMonthly - b.grossMonthly,
  );
  const lines: LedgerLine[] = chain.map((entry, index) => ({
    ...entry,
    monthly: shares[index] ?? 0,
  }));
  const inpsMonthly = lines.find((line) => line.id === "inps")?.monthly ?? 0;
  const taxable: LedgerLine = {
    id: "taxable",
    kind: "subtotal",
    annual: b.taxableIncome,
    monthly: round(b.grossMonthly + inpsMonthly),
  };
  const gross: LedgerLine = {
    id: "gross",
    kind: "plain",
    annual: b.grossAnnual,
    monthly: b.grossMonthly,
  };
  const afterInps = lines.findIndex((line) => line.id === "inps") + 1;
  const config = getTaxConfig(year);
  return {
    lines: [gross, ...lines.slice(0, afterInps), taxable, ...lines.slice(afterInps)],
    net: { annual: b.netAnnual, monthly: b.netMonthly },
    irpefSteps: irpefSteps(b),
    brackets: reachedBrackets(b.taxableIncome, config.irpefBrackets),
    inps: inpsRule(b, year),
    regionalRates: rangeOf(regionSummary(residence.region, year).rates),
    municipalRates: municipalRates(residence.rule),
    maxTrattamento: config.trattamentoIntegrativo.maxAnnualBonus,
    notes: ledgerNotes(b, residence),
  };
}

export interface CityRow {
  readonly residence: Residence;
  readonly netAnnual: number;
  readonly netMonthly: number;
  readonly reference: boolean;
}

export interface Raise {
  readonly increment: number;
  readonly netGainAnnual: number;
  readonly netGainMonthly: number;
  readonly keptShare: number;
}

export interface AmountPage {
  readonly year: SupportedYear;
  readonly gross: number;
  readonly residence: Residence;
  readonly breakdown: SalaryBreakdown;
  readonly row: NetRow;
  readonly ledger: AmountLedger;
  readonly cities: readonly CityRow[];
  readonly lowest: readonly CityRow[];
  readonly highest: readonly CityRow[];
  readonly raise: Raise;
  readonly employerCost: number;
  readonly previous: number | null;
  readonly next: number | null;
}

function cents(amount: number): number {
  return Math.round(amount * 100);
}

function cityRows(gross: number, year: SupportedYear, residences: Residences): readonly CityRow[] {
  return REGION_CODES.map((region) => {
    const residence = residences[region];
    const breakdown = calculateSalaryBreakdown(scenarioInput(gross, year, residence));
    return {
      residence,
      netAnnual: breakdown.netAnnual,
      netMonthly: breakdown.netMonthly,
      reference: region === REFERENCE_REGION,
    };
  });
}

function extremes(rows: readonly CityRow[], pick: (values: number[]) => number) {
  const target = pick(rows.map((row) => cents(row.netAnnual)));
  return rows.filter((row) => cents(row.netAnnual) === target);
}

function raiseOf(input: SalaryInput): Raise {
  const [step] = calculateRaiseImpact(input, [RAISE_STEP]).steps;
  if (step === undefined) throw new Error("The raise impact returned no step");
  return {
    increment: step.increment,
    netGainAnnual: round(step.netGain),
    netGainMonthly: round(step.netGain / REFERENCE_FREQUENCY),
    keptShare: step.keptShare,
  };
}

export function amountPage(gross: number, year: SupportedYear, residences: Residences): AmountPage {
  const residence = residences[REFERENCE_REGION];
  const input = scenarioInput(gross, year, residence);
  const breakdown = calculateSalaryBreakdown(input);
  const cities = cityRows(gross, year, residences);
  const { previous, next } = neighboursOf(gross);
  return {
    year,
    gross,
    residence,
    breakdown,
    row: rowOf(breakdown),
    ledger: amountLedger(breakdown, year, residence),
    cities,
    lowest: extremes(cities, (values) => Math.min(...values)),
    highest: extremes(cities, (values) => Math.max(...values)),
    raise: raiseOf(input),
    employerCost: breakdown.totalEmployerCost,
    previous,
    next,
  };
}
