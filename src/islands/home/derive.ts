import {
  SUPPORTED_YEARS,
  type Bracket,
  type RegionCode,
  type SupportedYear,
} from "@/data/index.ts";
import { calculateSalaryBreakdown, type SalaryBreakdown } from "@/domain/composer.ts";
import { isMadreLavoratriceEligible } from "@/domain/specialConditionsCalculations.ts";
import { getTaxConfig } from "@/domain/taxConfig.ts";
import type { Locale } from "@/i18n/locales.ts";
import { hrefFor } from "@/routePaths.ts";
import { salaryInputForYear, type EmployeeResult } from "./compute.ts";
import { contractAssumption, type ContractAssumption } from "./contract.ts";
import { employeeLimits, type EmployeeLimits } from "./employeeLimits.ts";
import { irpefBaseOf } from "./impatriati.ts";
import { roundTo } from "./fields.ts";
import {
  DEFAULT_CONTRACT_TYPE,
  DEFAULT_GROSS_ANNUAL,
  DEFAULT_YEAR,
  type EmployeeGroup,
  type EmployeeState,
  type EmployeeValues,
} from "./state.ts";
import { employerCostBreakdown, type EmployerCostBreakdown } from "./employerCostBreakdown.ts";
import { localAssumption, type ComuneAssumption, type LocalAssumption } from "./localAssumption.ts";
import { regionSummary, type RegionSummary } from "./regionSummary.ts";
import { employeeToQuery } from "./url.ts";

export { contractAssumption, type ContractAssumption };
export {
  employerCostBreakdown,
  type EmployerCostBreakdown,
  type EmployerCostLine,
  type EmployerCostLineId,
} from "./employerCostBreakdown.ts";
export { localAssumption, type ComuneAssumption, type LocalAssumption };
export type { ContractFacts } from "./contract.ts";
export { employeeLimits, type EmployeeLimits };
export { regionSummary, type RegionSummary };
export type { RegionalDeductionSummary } from "./regionSummary.ts";
export {
  COMUNE_SEARCH_MIN_LENGTH,
  comuneSearchKey,
  searchComuni,
} from "@/components/form/comuneSearch.ts";

export interface YearComparisonRow {
  readonly year: SupportedYear;
  readonly netAnnual: number;
  readonly netMonthly: number;
  readonly deltaAnnual: number;
  readonly selected: boolean;
}

export function yearComparison(result: EmployeeResult): readonly YearComparisonRow[] {
  const selectedYear = result.input.taxYear;
  const selectedNet = result.breakdown.netAnnual;
  return SUPPORTED_YEARS.map((year) => {
    const breakdown =
      year === selectedYear
        ? result.breakdown
        : calculateSalaryBreakdown(salaryInputForYear(result, year));
    return {
      year,
      netAnnual: breakdown.netAnnual,
      netMonthly: breakdown.netMonthly,
      deltaAnnual: roundTo(breakdown.netAnnual - selectedNet, 2),
      selected: year === selectedYear,
    };
  });
}

export interface BracketIndicator {
  readonly brackets: readonly Bracket[];
  readonly currentIndex: number;
  readonly progress: number | null;
  readonly distanceToNext: number | null;
  readonly nextRate: number | null;
}

export function bracketIndicator(
  taxableIncome: number,
  year: SupportedYear,
): BracketIndicator | null {
  const brackets = getTaxConfig(year).irpefBrackets;
  const currentIndex = brackets.findIndex(
    (bracket) => bracket.max === null || taxableIncome < bracket.max,
  );
  const current = brackets[currentIndex];
  if (current === undefined) return null;
  const next = brackets[currentIndex + 1];
  if (current.max === null || next === undefined) {
    return { brackets, currentIndex, progress: null, distanceToNext: null, nextRate: null };
  }
  const span = current.max - current.min;
  const reached = (taxableIncome - current.min) / span;
  return {
    brackets,
    currentIndex,
    progress: span > 0 ? Math.min(1, Math.max(0, reached)) : 0,
    distanceToNext: roundTo(current.max - taxableIncome, 2),
    nextRate: next.rate,
  };
}

export const RAISE_INCREMENT = 1_000;

export interface RaiseImpact {
  readonly increment: number;
  readonly netGainAnnual: number;
  readonly netGainMonthly: number;
  readonly keptShare: number;
  readonly withheldShare: number;
  readonly marginalTaxRate: number;
}

export function raiseImpact(result: EmployeeResult, increment = RAISE_INCREMENT): RaiseImpact {
  const raised = calculateSalaryBreakdown({
    ...result.input,
    grossAnnual: result.input.grossAnnual + increment,
  });
  const netGain = raised.netAnnual - result.breakdown.netAnnual;
  const keptShare = netGain / increment;
  return {
    increment,
    netGainAnnual: roundTo(netGain, 2),
    netGainMonthly: roundTo(netGain / result.values.paymentFrequency, 2),
    keptShare,
    withheldShare: 1 - keptShare,
    marginalTaxRate: raised.marginalTaxRate,
  };
}

export type LedgerSection = "gross" | "contributions" | "taxes" | "credits" | "pdr" | "net" | "tfr";

export type LedgerLineId =
  | "gross"
  | "inps"
  | "inpsExemption"
  | "madreLavoratrice"
  | "pensionFund"
  | "taxableIncome"
  | "irpefGross"
  | "workDeduction"
  | "dependents"
  | "expenses"
  | "detrazioneAggiuntiva"
  | "impatriati"
  | "totalDeductions"
  | "irpefNet"
  | "regional"
  | "municipal"
  | "trattamento"
  | "sommaAggiuntiva"
  | "pdrGross"
  | "pdrInps"
  | "pdrTax"
  | "pdrNet"
  | "totalTaxes"
  | "netAnnual"
  | "tfr";

export interface LedgerLine {
  readonly id: LedgerLineId;
  readonly section: LedgerSection;
  readonly amount: number;
  readonly rate?: number;
  readonly deducted: boolean;
  readonly total: boolean;
}

interface LineOptions {
  readonly rate?: number;
  readonly deducted?: boolean;
  readonly total?: boolean;
}

export function ledgerLine(
  id: LedgerLineId,
  section: LedgerSection,
  amount: number,
  options: LineOptions = {},
): LedgerLine {
  return {
    id,
    section,
    amount,
    ...(options.rate === undefined ? {} : { rate: options.rate }),
    deducted: options.deducted ?? false,
    total: options.total ?? false,
  };
}

function whenPositive(line: LedgerLine): readonly LedgerLine[] {
  return line.amount > 0 ? [line] : [];
}

export function ledgerLines(breakdown: SalaryBreakdown): readonly LedgerLine[] {
  const pdr =
    breakdown.pdrNet > 0
      ? [
          ledgerLine("pdrGross", "pdr", breakdown.pdrGross),
          ledgerLine("pdrInps", "pdr", breakdown.pdrInps, { deducted: true }),
          ledgerLine("pdrTax", "pdr", breakdown.pdrTax, { deducted: true }),
          ledgerLine("pdrNet", "pdr", breakdown.pdrNet, { total: true }),
        ]
      : [];
  return [
    ledgerLine("gross", "gross", breakdown.grossAnnual),
    ledgerLine("inps", "contributions", breakdown.inpsContribution, {
      rate: breakdown.inpsRate,
      deducted: true,
    }),
    ...whenPositive(ledgerLine("inpsExemption", "contributions", breakdown.inpsExemption)),
    ...whenPositive(
      ledgerLine("madreLavoratrice", "contributions", breakdown.madreLavoratriceExemption),
    ),
    ...whenPositive(
      ledgerLine("pensionFund", "contributions", breakdown.pensionFundDeduction, {
        deducted: true,
      }),
    ),
    ledgerLine("taxableIncome", "contributions", breakdown.taxableIncome, { total: true }),
    ledgerLine("irpefGross", "taxes", breakdown.irpefGross, { deducted: true }),
    ledgerLine("workDeduction", "taxes", breakdown.irpefDeduction),
    ...whenPositive(ledgerLine("dependents", "taxes", breakdown.dependentsDeduction)),
    ...whenPositive(ledgerLine("expenses", "taxes", breakdown.expenseDeduction)),
    ...whenPositive(ledgerLine("detrazioneAggiuntiva", "taxes", breakdown.detrazioneAggiuntiva)),
    ...whenPositive(ledgerLine("impatriati", "taxes", breakdown.regimeImpatriatiSavings)),
    ledgerLine("irpefNet", "taxes", breakdown.irpefNet, { deducted: true, total: true }),
    ledgerLine("regional", "taxes", breakdown.regionalTax, {
      rate: breakdown.regionalTaxRate,
      deducted: true,
    }),
    ledgerLine("municipal", "taxes", breakdown.municipalTax, {
      rate: breakdown.municipalTaxRate,
      deducted: true,
    }),
    ...whenPositive(ledgerLine("trattamento", "credits", breakdown.trattamentoIntegrativo)),
    ...whenPositive(ledgerLine("sommaAggiuntiva", "credits", breakdown.sommaAggiuntiva)),
    ...pdr,
    ledgerLine("totalTaxes", "net", breakdown.totalTaxes, { deducted: true, total: true }),
    ledgerLine("netAnnual", "net", breakdown.netAnnual, { total: true }),
    ledgerLine("tfr", "tfr", breakdown.tfrAnnual, { rate: breakdown.tfrRate }),
  ];
}

export type CreditId = "trattamento" | "sommaAggiuntiva" | "pdr";

export function credits(breakdown: SalaryBreakdown): readonly CreditId[] {
  const paid: readonly (readonly [CreditId, number])[] = [
    ["trattamento", breakdown.trattamentoIntegrativo],
    ["sommaAggiuntiva", breakdown.sommaAggiuntiva],
    ["pdr", breakdown.pdrNet],
  ];
  return paid.filter(([, amount]) => amount > 0).map(([id]) => id);
}

export interface MadreLavoratriceNotice {
  readonly eligible: boolean;
  readonly notEnoughChildren: boolean;
  readonly childTooOld: boolean;
}

export interface EmployeeNotices {
  readonly spouseNotDependent: boolean;
  readonly madreLavoratrice: MadreLavoratriceNotice | null;
}

export function notices(values: EmployeeValues): EmployeeNotices {
  const config = getTaxConfig(values.taxYear);
  const spouse = values.dependents;
  const madre = values.specialConditions?.madreLavoratrice;
  return {
    spouseNotDependent:
      spouse?.hasSpouse === true &&
      (spouse.spouseIncome ?? 0) > config.dependentsDeduction.dependentIncomeLimit,
    madreLavoratrice:
      madre === undefined
        ? null
        : {
            eligible: isMadreLavoratriceEligible(madre, config.madreLavoratrice),
            notEnoughChildren:
              madre.numberOfChildren < config.madreLavoratrice.minChildrenFullExemption,
            childTooOld: madre.youngestChildAge >= config.madreLavoratrice.maxYoungestChildAge,
          },
  };
}

export function activeGroups(values: EmployeeValues): Readonly<Record<EmployeeGroup, boolean>> {
  return {
    contract:
      values.contractType !== DEFAULT_CONTRACT_TYPE ||
      values.companySize === "large" ||
      values.isPublicEmployee ||
      values.insuredBefore1996 ||
      values.inpsOverride !== null,
    dependents: values.dependents !== null,
    expenses: values.expenseDeductions !== null,
    specialConditions: values.specialConditions !== null,
    premio: values.premioRisultato !== null,
    fringe: values.fringeBenefits !== null,
  };
}

export interface EmployeeLinks {
  readonly print: string;
  readonly employerCost: string;
  readonly apprenticeship: string;
}

export function employeeLinks(
  state: EmployeeState,
  grossAnnual: number,
  locale: Locale,
): EmployeeLinks {
  const gross = Math.round(grossAnnual);
  const query = employeeToQuery(state, locale);
  return {
    print: hrefFor("printPayslip", locale, query),
    employerCost: hrefFor("employerCost", locale, {
      l: gross === DEFAULT_GROSS_ANNUAL ? undefined : gross,
      y: state.year === DEFAULT_YEAR ? undefined : state.year,
      t: state.contractType === DEFAULT_CONTRACT_TYPE ? undefined : state.contractType,
      r: query.r,
      k: query.k,
      c: query.c,
      m: query.m,
    }),
    apprenticeship: hrefFor("apprenticeship", locale, gross > 0 ? { l: gross } : {}),
  };
}

export interface EmployeeDerived {
  readonly yearComparison: readonly YearComparisonRow[];
  readonly bracket: BracketIndicator | null;
  readonly raise: RaiseImpact;
  readonly employerCost: EmployerCostBreakdown;
  readonly ledger: readonly LedgerLine[];
  readonly credits: readonly CreditId[];
  readonly groups: Readonly<Record<EmployeeGroup, boolean>>;
  readonly notices: EmployeeNotices;
}

export function deriveEmployee(result: EmployeeResult): EmployeeDerived {
  return {
    yearComparison: yearComparison(result),
    bracket: bracketIndicator(irpefBaseOf(result), result.values.taxYear),
    raise: raiseImpact(result),
    employerCost: employerCostBreakdown(result.breakdown),
    ledger: ledgerLines(result.breakdown),
    credits: credits(result.breakdown),
    groups: activeGroups(result.values),
    notices: notices(result.values),
  };
}

export interface EmployeeHints {
  readonly region: RegionSummary;
  readonly limits: EmployeeLimits;
}

export function employeeHints(region: RegionCode, year: SupportedYear): EmployeeHints {
  return { region: regionSummary(region, year), limits: employeeLimits(year) };
}
