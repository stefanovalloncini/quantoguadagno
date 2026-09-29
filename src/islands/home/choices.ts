import {
  LATEST_SUPPORTED_YEAR,
  type PaymentFrequency,
  type RegionCode,
  type SupportedYear,
} from "@/data/index.ts";
import type { ContractType } from "@/domain/employerCostCalculations.ts";
import type {
  CompanyCarMode,
  FringePowertrainType,
  MealVoucherType,
} from "@/domain/fringeBenefitsTypes.ts";
import type { CompanySize } from "@/domain/inpsRates.ts";
import { getTaxConfig } from "@/domain/taxConfig.ts";
import type { FieldMessages, NumberRule } from "./fields.ts";

export type SalaryMode = "gross" | "net";

export const SALARY_MODES: readonly SalaryMode[] = ["gross", "net"];
export const PAYMENT_FREQUENCIES: readonly PaymentFrequency[] = [12, 13, 14, 15, 16];
export const CONTRACT_TYPES: readonly ContractType[] = [
  "indeterminato",
  "determinato",
  "apprendistato",
];
export const COMPANY_SIZES: readonly CompanySize[] = ["small", "large"];
export const COMPANY_CAR_MODES: readonly CompanyCarMode[] = ["simple", "detailed"];
export const POWERTRAINS: readonly FringePowertrainType[] = ["bev", "phev", "other"];
export const MEAL_VOUCHER_TYPES: readonly MealVoucherType[] = ["electronic", "paper"];

export const DEFAULT_GROSS_ANNUAL = 30_000;
export const DEFAULT_TARGET_NET_MONTHLY = 1_800;
export const DEFAULT_YEAR: SupportedYear = LATEST_SUPPORTED_YEAR;
export const DEFAULT_PAYMENT_FREQUENCY: PaymentFrequency = 13;
export const DEFAULT_CONTRACT_TYPE: ContractType = "indeterminato";
export const DEFAULT_REGION: RegionCode = "lombardia";
export const DEFAULT_MUNICIPAL_RATE = 0.008;
export const DEFAULT_CONVENTIONAL_KM = 15_000;
export const DEFAULT_MEAL_VOUCHER_DAYS = 22;
export const DEFAULT_MADRE_CHILDREN = 3;
export const DEFAULT_MADRE_YOUNGEST_CHILD_AGE = 5;

export function usesPowertrainRates(year: SupportedYear): boolean {
  return getTaxConfig(year).fringeBenefits.companyCarPowertrainRates !== undefined;
}

export const RAL_MESSAGES: FieldMessages = {
  required: "field.error.ral.required",
  invalid: "field.error.ral.invalid",
  range: "field.error.ral.range",
};

export const MUNICIPAL_RATE_RULE: NumberRule = { kind: "percent", min: 0, max: 1.5 };
