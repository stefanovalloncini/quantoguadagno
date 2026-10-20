import { ACTIVITY_COEFFICIENTS } from "@/data/forfettarioActivities.ts";
import { getAutonomiConfig, getTaxConfig } from "@/domain/taxConfig.ts";
import { parseMoneyInput } from "@/i18n/numbers.ts";
import type { TranslateFn } from "@/i18n/react.tsx";
import { DEFAULT_MUNICIPAL_RATE } from "@/islands/home/choices.ts";
import { parseNumberText } from "@/islands/home/fields.ts";
import type { MunicipalMode } from "@/islands/home/ledgerRows.tsx";
import type { ViewFormat } from "@/islands/home/viewFormat.tsx";
import {
  DEFAULT_GESTION,
  defaultActivityFor,
  FULL_YEAR,
  hasMinimum,
  type OrdinarioState,
} from "./state.ts";
import type { ViewGroup } from "./viewIds.ts";

export interface GroupRecap {
  readonly text: string;
  readonly set: boolean;
}

export interface ComuneRecapInput {
  readonly mode: MunicipalMode;
  readonly name: string | null;
}

function comuneRecap(
  state: OrdinarioState,
  comune: ComuneRecapInput,
  t: TranslateFn,
  f: ViewFormat,
): GroupRecap {
  if (comune.name !== null) return { text: comune.name, set: true };
  const typed = parseNumberText(state.municipalRate, "percent", f.locale);
  if (comune.mode === "manual" && typed !== null) {
    return { text: t("ordinario.recap.rateManual", { rate: f.percent(typed / 100) }), set: true };
  }
  return {
    text: t("ordinario.recap.rateDefault", { rate: f.percent(DEFAULT_MUNICIPAL_RATE) }),
    set: false,
  };
}

function previdenzaRecap(state: OrdinarioState, t: TranslateFn, f: ViewFormat): GroupRecap {
  const gestion = t(`ordinario.gestion.${state.gestion}`);
  const months = Number(state.months);
  const partYear = hasMinimum(state.gestion) && Number.isInteger(months) && months < FULL_YEAR;
  const otherPension = state.gestion === "gestione-separata" && state.hasOtherPension;
  const set = state.gestion !== DEFAULT_GESTION || otherPension || partYear;
  if (otherPension) {
    const rate = getAutonomiConfig(state.year).gestionSeparata.reducedRate;
    return { text: t("ordinario.recap.reduced", { gestion, rate: f.percent(rate) }), set };
  }
  if (partYear) return { text: t("ordinario.recap.months", { gestion, months }), set };
  if (state.gestion === "cassa-professionale") {
    const amount = parseMoneyInput(state.cassaAmount, f.locale) ?? 0;
    return { text: t("ordinario.recap.cassa", { gestion, amount: f.money(amount) }), set };
  }
  return { text: gestion, set };
}

function forfettarioRecap(state: OrdinarioState, t: TranslateFn, f: ViewFormat): GroupRecap {
  const cfg = getTaxConfig(state.year).forfettario;
  const coefficient = ACTIVITY_COEFFICIENTS[state.activity].coefficient;
  const rate = state.startup ? cfg.startupRate : cfg.standardRate;
  return {
    text: t("ordinario.recap.forfettario", {
      coefficient: f.percent(coefficient),
      rate: f.percent(rate),
    }),
    set: state.activity !== defaultActivityFor(state.gestion) || state.startup,
  };
}

export function ordinarioRecaps(
  state: OrdinarioState,
  comune: ComuneRecapInput,
  t: TranslateFn,
  f: ViewFormat,
): Readonly<Record<ViewGroup, GroupRecap>> {
  return {
    comune: comuneRecap(state, comune, t, f),
    previdenza: previdenzaRecap(state, t, f),
    forfettario: forfettarioRecap(state, t, f),
  };
}
