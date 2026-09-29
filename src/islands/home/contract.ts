import type { ContractType } from "@/domain/employerCostCalculations.ts";
import { resolveInpsRates, type CompanySize, type InpsRateOverride } from "@/domain/inpsRates.ts";
import { getTaxConfig } from "@/domain/taxConfig.ts";
import type { SupportedYear } from "@/data/index.ts";

export interface ContractAssumption {
  readonly contractType: ContractType;
  readonly isPublicEmployee: boolean;
  readonly companySize: CompanySize;
  readonly insuredBefore1996: boolean;
  readonly inpsOverride: InpsRateOverride | null;
  readonly employeeInpsRate: number;
}

export interface ContractFacts {
  readonly taxYear: SupportedYear;
  readonly contractType: ContractType;
  readonly isPublicEmployee: boolean;
  readonly companySize: CompanySize;
  readonly insuredBefore1996: boolean;
  readonly inpsOverride: InpsRateOverride | null;
}

export function contractAssumption(values: ContractFacts): ContractAssumption {
  const rates = resolveInpsRates(getTaxConfig(values.taxYear).inps, {
    contractType: values.contractType,
    companySize: values.companySize,
    isPublicEmployee: values.isPublicEmployee,
    override: values.inpsOverride ?? undefined,
  });
  return {
    contractType: values.contractType,
    isPublicEmployee: values.isPublicEmployee,
    companySize: values.companySize,
    insuredBefore1996: values.insuredBefore1996,
    inpsOverride: values.inpsOverride,
    employeeInpsRate: rates.standardRate,
  };
}
