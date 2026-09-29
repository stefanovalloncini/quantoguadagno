import type { PaymentFrequency, RegionCode, SupportedYear } from "@/data/index.ts";
import type { SalaryBreakdown } from "@/domain/composer.ts";
import type { ContractType } from "@/domain/employerCostCalculations.ts";
import type { CompanySize, InpsRateOverride } from "@/domain/inpsRates.ts";
import type { EmployeeResult } from "@/islands/home/compute.ts";
import {
  ledgerLine,
  localAssumption,
  type LedgerLine,
  type LocalAssumption,
} from "@/islands/home/derive.ts";
import { roundTo } from "@/islands/home/fields.ts";

export interface PayslipSummary {
  readonly year: SupportedYear;
  readonly paymentFrequency: PaymentFrequency;
  readonly grossAnnual: number;
  readonly earnings: number;
  readonly withholdings: number;
  readonly netAnnual: number;
  readonly netMonthly: number;
}

export function payslipSummary(result: EmployeeResult): PayslipSummary {
  const { breakdown, values } = result;
  return {
    year: values.taxYear,
    paymentFrequency: values.paymentFrequency,
    grossAnnual: breakdown.grossAnnual,
    earnings: roundTo(
      breakdown.grossAnnual +
        breakdown.trattamentoIntegrativo +
        breakdown.sommaAggiuntiva +
        breakdown.pdrNet,
      2,
    ),
    withholdings: breakdown.totalTaxes,
    netAnnual: breakdown.netAnnual,
    netMonthly: breakdown.netMonthly,
  };
}

export type PayslipInput =
  | { readonly id: "gross"; readonly value: number }
  | { readonly id: "year"; readonly value: SupportedYear }
  | { readonly id: "region"; readonly value: RegionCode }
  | LocalAssumption
  | { readonly id: "contract"; readonly value: ContractType }
  | { readonly id: "frequency"; readonly value: PaymentFrequency }
  | { readonly id: "companySize"; readonly value: CompanySize }
  | { readonly id: "publicEmployee"; readonly value: true }
  | { readonly id: "inpsOverride"; readonly value: InpsRateOverride };

export function payslipInputs(result: EmployeeResult): readonly PayslipInput[] {
  const { values } = result;
  return [
    { id: "gross", value: result.input.grossAnnual },
    { id: "year", value: values.taxYear },
    { id: "region", value: values.regionCode },
    localAssumption(result),
    { id: "contract", value: values.contractType },
    { id: "frequency", value: values.paymentFrequency },
    { id: "companySize", value: values.companySize },
    ...(values.isPublicEmployee ? [{ id: "publicEmployee", value: true } as const] : []),
    ...(values.inpsOverride === null
      ? []
      : [{ id: "inpsOverride", value: values.inpsOverride } as const]),
  ];
}

function whenPositive(line: LedgerLine): readonly LedgerLine[] {
  return line.amount > 0 ? [line] : [];
}

export function payslipLines(breakdown: SalaryBreakdown): readonly LedgerLine[] {
  return [
    ledgerLine("gross", "gross", breakdown.grossAnnual),
    ledgerLine("inps", "contributions", breakdown.inpsContribution, {
      rate: breakdown.inpsRate,
      deducted: true,
    }),
    ledgerLine("taxableIncome", "contributions", breakdown.taxableIncome, { total: true }),
    ledgerLine("irpefGross", "taxes", breakdown.irpefGross, { deducted: true }),
    ...whenPositive(ledgerLine("totalDeductions", "taxes", breakdown.totalDeductions)),
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
    ...whenPositive(ledgerLine("pdrNet", "pdr", breakdown.pdrNet)),
    ledgerLine("netAnnual", "net", breakdown.netAnnual, { total: true }),
  ];
}

export interface PayslipDerived {
  readonly summary: PayslipSummary;
  readonly inputs: readonly PayslipInput[];
  readonly lines: readonly LedgerLine[];
}

export function derivePayslip(result: EmployeeResult): PayslipDerived {
  return {
    summary: payslipSummary(result),
    inputs: payslipInputs(result),
    lines: payslipLines(result.breakdown),
  };
}
