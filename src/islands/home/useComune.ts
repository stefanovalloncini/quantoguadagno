import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  findComune,
  loadRegionComuni,
  type Comune,
  type RegionCode,
  type RegionComuni,
} from "@/data/index.ts";

export type RegionComuniEntry =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly regionComuni: RegionComuni }
  | { readonly status: "error" };

export interface ComuniStore {
  readonly request: (region: RegionCode) => void;
  readonly entry: (region: RegionCode) => RegionComuniEntry | undefined;
  readonly subscribe: (listener: () => void) => () => void;
}

const LOADING: RegionComuniEntry = { status: "loading" };
const FAILED: RegionComuniEntry = { status: "error" };

export function createComuniStore(
  load: (region: RegionCode) => Promise<RegionComuni>,
): ComuniStore {
  const entries = new Map<RegionCode, RegionComuniEntry>();
  const listeners = new Set<() => void>();

  function settle(region: RegionCode, entry: RegionComuniEntry): void {
    entries.set(region, entry);
    for (const listener of [...listeners]) listener();
  }

  return {
    request(region) {
      const current = entries.get(region);
      if (current !== undefined && current.status !== "error") return;
      settle(region, LOADING);
      load(region).then(
        (regionComuni) => {
          settle(region, { status: "ready", regionComuni });
        },
        () => {
          settle(region, FAILED);
        },
      );
    },
    entry: (region) => entries.get(region),
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export const comuniStore = createComuniStore(loadRegionComuni);

export type ComuneLookup =
  | { readonly status: "none" }
  | { readonly status: "loading"; readonly id: string }
  | { readonly status: "ready"; readonly id: string; readonly comune: Comune }
  | { readonly status: "missing"; readonly id: string }
  | { readonly status: "error"; readonly id: string };

export type ComuniList =
  | { readonly status: "idle" }
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly comuni: readonly Comune[] }
  | { readonly status: "error" };

const NO_COMUNE: ComuneLookup = { status: "none" };
const IDLE: ComuniList = { status: "idle" };

export function lookupComune(
  entry: RegionComuniEntry | undefined,
  id: string | null,
): ComuneLookup {
  if (id === null) return NO_COMUNE;
  if (entry === undefined || entry.status === "loading") return { status: "loading", id };
  if (entry.status === "error") return { status: "error", id };
  const comune = findComune(entry.regionComuni, id);
  return comune === undefined ? { status: "missing", id } : { status: "ready", id, comune };
}

export function comuniListOf(entry: RegionComuniEntry | undefined): ComuniList {
  if (entry === undefined) return IDLE;
  if (entry.status === "ready") return { status: "ready", comuni: entry.regionComuni.comuni };
  return entry;
}

export function lookedUpComune(lookup: ComuneLookup): Comune | null {
  return lookup.status === "ready" ? lookup.comune : null;
}

export interface Comuni {
  readonly selected: ComuneLookup;
  readonly list: ComuniList;
  readonly load: () => void;
}

function noEntry(): undefined {
  return undefined;
}

export function useComuni(
  region: RegionCode,
  id: string | null,
  store: ComuniStore = comuniStore,
): Comuni {
  const entry = useSyncExternalStore(store.subscribe, () => store.entry(region), noEntry);

  useEffect(() => {
    if (id !== null) store.request(region);
  }, [store, region, id]);

  const load = useCallback(() => {
    store.request(region);
  }, [store, region]);

  const selected = useMemo(() => lookupComune(entry, id), [entry, id]);
  const list = useMemo(() => comuniListOf(entry), [entry]);
  return useMemo(() => ({ selected, list, load }), [selected, list, load]);
}
