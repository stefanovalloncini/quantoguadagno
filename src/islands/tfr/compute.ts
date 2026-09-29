import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import { getTaxConfig, projectTfr, type TfrProjection } from "@/domain/index.ts";
import type { Locale } from "@/i18n/locales.ts";
import {
  MAX_INFLATION_RATE,
  MAX_RAL,
  MAX_YEARS,
  MIN_INFLATION_RATE,
  parseRal,
  TFR_DEFAULTS,
  type TfrState,
} from "./state.ts";

export function computeTfr(state: TfrState, locale: Locale): TfrProjection {
  const parsedRal = parseRal(state, locale);
  const ral = Math.min(Math.max(parsedRal ?? 0, 0), MAX_RAL);
  const years = Number.isInteger(state.years)
    ? Math.min(Math.max(state.years, 0), MAX_YEARS)
    : TFR_DEFAULTS.years;
  const inflationRate = Number.isFinite(state.inflationRate)
    ? Math.min(Math.max(state.inflationRate, MIN_INFLATION_RATE), MAX_INFLATION_RATE)
    : TFR_DEFAULTS.inflationRate;

  return projectTfr(ral, years, inflationRate, getTaxConfig(LATEST_SUPPORTED_YEAR).tfr);
}
