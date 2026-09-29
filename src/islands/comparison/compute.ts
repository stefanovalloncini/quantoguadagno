import { comunaleRuleFor, type Comune } from "@/data/index.ts";
import { calculateSalaryBreakdown, type SalaryBreakdown } from "@/domain/composer.ts";
import type { MunicipalSource } from "@/islands/home/compute.ts";
import type { EmployeeValues } from "@/islands/home/state.ts";
import type { Offers } from "./state.ts";

export interface OfferResult {
  readonly values: EmployeeValues;
  readonly municipal: MunicipalSource;
  readonly breakdown: SalaryBreakdown;
}

export type ComparedOffers = Offers<OfferResult>;

function municipalOf(values: EmployeeValues, comune: Comune | null): MunicipalSource {
  const chosen = comune !== null && comune.id === values.comune ? comune : null;
  const found = chosen === null ? null : comunaleRuleFor(chosen, values.taxYear);
  if (chosen === null || found === null) return { kind: "manual", rate: values.municipalRate };
  return { kind: "comune", comune: chosen, rule: found.rule, ruleYear: found.year };
}

export function computeOffer(
  values: EmployeeValues | null,
  comune: Comune | null,
): OfferResult | null {
  if (values?.amount.mode !== "gross") return null;
  const municipal = municipalOf(values, comune);
  const breakdown = calculateSalaryBreakdown({
    grossAnnual: values.amount.grossAnnual,
    taxYear: values.taxYear,
    regionCode: values.regionCode,
    municipalTaxRate: municipal.kind === "comune" ? municipal.rule : municipal.rate,
    contractType: values.contractType,
    paymentFrequency: values.paymentFrequency,
    companySize: values.companySize,
    isPublicEmployee: values.isPublicEmployee,
    insuredBefore1996: values.insuredBefore1996,
    inpsOverride: values.inpsOverride,
    dependents: values.dependents,
    expenseDeductions: values.expenseDeductions,
    fringeBenefits: values.fringeBenefits,
    specialConditions: values.specialConditions,
    premioRisultato: values.premioRisultato,
  });
  return { values, municipal, breakdown };
}
