import type { YearlyTaxConfig } from "./taxConfig.ts";
import { calculateInpsExemption2024 } from "./inpsExemption2024.ts";
import { calculateMadreLavoratriceExemption } from "./specialConditionsCalculations.ts";
import { resolveInpsRates } from "./inpsRates.ts";
import type { SalaryInput } from "./composerTypes.ts";

export interface EmployeeInpsResult {
  readonly contribution: number;
  readonly effectiveRate: number;
  readonly exemption: number;
  readonly madreLavoratriceExemption: number;
  readonly standardRate: number;
}

export function calculateEmployeeInps(
  grossAnnual: number,
  input: SalaryInput,
  cfg: YearlyTaxConfig,
): EmployeeInpsResult {
  const contractType = input.contractType ?? "indeterminato";
  const paymentFrequency = input.paymentFrequency ?? 12;
  const { standardRate, aboveCeilingRate } = resolveInpsRates(cfg.inps, {
    contractType,
    companySize: input.companySize,
    isPublicEmployee: input.isPublicEmployee,
    override: input.inpsOverride ?? undefined,
  });

  const cappedGross = input.insuredBefore1996
    ? grossAnnual
    : Math.min(grossAnnual, cfg.inps.massimale);
  const belowCeiling = Math.min(cappedGross, cfg.inps.ceiling);
  const aboveCeiling = Math.max(0, cappedGross - cfg.inps.ceiling);
  const baseContribution = belowCeiling * standardRate + aboveCeiling * aboveCeilingRate;

  const exemption = cfg.inpsExemption2024
    ? Math.min(
        baseContribution,
        calculateInpsExemption2024(grossAnnual, paymentFrequency, cfg.inpsExemption2024),
      )
    : 0;

  const afterExemption = baseContribution - exemption;

  const madreLavoratriceExemption = calculateMadreLavoratriceExemption(
    afterExemption,
    input.specialConditions?.madreLavoratrice,
    cfg.madreLavoratrice,
  );

  const contribution = Math.max(0, afterExemption - madreLavoratriceExemption);
  const effectiveRate = grossAnnual > 0 ? contribution / grossAnnual : 0;

  return { contribution, effectiveRate, exemption, madreLavoratriceExemption, standardRate };
}
