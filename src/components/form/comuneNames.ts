import {
  loadComuneNames,
  type ComuneName,
  type ComuneNames,
  type RegionCode,
} from "@/data/index.ts";
import { comuneSearchKey } from "./comuneSearch.ts";

export interface ComuneElsewhere {
  readonly region: RegionCode;
  readonly id: string;
  readonly province: string;
  readonly name: string;
}

type NamesState =
  | { readonly status: "idle" }
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly names: ComuneNames }
  | { readonly status: "error" };

const IDLE: NamesState = { status: "idle" };
let state: NamesState = IDLE;
const listeners = new Set<() => void>();

function settle(next: NamesState): void {
  state = next;
  for (const listener of [...listeners]) listener();
}

export function requestComuneNames(): void {
  if (state.status === "loading" || state.status === "ready") return;
  settle({ status: "loading" });
  loadComuneNames().then(
    (names) => {
      settle({ status: "ready", names });
    },
    () => {
      settle({ status: "error" });
    },
  );
}

export function comuneNamesState(): NamesState {
  return state;
}

export function idleComuneNames(): NamesState {
  return IDLE;
}

export function subscribeComuneNames(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const MAX_CANDIDATES = 3;

function rankOf(entry: ComuneName, key: string): number | null {
  const name = comuneSearchKey(entry[2]);
  if (name === key) return 0;
  if (name.startsWith(key)) return 1;
  return null;
}

export function findElsewhere(
  names: ComuneNames,
  query: string,
  exclude: RegionCode,
): readonly ComuneElsewhere[] {
  const key = comuneSearchKey(query);
  if (key === "") return [];
  const found: { readonly entry: ComuneElsewhere; readonly rank: number }[] = [];
  for (const [region, entries] of Object.entries(names.regions) as [
    RegionCode,
    readonly ComuneName[],
  ][]) {
    if (region === exclude) continue;
    for (const entry of entries) {
      const rank = rankOf(entry, key);
      if (rank === null) continue;
      found.push({ entry: { region, id: entry[0], province: entry[1], name: entry[2] }, rank });
    }
  }
  const exact = found.filter((match) => match.rank === 0);
  return (exact.length > 0 ? exact : found)
    .sort((a, b) => a.rank - b.rank || a.entry.name.localeCompare(b.entry.name, "it"))
    .slice(0, MAX_CANDIDATES)
    .map((match) => match.entry);
}
