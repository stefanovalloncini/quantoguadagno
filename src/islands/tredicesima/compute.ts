import { isSupportedYear, LATEST_SUPPORTED_YEAR, type SupportedYear } from "@/data/index.ts";
import { calculateTredicesima, getTaxConfig, type TredicesimaResult } from "@/domain/index.ts";
import type { Locale } from "@/i18n/locales.ts";
import { MAX_RAL, parseRal, type TredicesimaState } from "./state.ts";

export function computedTaxYear(state: TredicesimaState): SupportedYear {
  return isSupportedYear(state.taxYear) ? state.taxYear : LATEST_SUPPORTED_YEAR;
}

export function computeTredicesima(state: TredicesimaState, locale: Locale): TredicesimaResult {
  const parsedRal = parseRal(state, locale);
  const ral = Math.min(Math.max(parsedRal ?? 0, 0), MAX_RAL);
  const cfg = getTaxConfig(computedTaxYear(state));

  return calculateTredicesima({
    ral,
    mensilita: state.mensilita,
    inpsRate: cfg.inps.standardRate,
    brackets: cfg.irpefBrackets,
    taxWedgeCut: cfg.taxWedgeCut,
  });
}
