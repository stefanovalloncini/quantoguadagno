import type { PowertrainType } from "@/data/index.ts";

// Input and output types for fringe benefit valuation.

export type CompanyCarMode = "simple" | "detailed";

export type CO2EmissionCategory = "electric" | "low" | "medium" | "high";

export type FringePowertrainType = PowertrainType;

export interface CompanyCarInput {
  readonly mode: CompanyCarMode;
  readonly annualBenefitValue?: number;
  readonly co2Emissions?: number;
  readonly aciCostPerKm?: number;
  readonly conventionalKm?: number;
  readonly powertrainType?: FringePowertrainType;
}

export type MealVoucherType = "electronic" | "paper";

export interface MealVouchersInput {
  readonly dailyValue: number;
  readonly workingDaysPerMonth: number;
  readonly type?: MealVoucherType;
}

export interface HealthInsuranceInput {
  readonly annualPremium: number;
}

export interface WelfareInput {
  readonly annualAmount: number;
  readonly hasDependentChildren: boolean;
}

export interface FringeBenefitsInput {
  readonly companyCar?: CompanyCarInput;
  readonly mealVouchers?: MealVouchersInput;
  readonly healthInsurance?: HealthInsuranceInput;
  readonly welfare?: WelfareInput;
}

export interface FringeBenefitsBreakdown {
  readonly totalGrossBenefit: number;
  readonly taxFreeAmount: number;
  readonly taxableAmount: number;
  readonly companyCar: {
    readonly grossValue: number;
    readonly taxableValue: number;
    readonly co2Category?: CO2EmissionCategory;
    readonly powertrainCategory?: FringePowertrainType;
    readonly taxablePercentage?: number;
  };
  readonly mealVouchers: {
    readonly annualValue: number;
    readonly taxFreeThreshold: number;
    readonly taxableValue: number;
  };
  readonly healthInsurance: {
    readonly annualValue: number;
    readonly taxFreeThreshold: number;
    readonly taxableValue: number;
  };
  readonly welfare: {
    readonly annualValue: number;
    readonly taxFreeThreshold: number;
    readonly taxableValue: number;
  };
}
