import {
  adjustValueAcrossYears,
  calculateSalaryBreakdown,
  type AdjustedValue,
  type SalaryBreakdown,
  type SalaryInput,
} from "@/domain/index.ts";
import { isSupportedYear, LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import type { SalaryEntry } from "./storage.ts";

export function buildSalaryInput(entry: SalaryEntry): SalaryInput | null {
  if (!isSupportedYear(entry.year)) return null;
  const s = entry.settings;
  return {
    grossAnnual: entry.grossAnnual,
    taxYear: entry.year,
    regionCode: s.regionCode,
    municipalTaxRate: s.municipalTaxRate,
    contractType: s.contractType,
    paymentFrequency: s.paymentFrequency,
    ...(s.companySize !== undefined ? { companySize: s.companySize } : {}),
    ...(s.dependents !== undefined ? { dependents: s.dependents } : {}),
  };
}

export function computeHistoryNet(entry: SalaryEntry): SalaryBreakdown | null {
  const input = buildSalaryInput(entry);
  if (input === null) return null;
  return calculateSalaryBreakdown(input);
}

export function adjustedValueFor(entry: SalaryEntry, targetYear: number): AdjustedValue | null {
  return adjustValueAcrossYears(entry.grossAnnual, entry.year, targetYear);
}

export interface ProjectionYear {
  readonly year: number;
  readonly grossAnnual: number;
  readonly net: SalaryBreakdown | null;
}

export interface ProjectSalaryInput {
  readonly baseEntry: SalaryEntry;
  readonly horizonYears: number;
  readonly growthRate: number;
}

export function projectSalary({
  baseEntry,
  horizonYears,
  growthRate,
}: ProjectSalaryInput): readonly ProjectionYear[] {
  const baseInput = buildSalaryInput(baseEntry);
  if (baseInput === null) return [];

  const out: ProjectionYear[] = [];
  for (let i = 1; i <= horizonYears; i += 1) {
    const factor = (1 + growthRate) ** i;
    const gross = Math.max(0, Math.round(baseEntry.grossAnnual * factor));
    const net = calculateSalaryBreakdown({
      ...baseInput,
      grossAnnual: gross,
      taxYear: LATEST_SUPPORTED_YEAR,
    });
    out.push({ year: baseEntry.year + i, grossAnnual: gross, net });
  }
  return out;
}
