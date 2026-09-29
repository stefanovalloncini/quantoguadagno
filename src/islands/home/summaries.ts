import type { RegionText } from "@/components/form/regionText.ts";
import { regionSelectKey } from "@/components/form/regionText.ts";
import type { AssumptionItem } from "@/components/result/Assumptions.tsx";
import type { ComunaleRule } from "@/data/index.ts";
import type { TranslateFn } from "@/i18n/react.tsx";
import type { EmployeeResult } from "./compute.ts";
import { isMadreLavoratriceEligible } from "@/domain/specialConditionsCalculations.ts";
import { getTaxConfig } from "@/domain/taxConfig.ts";
import { contractAssumption } from "./derive.ts";
import type { MunicipalMode } from "./ledgerRows.tsx";
import type { EmployeeValues } from "./state.ts";
import type { ViewFormat } from "./viewFormat.tsx";
import { IDS, type ViewGroup } from "./viewIds.ts";

export interface SummaryContext {
  readonly t: TranslateFn;
  readonly f: ViewFormat;
  readonly regions: RegionText;
  readonly municipalMode: MunicipalMode;
}

export interface Assumption extends AssumptionItem {
  readonly group?: ViewGroup;
}

function ratesOfRule(rule: ComunaleRule): readonly number[] {
  return rule.brackets === undefined ? [rule.rate] : rule.brackets.map((bracket) => bracket.rate);
}

export function contractText(
  values: EmployeeValues,
  { t, f }: SummaryContext,
  withRate: boolean,
): string {
  const contract = contractAssumption(values);
  const parts = [
    t("employee.part.contractType", { type: values.contractType }),
    t("employee.part.sector", { public: values.isPublicEmployee ? "yes" : "no" }),
    ...(values.companySize === "large" ? [t("employee.part.largeCompany")] : []),
    ...(values.insuredBefore1996 ? [t("employee.part.before1996")] : []),
    ...(values.inpsOverride !== null
      ? [t("employee.part.inpsCustom", { rate: f.percent(contract.employeeInpsRate) })]
      : withRate
        ? [t("employee.part.inpsRate", { rate: f.percent(contract.employeeInpsRate) })]
        : []),
  ];
  return parts.join(", ");
}

export function dependentsText(values: EmployeeValues, { t, f }: SummaryContext): string | null {
  const dependents = values.dependents;
  if (dependents === null) return null;
  const parts = [
    ...(dependents.hasSpouse ? [t("employee.part.spouse")] : []),
    ...(dependents.childrenOver21 > 0
      ? [t("employee.part.children", { count: dependents.childrenOver21 })]
      : []),
    ...(dependents.otherDependents > 0
      ? [t("employee.part.others", { count: dependents.otherDependents })]
      : []),
  ];
  return f.capitalize(t("employee.assumption.dependents", { list: f.list(parts) }));
}

export function expensesText(values: EmployeeValues, { t, f }: SummaryContext): string | null {
  const expenses = values.expenseDeductions;
  if (expenses === null) return null;
  const pensionFund = expenses.pensionFund ?? 0;
  const parts = [
    ...(expenses.medicalExpenses > 0
      ? [t("employee.part.medical", { amount: f.money(expenses.medicalExpenses) })]
      : []),
    ...(expenses.mortgageInterest > 0
      ? [t("employee.part.mortgage", { amount: f.money(expenses.mortgageInterest) })]
      : []),
    ...(expenses.otherDeductions > 0
      ? [t("employee.part.otherExpenses", { amount: f.money(expenses.otherDeductions) })]
      : []),
    ...(pensionFund > 0 ? [t("employee.part.pensionFund", { amount: f.money(pensionFund) })] : []),
  ];
  return f.capitalize(f.list(parts));
}

export function specialText(values: EmployeeValues, { t, f }: SummaryContext): string | null {
  const special = values.specialConditions;
  if (special === null) return null;
  const parts = [
    ...(special.regimeImpatriati === undefined
      ? []
      : [
          t(
            special.regimeImpatriati.hasMinorChildren
              ? "employee.part.impatriatiChildren"
              : "employee.part.impatriati",
          ),
        ]),
    ...(special.madreLavoratrice !== undefined &&
    isMadreLavoratriceEligible(
      special.madreLavoratrice,
      getTaxConfig(values.taxYear).madreLavoratrice,
    )
      ? [t("employee.part.madre")]
      : []),
  ];
  return parts.length === 0 ? null : f.capitalize(f.list(parts));
}

export function benefitsText(values: EmployeeValues, { t, f }: SummaryContext): string | null {
  const fringe = values.fringeBenefits;
  const premio = values.premioRisultato;
  if (fringe === null && premio === null) return null;
  const car = fringe?.companyCar;
  const parts = [
    ...(fringe?.mealVouchers === undefined
      ? []
      : [t("employee.part.vouchers", { amount: f.money(fringe.mealVouchers.dailyValue) })]),
    ...(fringe?.welfare === undefined
      ? []
      : [t("employee.part.welfare", { amount: f.money(fringe.welfare.annualAmount) })]),
    ...(fringe?.healthInsurance === undefined
      ? []
      : [t("employee.part.health", { amount: f.money(fringe.healthInsurance.annualPremium) })]),
    ...(car === undefined
      ? []
      : [
          t("employee.part.car", {
            amount: f.money(car.mode === "simple" ? (car.annualBenefitValue ?? 0) : 0),
          }),
        ]),
    ...(premio === null ? [] : [t("employee.part.premio", { amount: f.money(premio.amount) })]),
  ];
  return f.capitalize(f.list(parts));
}

function localItem(result: EmployeeResult, context: SummaryContext): Assumption {
  const { t, f, municipalMode } = context;
  const { municipal } = result;
  const base = { id: "comune", changeLabel: t("employee.change.comune") };
  if (municipal.kind === "manual") {
    const manual = municipalMode === "manual";
    return {
      ...base,
      targetId: manual ? IDS.municipalRate : IDS.comune,
      text: t(manual ? "employee.assumption.rateManual" : "employee.assumption.rateDefault", {
        rate: f.percent(municipal.rate),
      }),
    };
  }
  const rates = ratesOfRule(municipal.rule).map((rate) => rate / 100);
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  const name = municipal.comune.name;
  const rate =
    min === max
      ? f.percent(max)
      : t("comune.option.range", { min: f.percent(min).replace("%", ""), max: f.percent(max) });
  return {
    ...base,
    targetId: IDS.comune,
    text:
      max === 0
        ? t("employee.assumption.comuneZero", { name })
        : t("employee.assumption.comune", { name, rate }),
  };
}

export function assumptionItems(
  result: EmployeeResult,
  context: SummaryContext,
): readonly Assumption[] {
  const { t, regions } = context;
  const { values } = result;
  const special = specialText(values, context);
  const benefits = benefitsText(values, context);
  return [
    {
      id: "year",
      text: t("employee.assumption.year", { year: values.taxYear }),
      changeLabel: t("employee.change.year"),
      targetId: `${IDS.year}-${String(values.taxYear)}`,
    },
    {
      id: "region",
      text: t("employee.assumption.region", {
        region: regionSelectKey(values.regionCode),
        name: regions.name(values.regionCode),
      }),
      changeLabel: t("employee.change.region"),
      targetId: IDS.region,
    },
    localItem(result, context),
    {
      id: "frequency",
      text: t("employee.assumption.frequency", { count: values.paymentFrequency }),
      changeLabel: t("employee.change.frequency"),
      targetId: `${IDS.frequency}-${String(values.paymentFrequency)}`,
    },
    {
      id: "contract",
      text: contractText(values, context, false),
      changeLabel: t("employee.change.contract"),
      targetId: `${IDS.contract}-${values.contractType}`,
      group: "contract",
    },
    {
      id: "dependents",
      text: dependentsText(values, context) ?? t("employee.assumption.noDependents"),
      changeLabel: t("employee.change.dependents"),
      targetId: IDS.hasSpouse,
      group: "dependents",
    },
    {
      id: "expenses",
      text: expensesText(values, context) ?? t("employee.assumption.noExpenses"),
      changeLabel: t("employee.change.expenses"),
      targetId: IDS.mortgageInterest,
      group: "expenses",
    },
    ...(special === null
      ? []
      : [
          {
            id: "special",
            text: special,
            changeLabel: t("employee.change.special"),
            targetId: IDS.impatriati,
            group: "special" as const,
          },
        ]),
    {
      id: "benefits",
      text: benefits ?? t("employee.assumption.noBenefits"),
      changeLabel: t("employee.change.benefits"),
      targetId:
        values.fringeBenefits === null && values.premioRisultato !== null
          ? IDS.premio
          : IDS.mealVoucherValue,
      group: "benefits",
    },
  ];
}

export interface GroupRecap {
  readonly text: string;
  readonly set: boolean;
}

export function groupRecaps(
  values: EmployeeValues,
  active: Readonly<
    Record<
      "contract" | "dependents" | "expenses" | "specialConditions" | "premio" | "fringe",
      boolean
    >
  >,
  context: SummaryContext,
): Readonly<Record<ViewGroup, GroupRecap>> {
  const { t } = context;
  const masculine = t("employee.recap.none.masculine");
  const special = specialText(values, context);
  const feminine = t("employee.recap.none.feminine");
  return {
    contract: { text: contractText(values, context, true), set: active.contract },
    dependents: { text: dependentsText(values, context) ?? masculine, set: active.dependents },
    expenses: { text: expensesText(values, context) ?? feminine, set: active.expenses },
    special: special === null ? { text: feminine, set: false } : { text: special, set: true },
    benefits: {
      text: benefitsText(values, context) ?? masculine,
      set: active.premio || active.fringe,
    },
  };
}
