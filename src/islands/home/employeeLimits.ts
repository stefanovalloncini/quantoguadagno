import type { SupportedYear } from "@/data/index.ts";
import { getTaxConfig } from "@/domain/taxConfig.ts";
import { usesPowertrainRates } from "./choices.ts";

const DEPENDANT_RULES_FROM: SupportedYear = 2025;

export interface EmployeeLimits {
  readonly year: SupportedYear;
  readonly massimale: number;
  readonly spouseIncomeLimit: number;
  readonly dependantRulesFrom2025: boolean;
  readonly premio: { readonly rate: number; readonly maxAmount: number };
  readonly mealVouchers: { readonly electronic: number; readonly paper: number };
  readonly welfare: { readonly general: number; readonly withChildren: number };
  readonly healthInsurance: number;
  readonly companyCarByPowertrain: boolean;
  readonly maxPensionFund: number;
  readonly maxMortgageInterest: number;
  readonly medicalExpenseFloor: number;
  readonly employeeInpsRate: number;
  readonly employerInpsRate: number;
}

export function employeeLimits(year: SupportedYear): EmployeeLimits {
  const config = getTaxConfig(year);
  const fringe = config.fringeBenefits;
  return {
    year,
    massimale: config.inps.massimale,
    spouseIncomeLimit: config.dependentsDeduction.dependentIncomeLimit,
    dependantRulesFrom2025: year >= DEPENDANT_RULES_FROM,
    premio: { rate: config.pdrSostitutiva.rate, maxAmount: config.pdrSostitutiva.maxAmount },
    mealVouchers: {
      electronic: fringe.mealVouchersDailyThreshold,
      paper: fringe.mealVouchersPaperThreshold,
    },
    welfare: {
      general: fringe.welfareThresholdGeneral,
      withChildren: fringe.welfareThresholdWithChildren,
    },
    healthInsurance: fringe.healthInsuranceThreshold,
    companyCarByPowertrain: usesPowertrainRates(year),
    maxPensionFund: config.expenseDeductions.maxPensionFund,
    maxMortgageInterest: config.expenseDeductions.maxMortgageInterest,
    medicalExpenseFloor: config.expenseDeductions.medicalExpenseFloor,
    employeeInpsRate: config.inps.standardRate,
    employerInpsRate: config.employerInps.rate,
  };
}
