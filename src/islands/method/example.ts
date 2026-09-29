import lombardia from "@/data/comuni/lombardia.json";
import {
  comunaleRuleFor,
  findComune,
  LATEST_SUPPORTED_YEAR,
  param,
  REGION_INFO,
  SUPPORTED_YEARS,
  yearStart,
  type Bracket,
  type ComunaleRule,
  type RegionComuni,
  type SupportedYear,
} from "@/data/index.ts";
import { round } from "@/domain/_math.ts";
import { calculateSalaryBreakdown, type SalaryBreakdown } from "@/domain/index.ts";

export const EXAMPLE_GROSS_ANNUAL = 35_000;
export const EXAMPLE_REGION = "lombardia";
export const EXAMPLE_COMUNE_ID = "F205";

export type SharePosition = "whole" | "first" | "full" | "rest";

export interface BracketShare {
  readonly bracket: Bracket;
  readonly amount: number;
  readonly tax: number;
  readonly position: SharePosition;
}

export interface ExampleComune {
  readonly name: string;
  readonly rule: ComunaleRule;
  readonly ruleYear: number;
}

export interface BracketChange {
  readonly bracket: Bracket;
  readonly previousRate: number;
  readonly previousYear: SupportedYear;
}

export interface MethodExample {
  readonly year: SupportedYear;
  readonly gross: number;
  readonly regionName: string;
  readonly comune: ExampleComune;
  readonly breakdown: SalaryBreakdown;
  readonly shares: readonly BracketShare[];
  readonly bracketChanges: readonly BracketChange[];
}

function exampleComune(year: SupportedYear): ExampleComune {
  const comune = findComune(lombardia as unknown as RegionComuni, EXAMPLE_COMUNE_ID);
  if (comune === undefined) throw new Error(`Comune ${EXAMPLE_COMUNE_ID} is not in the data`);
  const found = comunaleRuleFor(comune, year);
  if (found === null) throw new Error(`Comune ${comune.name} has no rule for ${String(year)}`);
  return { name: comune.name, rule: found.rule, ruleYear: found.year };
}

function sharePosition(index: number, count: number, bracket: Bracket, income: number) {
  if (count === 1) return "whole";
  if (index === 0) return "first";
  return bracket.max !== null && income >= bracket.max ? "full" : "rest";
}

export function bracketShares(
  income: number,
  brackets: readonly Bracket[],
): readonly BracketShare[] {
  const touched = brackets.filter((bracket) => income > bracket.min);
  return touched.map((bracket, index) => {
    const top = bracket.max === null ? income : Math.min(income, bracket.max);
    const amount = round(top - bracket.min);
    return {
      bracket,
      amount,
      tax: round(amount * bracket.rate),
      position: sharePosition(index, touched.length, bracket, income),
    };
  });
}

function previousYear(year: SupportedYear): SupportedYear | undefined {
  const index = SUPPORTED_YEARS.indexOf(year);
  return index > 0 ? SUPPORTED_YEARS[index - 1] : undefined;
}

export function bracketChanges(year: SupportedYear): readonly BracketChange[] {
  const before = previousYear(year);
  if (before === undefined) return [];
  const previous = param("irpef.brackets", yearStart(before));
  return param("irpef.brackets", yearStart(year)).flatMap((bracket) => {
    const match = previous.find(
      (candidate) => candidate.min === bracket.min && candidate.max === bracket.max,
    );
    if (match === undefined || match.rate === bracket.rate) return [];
    return [{ bracket, previousRate: match.rate, previousYear: before }];
  });
}

export function methodExample(year: SupportedYear = LATEST_SUPPORTED_YEAR): MethodExample {
  const comune = exampleComune(year);
  const breakdown = calculateSalaryBreakdown({
    grossAnnual: EXAMPLE_GROSS_ANNUAL,
    taxYear: year,
    regionCode: EXAMPLE_REGION,
    municipalTaxRate: comune.rule,
  });
  return {
    year,
    gross: EXAMPLE_GROSS_ANNUAL,
    regionName: REGION_INFO[EXAMPLE_REGION].name,
    comune,
    breakdown,
    shares: bracketShares(breakdown.taxableIncome, param("irpef.brackets", yearStart(year))),
    bracketChanges: bracketChanges(year),
  };
}

export interface NetStep {
  readonly id:
    "gross" | "inps" | "irpefNet" | "regional" | "municipal" | "trattamento" | "somma" | "premio";
  readonly amount: number;
  readonly sign: 1 | -1;
}

export function netSteps(breakdown: SalaryBreakdown): readonly NetStep[] {
  const steps: NetStep[] = [
    { id: "gross", amount: breakdown.grossAnnual, sign: 1 },
    { id: "inps", amount: breakdown.inpsContribution, sign: -1 },
    { id: "irpefNet", amount: breakdown.irpefNet, sign: -1 },
    { id: "regional", amount: breakdown.regionalTax, sign: -1 },
    { id: "municipal", amount: breakdown.municipalTax, sign: -1 },
    { id: "trattamento", amount: breakdown.trattamentoIntegrativo, sign: 1 },
    { id: "somma", amount: breakdown.sommaAggiuntiva, sign: 1 },
    { id: "premio", amount: breakdown.pdrNet, sign: 1 },
  ];
  return steps.filter((step) => step.id === "gross" || step.amount !== 0);
}

export function inCents(amount: number): number {
  return Math.round(amount * 100);
}
