import {
  CAPOLUOGHI,
  comunaleRuleFor,
  findComune,
  REGION_CODES,
  type Comune,
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
  type CompanySize,
  type ContractType,
  type SalaryBreakdown,
  type SalaryInput,
} from "@/domain/index.ts";
import { monthlyShares } from "@/islands/home/monthly.ts";
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
  readonly comune: Comune;
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
    comune,
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
  /** The part of the gross that does not reach the net: contributions and taxes, less credits. */
  readonly withheld: number;
  readonly withheldShare: number;
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
  const { grossAnnual, netAnnual } = breakdown;
  const withheld = round(grossAnnual - netAnnual);
  return {
    gross: grossAnnual,
    netAnnual,
    monthly: MONTH_COUNTS.map((count) => ({ count, net: monthlyNet(netAnnual, count) })),
    withheld,
    withheldShare: grossAnnual > 0 ? withheld / grossAnnual : 0,
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

/** Why a surcharge has no line of its own. */
export type LedgerNote =
  | { readonly kind: "municipalExempt"; readonly threshold: number }
  | { readonly kind: "municipalNone" }
  | { readonly kind: "surchargesNotDue" };

export interface AmountLedger {
  readonly lines: readonly LedgerLine[];
  readonly net: { readonly annual: number; readonly monthly: number };
  readonly notes: readonly LedgerNote[];
}

function chargesNothing(rule: ComunaleRule): boolean {
  const percents = rule.brackets === undefined ? [rule.rate] : rule.brackets.map((b) => b.rate);
  return Math.max(...percents) === 0;
}

function ledgerNotes(breakdown: SalaryBreakdown, residence: Residence): readonly LedgerNote[] {
  if (breakdown.irpefNet <= 0) return [{ kind: "surchargesNotDue" }];
  if (breakdown.municipalTax > 0) return [];
  if (chargesNothing(residence.rule)) return [{ kind: "municipalNone" }];
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

/** The lines from the gross to the net, without the ones worth nothing. */
export function amountLedger(breakdown: SalaryBreakdown, residence: Residence): AmountLedger {
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
  return {
    lines: [gross, ...lines.slice(0, afterInps), taxable, ...lines.slice(afterInps)],
    net: { annual: b.netAnnual, monthly: b.netMonthly },
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
    ledger: amountLedger(breakdown, residence),
    cities,
    lowest: extremes(cities, (values) => Math.min(...values)),
    highest: extremes(cities, (values) => Math.max(...values)),
    raise: raiseOf(input),
    employerCost: breakdown.totalEmployerCost,
    previous,
    next,
  };
}
