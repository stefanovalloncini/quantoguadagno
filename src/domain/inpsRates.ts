import type { InpsConfig } from "./taxConfig.ts";
import type { ContractType } from "./employerCostCalculations.ts";

export type CompanySize = "small" | "large";

export interface InpsRateOverride {
  readonly employeeRate: number;
  readonly employerRate: number;
}

export interface InpsRateContext {
  readonly contractType: ContractType;
  readonly companySize?: CompanySize | undefined;
  readonly isPublicEmployee?: boolean | undefined;
  readonly override?: InpsRateOverride | undefined;
}

export interface InpsRates {
  readonly standardRate: number;
  readonly aboveCeilingRate: number;
}

// Priority: override > public employee > apprendistato > large company > standard.
// Public sector takes precedence over apprendistato because public apprenticeships
// are uncommon and the IVS rate is the binding constraint when both apply.
export function resolveInpsRates(cfg: InpsConfig, ctx: InpsRateContext): InpsRates {
  if (ctx.override) {
    return {
      standardRate: ctx.override.employeeRate,
      aboveCeilingRate: ctx.override.employeeRate,
    };
  }

  if (ctx.isPublicEmployee && cfg.publicEmployeeRate !== undefined) {
    return {
      standardRate: cfg.publicEmployeeRate,
      aboveCeilingRate: cfg.publicEmployeeAboveCeilingRate ?? cfg.publicEmployeeRate,
    };
  }

  if (ctx.contractType === "apprendistato" && cfg.apprenticeshipRate !== undefined) {
    return {
      standardRate: cfg.apprenticeshipRate,
      aboveCeilingRate: cfg.apprenticeshipRate,
    };
  }

  const cigs = ctx.companySize === "large" ? (cfg.largeCompanyAdditionalRate ?? 0) : 0;
  return {
    standardRate: cfg.standardRate + cigs,
    aboveCeilingRate: cfg.aboveCeilingRate + cigs,
  };
}

export function resolveEmployerInpsRate(
  cfg: { readonly rate: number; readonly apprenticeshipRate: number },
  contractType: ContractType,
  override?: InpsRateOverride,
): number {
  if (override) return override.employerRate;
  if (contractType === "apprendistato") return cfg.apprenticeshipRate;
  return cfg.rate;
}
