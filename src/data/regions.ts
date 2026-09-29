import type { RegionalTaxRules } from "./params/regions.ts";
import { REGION_INFO, type RegionCode } from "./regionInfo.ts";
import { param, SUPPORTED_YEARS, yearStart, type SupportedYear } from "./registry.ts";

export interface Region {
  readonly code: RegionCode;
  readonly name: string;
  readonly rules: Readonly<Record<SupportedYear, RegionalTaxRules>>;
}

export const REGION_CODES = Object.keys(REGION_INFO) as readonly RegionCode[];

export function regionRules(code: RegionCode, year: SupportedYear): RegionalTaxRules {
  return param(`regions.${code}`, yearStart(year));
}

function buildRegion(code: RegionCode): Region {
  const rules = Object.fromEntries(
    SUPPORTED_YEARS.map((year) => [year, regionRules(code, year)]),
  ) as Record<SupportedYear, RegionalTaxRules>;
  return { code, name: REGION_INFO[code].name, rules };
}

export const REGIONS: Readonly<Record<RegionCode, Region>> = Object.fromEntries(
  REGION_CODES.map((code) => [code, buildRegion(code)]),
) as Record<RegionCode, Region>;

export const REGIONS_LIST: readonly Region[] = Object.values(REGIONS).sort((a, b) =>
  a.name.localeCompare(b.name, "it"),
);
