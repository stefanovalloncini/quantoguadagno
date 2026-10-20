import type { SalaryBreakdown, SalaryInput } from "./composerTypes.ts";
import type { IrpefBracket } from "./irpef.ts";
import { applyProgressiveBrackets } from "./irpef.ts";
import { getTaxConfig } from "./taxConfig.ts";
import { sommaAggiuntivaRate, type TaxWedgeCutConfig } from "./taxWedgeCut.ts";
import { round } from "./_math.ts";

const MONTHS_PER_YEAR = 12;

export interface TredicesimaInput {
  readonly ral: number;
  readonly mensilita: number;
  readonly inpsRate: number;
  readonly brackets: readonly IrpefBracket[];
  readonly taxWedgeCut?: TaxWedgeCutConfig | null;
  readonly annualTaxableIncome?: number;
}

export interface TredicesimaResult {
  readonly gross: number;
  readonly inps: number;
  readonly taxable: number;
  readonly monthlyBrackets: readonly IrpefBracket[];
  readonly irpef: number;
  readonly sommaRate: number;
  readonly somma: number;
  readonly net: number;
  readonly effectiveRate: number;
  readonly extraMonths: number;
  readonly grossTotal: number;
  readonly netTotal: number;
}

const EMPTY: TredicesimaResult = {
  gross: 0,
  inps: 0,
  taxable: 0,
  monthlyBrackets: [],
  irpef: 0,
  sommaRate: 0,
  somma: 0,
  net: 0,
  effectiveRate: 0,
  extraMonths: 0,
  grossTotal: 0,
  netTotal: 0,
};

export function monthlyBrackets(brackets: readonly IrpefBracket[]): readonly IrpefBracket[] {
  return brackets.map((bracket) => ({
    min: bracket.min / MONTHS_PER_YEAR,
    max: bracket.max === null ? null : bracket.max / MONTHS_PER_YEAR,
    rate: bracket.rate,
  }));
}

// Each extra month (tredicesima, quattordicesima) is one month's gross. Payroll
// withholds IRPEF on it alone, with the annual brackets divided by 12 and no
// detrazioni (art. 23 c. 2 lett. b DPR 600/1973), and withholds no addizionali.
// From 2025 the wedge cut adds its percentage of the income paid in the month
// (Circ. AdE 4/E/2025). The year-end conguaglio then settles the annual IRPEF.
export function calculateTredicesima(input: TredicesimaInput): TredicesimaResult {
  const { ral, mensilita, inpsRate, brackets, taxWedgeCut } = input;
  if (ral <= 0 || mensilita <= MONTHS_PER_YEAR) return EMPTY;

  const gross = round(ral / mensilita);
  const inps = round(gross * inpsRate);
  const taxable = round(gross - inps);

  const perMonth = monthlyBrackets(brackets);
  const irpef = round(applyProgressiveBrackets(taxable, perMonth));

  const annualTaxable = input.annualTaxableIncome ?? round(ral - round(ral * inpsRate));
  const sommaRate = taxWedgeCut ? sommaAggiuntivaRate(annualTaxable, taxWedgeCut) : 0;
  const somma = round(taxable * sommaRate);

  const net = round(gross - inps - irpef + somma);
  const effectiveRate = round((inps + irpef) / gross, 4);
  const extraMonths = mensilita - MONTHS_PER_YEAR;

  return {
    gross,
    inps,
    taxable,
    monthlyBrackets: perMonth,
    irpef,
    sommaRate,
    somma,
    net,
    effectiveRate,
    extraMonths,
    grossTotal: round(gross * extraMonths),
    netTotal: round(net * extraMonths),
  };
}

export interface YearSplitInput {
  readonly netAnnual: number;
  readonly mensilita: number;
  readonly extraMonthNet: number;
}

export interface YearSplit {
  readonly ordinaryMonth: number;
  readonly extraMonth: number;
  readonly extraMonths: number;
}

// The twelve ordinary payslips share what the extra months leave of the year's
// net, year-end conguaglio included.
export function splitYearNet({ netAnnual, mensilita, extraMonthNet }: YearSplitInput): YearSplit {
  const extraMonths = Math.max(0, mensilita - MONTHS_PER_YEAR);
  const extraMonth = extraMonths > 0 ? extraMonthNet : 0;
  return {
    ordinaryMonth: round((netAnnual - extraMonth * extraMonths) / MONTHS_PER_YEAR),
    extraMonth,
    extraMonths,
  };
}

// The extra month follows the plain payroll rule only when nothing in the year is
// paid, taxed or exempted on a schedule of its own: no premio di risultato, no
// taxed benefits, no impatriati or madri lavoratrici exemption, no pension fund
// deduction.
export function isPlainSalary(breakdown: SalaryBreakdown): boolean {
  return (
    breakdown.pdrGross === 0 &&
    (breakdown.fringeBenefits?.taxableAmount ?? 0) === 0 &&
    breakdown.regimeImpatriatiExemptionRate === 0 &&
    breakdown.madreLavoratriceExemption === 0 &&
    breakdown.pensionFundDeduction === 0
  );
}

// The INPS massimale is annual (art. 2 c. 18 L. 335/1995): once the year's pay
// reaches it no more contributions are due, so an extra month paid after that
// point pays fewer than the year's average rate, or none.
function passesMassimale(
  input: SalaryInput,
  breakdown: SalaryBreakdown,
  massimale: number,
): boolean {
  return input.insuredBefore1996 !== true && breakdown.grossAnnual > massimale;
}

// The extra month pays the INPS rate the year applied before the 2024 cut, which
// left the extra months out (art. 1 c. 15 L. 213/2023).
export function splitSalaryYear(input: SalaryInput, breakdown: SalaryBreakdown): YearSplit | null {
  const mensilita = input.paymentFrequency ?? MONTHS_PER_YEAR;
  if (mensilita <= MONTHS_PER_YEAR || breakdown.grossAnnual <= 0) return null;
  if (!isPlainSalary(breakdown)) return null;
  const cfg = getTaxConfig(input.taxYear);
  if (passesMassimale(input, breakdown, cfg.inps.massimale)) return null;
  const extra = calculateTredicesima({
    ral: breakdown.grossAnnual,
    mensilita,
    inpsRate: (breakdown.inpsContribution + breakdown.inpsExemption) / breakdown.grossAnnual,
    brackets: cfg.irpefBrackets,
    taxWedgeCut: cfg.taxWedgeCut,
    annualTaxableIncome: breakdown.taxableIncome,
  });
  return splitYearNet({ netAnnual: breakdown.netAnnual, mensilita, extraMonthNet: extra.net });
}
