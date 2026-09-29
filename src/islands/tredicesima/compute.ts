import { isSupportedYear, LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import { calculateTredicesima, getTaxConfig, type TredicesimaResult } from "@/domain/index.ts";
import type { Locale } from "@/i18n/locales.ts";
import { MAX_RAL, parseRal, type TredicesimaState } from "./state.ts";

export function computeTredicesima(state: TredicesimaState, locale: Locale): TredicesimaResult {
  const parsedRal = parseRal(state, locale);
  const ral = Math.min(Math.max(parsedRal ?? 0, 0), MAX_RAL);
  const taxYear = isSupportedYear(state.taxYear) ? state.taxYear : LATEST_SUPPORTED_YEAR;
  const cfg = getTaxConfig(taxYear);

  return calculateTredicesima({
    ral,
    mensilita: state.mensilita,
    inpsRate: cfg.inps.standardRate,
    brackets: cfg.irpefBrackets,
  });
}
