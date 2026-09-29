import { countUnverified, type RegionCode, type SupportedYear } from "@/data/index.ts";

const NASPI_PREFIXES = ["naspi.", "irpef.brackets", "irpef.workDeduction"];

export function naspiValuesToVerify(year: SupportedYear, region: RegionCode | null): number {
  const prefixes = region === null ? NASPI_PREFIXES : [...NASPI_PREFIXES, `regions.${region}`];
  return countUnverified(year, prefixes);
}
