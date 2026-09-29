import type { AssumptionItem } from "@/components/result/Assumptions.tsx";
import type { ForfettarioBreakdown } from "@/domain/index.ts";
import type { TranslateFn } from "@/i18n/react.tsx";
import { radioId } from "@/components/form/RadioGroup.tsx";
import { FORFETTARIO_DEFAULTS, type ForfettarioState } from "./state.ts";
import type { ForfettarioDerived } from "./derive.ts";
import type { ViewFormat } from "./viewFormat.tsx";
import { IDS, type ViewGroup } from "./viewIds.ts";

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
      text: t(`forfettario.form.gestion.${state.gestion}`),
      set:
        state.gestion !== FORFETTARIO_DEFAULTS.gestion ||
        derived.discountNoteKey !== null ||
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

export interface Assumption extends AssumptionItem {
  readonly group?: ViewGroup;
}

export function forfettarioAssumptionItems(
  state: ForfettarioState,
  result: ForfettarioBreakdown,
  derived: ForfettarioDerived,
  t: TranslateFn,
): readonly Assumption[] {
  const items: Assumption[] = [
    {
      id: "activity",
      text: t(`forfettario.activity.${state.activity}`),
      changeLabel: t("forfettario.change.activity"),
      targetId: IDS.activity,
    },
    {
      id: "year",
      text: t("forfettario.assumption.year", { year: state.year }),
      changeLabel: t("forfettario.change.year"),
      targetId: radioId(IDS.year, String(state.year)),
    },
    {
      id: "gestion",
      text: t(`forfettario.form.gestion.${result.gestion}`),
      changeLabel: t("forfettario.change.gestion"),
      targetId: IDS.gestion,
      group: "previdenza",
    },
    {
      id: "regime",
      text: t(
        result.phase === "startup"
          ? "forfettario.assumption.regime.startup"
          : "forfettario.assumption.regime.standard",
      ),
      changeLabel: t("forfettario.change.regime"),
      targetId: IDS.yearsOfActivity,
      group: "regime",
    },
  ];
  if (state.isConcurrentFullTimeEmployee) {
    items.push({
      id: "dipendente",
      text: t("forfettario.recap.dipendente.yes", { ral: state.concurrentEmployeeRal }),
      changeLabel: t("forfettario.change.dipendente"),
      targetId: IDS.isConcurrentFullTimeEmployee,
      group: "dipendente",
    });
  }
  if (derived.discountNoteKey !== null) {
    items.push({
      id: "discount",
      text: t(derived.discountNoteKey),
      changeLabel: t("forfettario.change.gestion"),
      targetId: state.forfettarioDiscount35
        ? IDS.forfettarioDiscount35
        : IDS.newRegistrantDiscount50,
      group: "previdenza",
    });
  }
  return items;
}
