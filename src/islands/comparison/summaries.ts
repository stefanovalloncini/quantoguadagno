import { regionSelectKey, type RegionText } from "@/components/form/regionText.ts";
import type { AssumptionItem } from "@/components/result/Assumptions.tsx";
import type { TranslateFn } from "@/i18n/react.tsx";
import type { MunicipalSource } from "@/islands/home/compute.ts";
import type { MunicipalMode } from "@/islands/home/ledgerRows.tsx";
import type { EmployeeValues } from "@/islands/home/state.ts";
import type { ViewFormat } from "@/islands/home/viewFormat.tsx";
import {
  comuneRates,
  rangeText,
  regionalRangeText,
  standardInpsRate,
} from "@/islands/printPayslip/rateText.ts";
import type { ComparedOffers, OfferResult } from "./compute.ts";
import type { ComparisonRow } from "./derive.ts";
import { DEFAULT_CONTRACT_TYPE, DEFAULT_REGION, DEFAULT_YEAR } from "./state.ts";
import { IDS, type ConditionGroup } from "./viewIds.ts";

export interface SummaryContext {
  readonly t: TranslateFn;
  readonly f: ViewFormat;
  readonly regions: RegionText;
  readonly municipalMode: MunicipalMode;
}

export interface ComparisonAssumption extends AssumptionItem {
  readonly group: ConditionGroup;
}

export interface GroupRecap {
  readonly text: string;
  readonly set: boolean;
}

interface LocalTexts {
  readonly recap: string;
  readonly assumption: string;
  readonly place: string;
}

export function localTexts(municipal: MunicipalSource, context: SummaryContext): LocalTexts {
  const { t, f, municipalMode } = context;
  if (municipal.kind === "manual") {
    const rate = f.percent(municipal.rate);
    return {
      recap: t("comparison.recap.rate", { rate }),
      assumption: t(
        municipalMode === "manual"
          ? "comparison.assumption.rateManual"
          : "comparison.assumption.rateDefault",
        { rate },
      ),
      place: rate,
    };
  }
  const rates = comuneRates(municipal.rule);
  const rate = rangeText(rates, f);
  const name = municipal.comune.name;
  return {
    recap: t("comparison.recap.comune", { name, rate }),
    assumption:
      Math.max(...rates) === 0
        ? t("comparison.assumption.comuneZero", { name })
        : t("comparison.assumption.comune", { name, rate }),
    place: t("comparison.row.municipalPlace", { name, rate }),
  };
}

export function contractText(values: EmployeeValues, t: TranslateFn): string {
  return [
    t("comparison.part.contractType", { type: values.contractType }),
    t("comparison.part.sector", { public: values.isPublicEmployee ? "yes" : "no" }),
    ...(values.insuredBefore1996 ? [t("comparison.part.before1996")] : []),
  ].join(", ");
}

function dependentParts(values: EmployeeValues, t: TranslateFn): readonly string[] | null {
  const dependents = values.dependents;
  if (dependents === null) return null;
  return [
    ...(dependents.hasSpouse ? [t("comparison.part.spouse")] : []),
    ...(dependents.childrenOver21 > 0
      ? [t("comparison.part.children", { count: dependents.childrenOver21 })]
      : []),
    ...(dependents.otherDependents > 0
      ? [t("comparison.part.others", { count: dependents.otherDependents })]
      : []),
  ];
}

export function dependentsText(values: EmployeeValues, { t, f }: SummaryContext): string | null {
  const parts = dependentParts(values, t);
  if (parts === null) return null;
  return f.capitalize(t("comparison.assumption.dependents", { list: f.list(parts) }));
}

export function groupRecaps(
  result: OfferResult,
  context: SummaryContext,
): Readonly<Record<ConditionGroup, GroupRecap>> {
  const { t, f, regions } = context;
  const { values } = result;
  const local = localTexts(result.municipal, context);
  const dependents = dependentParts(values, t);
  return {
    residence: {
      text: t("comparison.recap.residence", {
        year: values.taxYear,
        region: regions.name(values.regionCode),
        local: local.recap,
      }),
      set:
        values.taxYear !== DEFAULT_YEAR ||
        values.regionCode !== DEFAULT_REGION ||
        context.municipalMode !== "none",
    },
    contract: {
      text: t("comparison.recap.contract", {
        contract: f.capitalize(contractText(values, t)),
        rate: f.percent(standardInpsRate(values)),
      }),
      set:
        values.contractType !== DEFAULT_CONTRACT_TYPE ||
        values.isPublicEmployee ||
        values.insuredBefore1996,
    },
    dependents:
      dependents === null
        ? { text: t("comparison.recap.none"), set: false }
        : { text: f.capitalize(f.list(dependents)), set: true },
  };
}

export function assumptionItems(
  result: OfferResult,
  context: SummaryContext,
): readonly ComparisonAssumption[] {
  const { t, regions, municipalMode } = context;
  const { values } = result;
  return [
    {
      id: "year",
      text: t("comparison.assumption.year", { year: values.taxYear }),
      changeLabel: t("comparison.change.year"),
      targetId: `${IDS.year}-${String(values.taxYear)}`,
      group: "residence",
    },
    {
      id: "region",
      text: t("comparison.assumption.region", {
        region: regionSelectKey(values.regionCode),
        name: regions.name(values.regionCode),
      }),
      changeLabel: t("comparison.change.region"),
      targetId: IDS.region,
      group: "residence",
    },
    {
      id: "comune",
      text: localTexts(result.municipal, context).assumption,
      changeLabel: t("comparison.change.comune"),
      targetId: municipalMode === "manual" ? IDS.municipalRate : IDS.comune,
      group: "residence",
    },
    {
      id: "contract",
      text: t("comparison.assumption.contract", { contract: contractText(values, t) }),
      changeLabel: t("comparison.change.contract"),
      targetId: `${IDS.contract}-${values.contractType}`,
      group: "contract",
    },
    {
      id: "dependents",
      text: dependentsText(values, context) ?? t("comparison.assumption.noDependents"),
      changeLabel: t("comparison.change.dependents"),
      targetId: IDS.hasSpouse,
      group: "dependents",
    },
  ];
}

export function rowLabel(row: ComparisonRow, offers: ComparedOffers, context: SummaryContext) {
  const { t, f, regions } = context;
  const { values } = offers.a;
  switch (row.key) {
    case "gross":
      return t("comparison.row.gross");
    case "inps":
      return t("comparison.row.inps", {
        rate: f.percent(standardInpsRate(values)),
        relief:
          offers.a.breakdown.inpsExemption > 0 || offers.b.breakdown.inpsExemption > 0
            ? "yes"
            : "no",
      });
    case "irpef":
      return t("comparison.row.irpef");
    case "regional":
      return t("comparison.row.regional", {
        region: regions.name(values.regionCode),
        rate: regionalRangeText(values, f),
      });
    case "municipal":
      return t("comparison.row.municipal", {
        place: localTexts(offers.a.municipal, context).place,
      });
    case "credits":
      return t("comparison.row.credits");
    case "netAnnual":
      return t("comparison.row.netAnnual");
    case "netMonthly": {
      const countA = offers.a.values.paymentFrequency;
      const countB = offers.b.values.paymentFrequency;
      return countA === countB
        ? t("comparison.row.netMonthlySame", { count: countA })
        : t("comparison.row.netMonthly", { countA, countB });
    }
    case "average":
      return t("comparison.row.average");
  }
}
