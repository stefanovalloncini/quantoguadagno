import index from "./comuni/index.json";
import type { RegionCode } from "./params/regions.ts";
import type { IsoDate, Source } from "./types.ts";

export interface ComunaleBracket {
  readonly upTo: number | null;
  readonly rate: number;
}

interface ComunaleRuleExtras {
  readonly exemption?: number;
  readonly note?: string;
}

export type ComunaleRule =
  | (ComunaleRuleExtras & { readonly rate: number; readonly brackets?: never })
  | (ComunaleRuleExtras & { readonly brackets: readonly ComunaleBracket[]; readonly rate?: never });

export interface Comune {
  readonly id: string;
  readonly name: string;
  readonly province: string;
  readonly years: Readonly<Record<string, ComunaleRule>>;
}

export interface RegionComuni {
  readonly region: RegionCode;
  readonly comuni: readonly Comune[];
}

export interface ComunaleRuleForYear {
  readonly rule: ComunaleRule;
  readonly year: number;
}

export const COMUNI_SOURCE: Source = {
  ref: index.source.ref,
  url: index.source.url,
  retrieved: index.source.retrieved as IsoDate,
  note: "Senza una nuova delibera restano le aliquote dell'anno precedente (art. 1 c. 169 L. 296/2006)",
};

export const COMUNI_YEARS: readonly number[] = index.years;

export function comuniCount(region: RegionCode): number {
  return index.regions[region].count;
}

const REGION_FILES = import.meta.glob<RegionComuni>(
  ["./comuni/*.json", "!./comuni/index.json", "!./comuni/names.json"],
  { import: "default" },
);

export async function loadRegionComuni(region: RegionCode): Promise<RegionComuni> {
  const load = REGION_FILES[`./comuni/${region}.json`];
  if (load === undefined) throw new Error(`No comuni file for region ${region}`);
  return load();
}

export type ComuneName = readonly [id: string, province: string, name: string];

export interface ComuneNames {
  readonly regions: Readonly<Record<RegionCode, readonly ComuneName[]>>;
}

export async function loadComuneNames(): Promise<ComuneNames> {
  const names = await import("./comuni/names.json");
  return names.default as unknown as ComuneNames;
}

export function findComune(regionComuni: RegionComuni, id: string): Comune | undefined {
  return regionComuni.comuni.find((comune) => comune.id === id);
}

export function comunaleRuleFor(comune: Comune, year: number): ComunaleRuleForYear | null {
  let latest: ComunaleRuleForYear | null = null;
  for (const [key, rule] of Object.entries(comune.years)) {
    const ruleYear = Number(key);
    if (ruleYear > year) continue;
    if (latest === null || ruleYear > latest.year) latest = { rule, year: ruleYear };
  }
  return latest;
}
