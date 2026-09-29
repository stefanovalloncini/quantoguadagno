import type { Comune } from "@/data/index.ts";
import {
  calculateSalaryBreakdown,
  type SalaryBreakdown,
  type SalaryInput,
} from "@/domain/composer.ts";
import {
  municipalInput,
  municipalSource,
  selectedComune,
  type MunicipalSource,
} from "@/islands/home/municipal.ts";
import type { EmployerCostValues } from "./state.ts";

export interface EmployerCostResult {
  readonly values: EmployerCostValues;
  readonly comune: Comune | null;
  readonly municipal: MunicipalSource;
  readonly input: SalaryInput;
  readonly breakdown: SalaryBreakdown;
}

export function employerCostInput(
  values: EmployerCostValues,
  municipal: MunicipalSource,
): SalaryInput {
  return {
    grossAnnual: values.grossAnnual,
    taxYear: values.taxYear,
    regionCode: values.regionCode,
    municipalTaxRate: municipalInput(municipal),
    contractType: values.contractType,
    paymentFrequency: values.paymentFrequency,
  };
}

export function computeEmployerCost(
  values: EmployerCostValues,
  comune: Comune | null,
): EmployerCostResult {
  const selected = selectedComune(values.comune, comune);
  const municipal = municipalSource(selected, values.municipalRate, values.taxYear);
  const input = employerCostInput(values, municipal);
  return {
    values,
    comune: selected,
    municipal,
    input,
    breakdown: calculateSalaryBreakdown(input),
  };
}
