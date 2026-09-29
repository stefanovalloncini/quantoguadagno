import type { PaymentFrequency, RegionCode, SupportedYear } from "@/data/index.ts";
import type { FringeBenefitsBreakdown, FringeBenefitsInput } from "./fringeBenefitsTypes.ts";
import type { ContractType } from "./employerCostCalculations.ts";
import type { DependentsInput, ExpenseDeductionsInput } from "./deductionCalculations.ts";
import type { PremioRisultatoInput } from "./bonusCalculations.ts";
import type { SpecialConditionsInput } from "./specialConditionsCalculations.ts";
import type { CompanySize, InpsRateOverride } from "./inpsRates.ts";
import type { MunicipalTaxInput } from "./municipalTaxCalculations.ts";

export type { ContractType };
export type { DependentsInput, ExpenseDeductionsInput };
export type { PremioRisultatoInput };
export type { SpecialConditionsInput };
export type { FringeBenefitsInput };
export type { CompanySize, InpsRateOverride };
export type { MunicipalTaxInput };

export type { PaymentFrequency };

export interface SalaryInput {
  readonly grossAnnual: number;
  readonly taxYear: SupportedYear;
  readonly regionCode: RegionCode;
  readonly municipalTaxRate: MunicipalTaxInput;
  readonly contractType?: ContractType;
  readonly paymentFrequency?: PaymentFrequency;
  readonly companySize?: CompanySize;
  readonly isPublicEmployee?: boolean;
  readonly insuredBefore1996?: boolean;
  readonly inpsOverride?: InpsRateOverride | null;
  readonly dependents?: DependentsInput | null;
  readonly expenseDeductions?: ExpenseDeductionsInput | null;
  readonly fringeBenefits?: FringeBenefitsInput | null;
  readonly specialConditions?: SpecialConditionsInput | null;
  readonly premioRisultato?: PremioRisultatoInput | null;
}

export interface SalaryBreakdown {
  readonly grossAnnual: number;
  readonly grossMonthly: number;

  readonly inpsContribution: number;
  readonly inpsRate: number;
  readonly inpsExemption: number;
  readonly madreLavoratriceExemption: number;

  readonly taxableIncome: number;

  readonly irpefGross: number;
  readonly irpefDeduction: number;
  readonly irpefNet: number;

  readonly regimeImpatriatiSavings: number;
  readonly regimeImpatriatiExemptionRate: number;

  readonly regionalTax: number;
  readonly regionalTaxRate: number;
  readonly municipalTax: number;
  readonly municipalTaxRate: number;

  readonly trattamentoIntegrativo: number;
  readonly sommaAggiuntiva: number;
  readonly detrazioneAggiuntiva: number;
  readonly taxWedgeCutTotal: number;

  readonly dependentsDeduction: number;
  readonly expenseDeduction: number;
  readonly pensionFundDeduction: number;

  readonly pdrGross: number;
  readonly pdrInps: number;
  readonly pdrTax: number;
  readonly pdrNet: number;

  readonly totalDeductions: number;
  readonly totalTaxes: number;

  readonly fringeBenefits?: FringeBenefitsBreakdown | undefined;

  readonly netAnnual: number;
  readonly netMonthly: number;
  readonly effectiveTaxRate: number;
  readonly marginalTaxRate: number;
  readonly netToGrossRatio: number;

  readonly employerInps: number;
  readonly employerInpsRate: number;

  readonly tfrAnnual: number;
  readonly tfrMonthly: number;
  readonly tfrRate: number;

  readonly inailContribution: number;
  readonly maternityContribution: number;
  readonly naspiContribution: number;
  readonly naspiAdditionalContribution: number;
  readonly cigContribution: number;
  readonly otherEmployerContributions: number;
  readonly totalOtherEmployerCosts: number;

  readonly totalEmployerCost: number;
  readonly totalEmployerCostMonthly: number;
  readonly employerCostPerNetEuro: number;
}
