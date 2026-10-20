import type { Comune } from "@/data/index.ts";
import type { SalaryBreakdown, SalaryInput } from "@/domain/composer.ts";
import { calculateInverseSalary } from "@/domain/inverseSalary.ts";
import {
  municipalInput,
  municipalSource,
  selectedComune,
  type MunicipalSource,
} from "@/islands/home/municipal.ts";
import type { InverseValues } from "./state.ts";

export interface InverseResult {
  readonly values: InverseValues;
  readonly comune: Comune | null;
  readonly municipal: MunicipalSource;
  readonly context: Omit<SalaryInput, "grossAnnual">;
  readonly grossAnnual: number;
  readonly breakdown: SalaryBreakdown;
  readonly converged: boolean;
}

export function inverseContext(
  values: InverseValues,
  municipal: MunicipalSource,
): Omit<SalaryInput, "grossAnnual"> {
  return {
    taxYear: values.taxYear,
    regionCode: values.regionCode,
    municipalTaxRate: municipalInput(municipal),
    contractType: values.contractType,
    paymentFrequency: values.paymentFrequency,
    companySize: values.companySize,
    isPublicEmployee: values.isPublicEmployee,
  };
}

export function computeInverse(values: InverseValues, comune: Comune | null): InverseResult {
  const selected = selectedComune(values.comune, comune);
  const municipal = municipalSource(selected, values.municipalRate, values.taxYear);
  const context = inverseContext(values, municipal);
  const solved = calculateInverseSalary({
    targetNetAnnual: values.targetNetAnnual,
    other: context,
  });
  return {
    values,
    comune: selected,
    municipal,
    context,
    grossAnnual: solved.grossAnnual,
    breakdown: solved.breakdown,
    converged: solved.converged,
  };
}
