import type { SpouseDeductionConfig } from "@/data/index.ts";
import type { DependentsDeductionConfig, ExpenseDeductionsConfig } from "./taxConfig.ts";
import { clamp } from "./_math.ts";

export interface DependentsInput {
  readonly hasSpouse: boolean;
  readonly spouseIncome?: number;
  readonly childrenOver21: number;
  readonly otherDependents: number;
}

export interface ExpenseDeductionsInput {
  readonly mortgageInterest: number;
  readonly medicalExpenses: number;
  readonly otherDeductions: number;
  readonly pensionFund?: number;
}

export interface ExpenseDeductionResult {
  readonly total: number;
  readonly mortgageInterest: number;
}

const NO_EXPENSE_DEDUCTION: ExpenseDeductionResult = { total: 0, mortgageInterest: 0 };

// Previdenza complementare: onere deducibile dal reddito imponibile (non una
// detrazione al 19%), fino al massimale annuo. Art. 10 c.1 lett. e-bis TUIR.
export function calculatePensionFundDeduction(
  expenses: ExpenseDeductionsInput | undefined,
  cfg: ExpenseDeductionsConfig,
): number {
  const amount = expenses?.pensionFund ?? 0;
  if (amount <= 0) return 0;
  return Math.min(amount, cfg.maxPensionFund);
}

function taperedShare(income: number, ceiling: number): number {
  return clamp((ceiling - income) / ceiling, 0, 1);
}

function calculateSpouseDeduction(income: number, cfg: SpouseDeductionConfig): number {
  if (income <= cfg.lowIncomeLimit) {
    return cfg.lowIncomeMax - (cfg.lowIncomeTaper * income) / cfg.lowIncomeLimit;
  }
  if (income <= cfg.standardLimit) {
    const increment = cfg.increments.find((i) => income > i.above && income <= i.upTo);
    return cfg.standard + (increment?.amount ?? 0);
  }
  if (income <= cfg.phaseOutEnd) {
    return (cfg.standard * (cfg.phaseOutEnd - income)) / (cfg.phaseOutEnd - cfg.standardLimit);
  }
  return 0;
}

function calculateChildrenDeduction(
  income: number,
  children: number,
  cfg: DependentsDeductionConfig,
): number {
  if (children <= 0) return 0;
  const ceiling = cfg.childPhaseOutBase + cfg.childPhaseOutPerExtraChild * (children - 1);
  return children * cfg.childOver21Deduction * taperedShare(income, ceiling);
}

export function calculateDependentsDeduction(
  income: number,
  dependents: DependentsInput | undefined,
  cfg: DependentsDeductionConfig,
): number {
  if (!dependents) return 0;

  const spouseIsDependent =
    dependents.hasSpouse &&
    (dependents.spouseIncome === undefined || dependents.spouseIncome <= cfg.dependentIncomeLimit);

  const spouse = spouseIsDependent ? calculateSpouseDeduction(income, cfg.spouse) : 0;
  const children = calculateChildrenDeduction(income, dependents.childrenOver21, cfg);
  const others =
    dependents.otherDependents > 0
      ? dependents.otherDependents *
        cfg.otherFamilyDeduction *
        taperedShare(income, cfg.otherFamilyPhaseOutEnd)
      : 0;

  return spouse + children + others;
}

function capOtherExpenses(
  amount: number,
  income: number,
  dependentChildren: number,
  cfg: ExpenseDeductionsConfig,
): number {
  const cap = cfg.highIncomeCap;
  if (!cap || income <= cap.minIncome) return amount;
  const band = cap.bands.find((b) => b.upTo === null || income <= b.upTo);
  if (!band) return amount;
  const coefficient =
    cap.coefficientsByChildren[Math.min(dependentChildren, cap.coefficientsByChildren.length - 1)];
  return Math.min(amount, band.base * (coefficient ?? 1));
}

export function calculateExpenseDeduction(
  expenses: ExpenseDeductionsInput | undefined,
  income: number,
  dependentChildren: number,
  cfg: ExpenseDeductionsConfig,
): ExpenseDeductionResult {
  if (!expenses) return NO_EXPENSE_DEDUCTION;

  const mortgageInterest =
    Math.max(0, Math.min(expenses.mortgageInterest, cfg.maxMortgageInterest)) *
    cfg.standardDeductionRate;
  const medical =
    Math.max(0, expenses.medicalExpenses - cfg.medicalExpenseFloor) * cfg.medicalDeductionRate;

  const otherAmount = capOtherExpenses(
    Math.max(0, expenses.otherDeductions),
    income,
    dependentChildren,
    cfg,
  );
  const phaseOut =
    income <= cfg.phaseOutStart
      ? 1
      : clamp((cfg.phaseOutEnd - income) / (cfg.phaseOutEnd - cfg.phaseOutStart), 0, 1);
  const other = otherAmount * cfg.standardDeductionRate * phaseOut;

  const reduction = cfg.highIncomeReduction;
  const nonMedical =
    reduction && income > reduction.minIncome
      ? Math.max(0, mortgageInterest + other - reduction.amount)
      : mortgageInterest + other;

  return { total: nonMedical + medical, mortgageInterest };
}
