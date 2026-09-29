import {
  isSupportedYear,
  REGION_CODES,
  type PaymentFrequency,
  type RegionCode,
  type SupportedYear,
} from "@/data/index.ts";
import type { ContractType } from "@/domain/employerCostCalculations.ts";
import type { CompanySize } from "@/domain/inpsRates.ts";
import type { FormControlValue } from "@/islands/runtime/formControls.ts";
import { COMPANY_SIZES, CONTRACT_TYPES, PAYMENT_FREQUENCIES } from "./choices.ts";
import { isOneOf } from "./fields.ts";

const COMUNE_ID = /^[A-Za-z]\d{3}$/;

export function comuneIdOf(raw: string): string | null {
  const trimmed = raw.trim();
  return COMUNE_ID.test(trimmed) ? trimmed.toUpperCase() : null;
}

export interface SalaryChoices {
  readonly year: SupportedYear;
  readonly paymentFrequency: PaymentFrequency;
  readonly contractType: ContractType;
  readonly region: RegionCode;
  readonly comune: string | null;
  readonly companySize: CompanySize;
  readonly isPublicEmployee: boolean;
}

export type SalaryChoiceChange = {
  readonly [K in keyof SalaryChoices]: { readonly field: K; readonly value: SalaryChoices[K] };
}[keyof SalaryChoices];

function booleanChoice(name: string, value: boolean): SalaryChoiceChange | null {
  if (name === "companySize") return { field: "companySize", value: value ? "large" : "small" };
  if (name === "isPublicEmployee") return { field: "isPublicEmployee", value };
  return null;
}

function comuneChoice(value: string): SalaryChoiceChange | null {
  if (value.trim() === "") return { field: "comune", value: null };
  const id = comuneIdOf(value);
  return id === null ? null : { field: "comune", value: id };
}

export function salaryChoiceChange(
  name: string,
  value: FormControlValue,
): SalaryChoiceChange | null {
  if (typeof value === "boolean") return booleanChoice(name, value);
  switch (name) {
    case "year": {
      const year = Number(value);
      return value.trim() !== "" && isSupportedYear(year) ? { field: "year", value: year } : null;
    }
    case "paymentFrequency": {
      const frequency = Number(value);
      return isOneOf(frequency, PAYMENT_FREQUENCIES)
        ? { field: "paymentFrequency", value: frequency }
        : null;
    }
    case "contractType":
      return isOneOf(value, CONTRACT_TYPES) ? { field: "contractType", value } : null;
    case "region":
      return isOneOf(value, REGION_CODES) ? { field: "region", value } : null;
    case "comune":
      return comuneChoice(value);
    case "companySize":
      return isOneOf(value, COMPANY_SIZES) ? { field: "companySize", value } : null;
    default:
      return null;
  }
}
