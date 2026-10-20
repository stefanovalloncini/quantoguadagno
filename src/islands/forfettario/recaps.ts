import type { TranslateFn } from "@/i18n/react.tsx";
import { FORFETTARIO_DEFAULTS, type ForfettarioState } from "./state.ts";
import type { ForfettarioDerived } from "./derive.ts";
import type { ViewFormat } from "./viewFormat.tsx";
import type { ViewGroup } from "./viewIds.ts";

export interface GroupRecap {
  readonly text: string;
  readonly set: boolean;
}

export function forfettarioGroupRecaps(
  state: ForfettarioState,
  derived: ForfettarioDerived,
  t: TranslateFn,
  f: ViewFormat,
): Readonly<Record<ViewGroup, GroupRecap>> {
  return {
    previdenza: {
      text:
        derived.discountRecapKey === null
          ? t(`forfettario.form.gestion.${state.gestion}`)
          : t(derived.discountRecapKey, {
              gestion: t(`forfettario.form.gestion.${state.gestion}`),
            }),
      set:
        state.gestion !== FORFETTARIO_DEFAULTS.gestion ||
        derived.discountRecapKey !== null ||
        (derived.isArtigianiOrCommercianti && state.isAnte1996),
    },
    regime: {
      text: t(
        state.yearsOfActivity < 5
          ? "forfettario.recap.regime.startup"
          : "forfettario.recap.regime.standard",
      ),
      set:
        state.yearsOfActivity !== FORFETTARIO_DEFAULTS.yearsOfActivity ||
        state.employeeCosts !== FORFETTARIO_DEFAULTS.employeeCosts,
    },
    dipendente: {
      text: state.isConcurrentFullTimeEmployee
        ? t("forfettario.recap.dipendente.yes", {
            ral: f.money(Number(state.concurrentEmployeeRal) || 0),
          })
        : t("forfettario.recap.dipendente.no"),
      set: state.isConcurrentFullTimeEmployee,
    },
  };
}
