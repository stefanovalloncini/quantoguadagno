import { useState } from "react";
import { comunaleRuleFor, type RegionCode } from "@/data/index.ts";
import type { Locale } from "@/i18n/locales.ts";
import { parseDecimal } from "@/i18n/numbers.ts";
import { percentText } from "@/islands/home/fields.ts";
import type { MunicipalMode } from "@/islands/home/ledgerRows.tsx";
import { DEFAULT_MUNICIPAL_RATE } from "@/islands/home/choices.ts";
import type { ComuneLookup } from "@/islands/home/useComune.ts";

export type ToolNamespace = "inverse" | "employerCost";

export interface LocalTaxState {
  readonly comune: string | null;
  readonly municipalRate: string;
  readonly year: number;
}

export interface LocalTaxSetters {
  readonly region: (region: RegionCode) => void;
  readonly comune: (id: string | null) => void;
  readonly municipalRate: (text: string) => void;
}

export interface LocalTax {
  readonly mode: MunicipalMode;
  readonly manual: boolean;
  readonly onSwitchRegion: (region: RegionCode, id: string) => void;
  readonly onManualChange: (manual: boolean) => void;
  readonly onManualRateChange: (text: string) => void;
}

function typedRateDiffersFromDefault(state: LocalTaxState, locale: Locale): boolean {
  const percent = parseDecimal(state.municipalRate.trim().replace(/\s*%$/, ""), locale);
  return (
    state.comune === null &&
    percent !== null &&
    Math.abs(percent / 100 - DEFAULT_MUNICIPAL_RATE) > 1e-9
  );
}

function flatRateOf(lookup: ComuneLookup, year: number): number | null {
  if (lookup.status !== "ready") return null;
  const found = comunaleRuleFor(lookup.comune, year);
  if (found?.rule.rate === undefined) return null;
  return found.rule.rate / 100;
}

export function useLocalTax(
  state: LocalTaxState,
  lookup: ComuneLookup,
  locale: Locale,
  set: LocalTaxSetters,
): LocalTax {
  const [manualChoice, setManualChoice] = useState<boolean | null>(null);
  const [comuneBeforeManual, setComuneBeforeManual] = useState<string | null>(null);
  const manual = manualChoice ?? typedRateDiffersFromDefault(state, locale);
  return {
    mode: state.comune !== null ? "comune" : manual ? "manual" : "none",
    manual,
    onSwitchRegion: (region, id) => {
      set.region(region);
      set.comune(id);
    },
    onManualChange: (next) => {
      setManualChoice(next);
      if (next) {
        setComuneBeforeManual(state.comune);
        const flat = flatRateOf(lookup, state.year);
        if (flat !== null) set.municipalRate(percentText(flat, locale));
      } else if (state.comune === null && comuneBeforeManual !== null) {
        set.comune(comuneBeforeManual);
      }
    },
    onManualRateChange: (text) => {
      set.municipalRate(text);
      if (state.comune !== null) set.comune(null);
    },
  };
}
