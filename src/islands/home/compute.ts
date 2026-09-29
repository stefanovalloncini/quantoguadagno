import type { Comune, SupportedYear } from "@/data/index.ts";
import {
  calculateSalaryBreakdown,
  type SalaryBreakdown,
  type SalaryInput,
} from "@/domain/composer.ts";
import { calculateInverseSalary } from "@/domain/inverseSalary.ts";
import {
  loadComune,
  municipalInput,
  municipalSource,
  selectedComune,
  type MunicipalSource,
} from "./municipal.ts";
import type { EmployeeValues } from "./state.ts";

export { loadComune, municipalInput, municipalSource, selectedComune, type MunicipalSource };

export type SalaryContext = Omit<SalaryInput, "grossAnnual">;

export function salaryContextOf(values: EmployeeValues, municipal: MunicipalSource): SalaryContext {
  return {
    taxYear: values.taxYear,
    regionCode: values.regionCode,
    municipalTaxRate: municipalInput(municipal),
    contractType: values.contractType,
    paymentFrequency: values.paymentFrequency,
    companySize: values.companySize,
    isPublicEmployee: values.isPublicEmployee,
    insuredBefore1996: values.insuredBefore1996,
    inpsOverride: values.inpsOverride,
    dependents: values.dependents,
    expenseDeductions: values.expenseDeductions,
    fringeBenefits: values.fringeBenefits,
    specialConditions: values.specialConditions,
    premioRisultato: values.premioRisultato,
  };
}

export interface NetSolve {
  readonly targetNetAnnual: number;
  readonly converged: boolean;
}

export interface EmployeeResult {
  readonly values: EmployeeValues;
  readonly comune: Comune | null;
  readonly municipal: MunicipalSource;
  readonly input: SalaryInput;
  readonly breakdown: SalaryBreakdown;
  readonly solve: NetSolve | null;
}

export function computeEmployee(values: EmployeeValues, comune: Comune | null): EmployeeResult {
  const selected = selectedComune(values.comune, comune);
  const municipal = municipalSource(selected, values.municipalRate, values.taxYear);
  const context = salaryContextOf(values, municipal);
  if (values.amount.mode === "gross") {
    const input: SalaryInput = { ...context, grossAnnual: values.amount.grossAnnual };
    return {
      values,
      comune: selected,
      municipal,
      input,
      breakdown: calculateSalaryBreakdown(input),
      solve: null,
    };
  }
  const targetNetAnnual = values.amount.targetNetMonthly * values.paymentFrequency;
  const solved = calculateInverseSalary({ targetNetAnnual, other: context });
  const input: SalaryInput = { ...context, grossAnnual: Math.round(solved.grossAnnual) };
  return {
    values,
    comune: selected,
    municipal,
    input,
    breakdown: calculateSalaryBreakdown(input),
    solve: { targetNetAnnual, converged: solved.converged },
  };
}

export function salaryInputForYear(result: EmployeeResult, year: SupportedYear): SalaryInput {
  const municipal = municipalSource(result.comune, result.values.municipalRate, year);
  return { ...result.input, taxYear: year, municipalTaxRate: municipalInput(municipal) };
}
