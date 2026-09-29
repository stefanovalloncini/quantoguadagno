import type { ComunaleRule, SupportedYear } from "@/data/index.ts";
import type { MunicipalSource } from "./municipal.ts";

export interface ComuneAssumption {
  readonly id: string;
  readonly name: string;
  readonly province: string;
  readonly rule: ComunaleRule;
  readonly ruleYear: number;
  readonly carriedOver: boolean;
}

export type LocalAssumption =
  | { readonly id: "comune"; readonly value: ComuneAssumption; readonly fieldToEdit: "comune" }
  | {
      readonly id: "municipalRate";
      readonly value: number;
      readonly fieldToEdit: "municipalRate";
    };

export function localAssumption(result: {
  readonly municipal: MunicipalSource;
  readonly values: { readonly taxYear: SupportedYear };
}): LocalAssumption {
  const { municipal } = result;
  if (municipal.kind === "manual") {
    return { id: "municipalRate", value: municipal.rate, fieldToEdit: "municipalRate" };
  }
  return {
    id: "comune",
    value: {
      id: municipal.comune.id,
      name: municipal.comune.name,
      province: municipal.comune.province,
      rule: municipal.rule,
      ruleYear: municipal.ruleYear,
      carriedOver: municipal.ruleYear < result.values.taxYear,
    },
    fieldToEdit: "comune",
  };
}
