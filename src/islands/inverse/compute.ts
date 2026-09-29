import type { Comune } from "@/data/index.ts";
import {
  calculateSalaryBreakdown,
  type SalaryBreakdown,
  type SalaryInput,
} from "@/domain/composer.ts";
import { calculateInverseSalary, type InverseSalaryResult } from "@/domain/inverseSalary.ts";
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

const CENTS_PER_EURO = 100;
const SEARCH_WINDOW_CENTS = 1_000;

interface Solution {
  readonly grossAnnual: number;
  readonly breakdown: SalaryBreakdown;
}

function breakdownAt(cents: number, context: Omit<SalaryInput, "grossAnnual">): SalaryBreakdown {
  return calculateSalaryBreakdown({ ...context, grossAnnual: cents / CENTS_PER_EURO });
}

export function lowestGrossReaching(
  target: number,
  solved: InverseSalaryResult,
  context: Omit<SalaryInput, "grossAnnual">,
): Solution {
  const engine = { grossAnnual: solved.grossAnnual, breakdown: solved.breakdown };
  if (!solved.converged || target <= 0) return engine;
  const reaches = (breakdown: SalaryBreakdown) => breakdown.netAnnual >= target;
  const start = Math.round(solved.grossAnnual * CENTS_PER_EURO);
  let low = start - SEARCH_WINDOW_CENTS;
  let high = start + SEARCH_WINDOW_CENTS;
  let highBreakdown = breakdownAt(high, context);
  if (low < 0 || reaches(breakdownAt(low, context)) || !reaches(highBreakdown)) return engine;
  while (high - low > 1) {
    const middle = Math.floor((low + high) / 2);
    const breakdown = breakdownAt(middle, context);
    if (reaches(breakdown)) {
      high = middle;
      highBreakdown = breakdown;
    } else {
      low = middle;
    }
  }
  return { grossAnnual: high / CENTS_PER_EURO, breakdown: highBreakdown };
}

export function computeInverse(values: InverseValues, comune: Comune | null): InverseResult {
  const selected = selectedComune(values.comune, comune);
  const municipal = municipalSource(selected, values.municipalRate, values.taxYear);
  const context = inverseContext(values, municipal);
  const solved = calculateInverseSalary({
    targetNetAnnual: values.targetNetAnnual,
    other: context,
  });
  const settled = lowestGrossReaching(values.targetNetAnnual, solved, context);
  return {
    values,
    comune: selected,
    municipal,
    context,
    grossAnnual: settled.grossAnnual,
    breakdown: settled.breakdown,
    converged: solved.converged,
  };
}
