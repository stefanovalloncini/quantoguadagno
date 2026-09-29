import {
  comunaleRuleFor,
  findComune,
  loadRegionComuni,
  type Comune,
  type ComunaleRule,
  type RegionCode,
} from "@/data/index.ts";
import type { MunicipalTaxInput } from "@/domain/municipalTaxCalculations.ts";

export type MunicipalSource =
  | {
      readonly kind: "comune";
      readonly comune: Comune;
      readonly rule: ComunaleRule;
      readonly ruleYear: number;
    }
  | { readonly kind: "manual"; readonly rate: number };

export function municipalSource(
  comune: Comune | null,
  manualRate: number,
  year: number,
): MunicipalSource {
  const found = comune === null ? null : comunaleRuleFor(comune, year);
  if (comune === null || found === null) return { kind: "manual", rate: manualRate };
  return { kind: "comune", comune, rule: found.rule, ruleYear: found.year };
}

export function municipalInput(source: MunicipalSource): MunicipalTaxInput {
  return source.kind === "comune" ? source.rule : source.rate;
}

export function selectedComune(id: string | null, comune: Comune | null): Comune | null {
  return id !== null && comune?.id === id ? comune : null;
}

export async function loadComune(region: RegionCode, id: string): Promise<Comune | null> {
  const regionComuni = await loadRegionComuni(region);
  return findComune(regionComuni, id) ?? null;
}
