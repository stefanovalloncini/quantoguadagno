import type { TranslateFn } from "@/i18n/react.tsx";
import { isMadreLavoratriceEligible } from "@/domain/specialConditionsCalculations.ts";
import { getTaxConfig } from "@/domain/taxConfig.ts";
import { contractAssumption } from "./derive.ts";
import type { EmployeeValues } from "./state.ts";
import type { ViewFormat } from "./viewFormat.tsx";
import type { ViewGroup } from "./viewIds.ts";

export interface SummaryContext {
  readonly t: TranslateFn;
  readonly f: ViewFormat;
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
  return f.capitalize(t("employee.recap.dependents", { list: f.list(parts) }));
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
