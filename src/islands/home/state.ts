import {
  CCNL_PRESET_IDS,
  CCNL_PRESETS,
  type CcnlId,
  type PaymentFrequency,
  type RegionCode,
  type SupportedYear,
} from "@/data/index.ts";
import type { PremioRisultatoInput } from "@/domain/bonusCalculations.ts";
import type { DependentsInput, ExpenseDeductionsInput } from "@/domain/deductionCalculations.ts";
import type { ContractType } from "@/domain/employerCostCalculations.ts";
import type {
  CompanyCarInput,
  CompanyCarMode,
  FringeBenefitsInput,
  FringePowertrainType,
  HealthInsuranceInput,
  MealVoucherType,
  MealVouchersInput,
  WelfareInput,
} from "@/domain/fringeBenefitsTypes.ts";
import type { CompanySize, InpsRateOverride } from "@/domain/inpsRates.ts";
import type {
  MadreLavoratriceInput,
  RegimeImpatriatiInput,
  SpecialConditionsInput,
} from "@/domain/specialConditionsCalculations.ts";
import { getTaxConfig } from "@/domain/taxConfig.ts";
import type { Locale } from "@/i18n/locales.ts";
import type { FormControlValue } from "@/islands/runtime/formControls.ts";
import {
  SALARY_MODES,
  COMPANY_CAR_MODES,
  POWERTRAINS,
  MEAL_VOUCHER_TYPES,
  DEFAULT_GROSS_ANNUAL,
  DEFAULT_TARGET_NET_MONTHLY,
  DEFAULT_YEAR,
  DEFAULT_PAYMENT_FREQUENCY,
  DEFAULT_CONTRACT_TYPE,
  DEFAULT_REGION,
  DEFAULT_MUNICIPAL_RATE,
  DEFAULT_CONVENTIONAL_KM,
  DEFAULT_MEAL_VOUCHER_DAYS,
  DEFAULT_MADRE_CHILDREN,
  DEFAULT_MADRE_YOUNGEST_CHILD_AGE,
  usesPowertrainRates,
  MUNICIPAL_RATE_RULE,
  RAL_MESSAGES,
  type SalaryMode,
} from "./choices.ts";
import {
  checkNumber,
  isOneOf,
  moneyText,
  numberText,
  percentText,
  plainNumberText,
  rateFromPercent,
  type FieldError,
  type FieldMessages,
  type NumberRule,
} from "./fields.ts";
import { salaryChoiceChange } from "./salaryChoices.ts";

export {
  type SalaryMode,
  SALARY_MODES,
  PAYMENT_FREQUENCIES,
  CONTRACT_TYPES,
  COMPANY_SIZES,
  COMPANY_CAR_MODES,
  POWERTRAINS,
  MEAL_VOUCHER_TYPES,
  DEFAULT_GROSS_ANNUAL,
  DEFAULT_TARGET_NET_MONTHLY,
  DEFAULT_YEAR,
  DEFAULT_PAYMENT_FREQUENCY,
  DEFAULT_CONTRACT_TYPE,
  DEFAULT_REGION,
  DEFAULT_MUNICIPAL_RATE,
  DEFAULT_CONVENTIONAL_KM,
  DEFAULT_MEAL_VOUCHER_DAYS,
  DEFAULT_MADRE_CHILDREN,
  DEFAULT_MADRE_YOUNGEST_CHILD_AGE,
  usesPowertrainRates,
  MUNICIPAL_RATE_RULE,
  RAL_MESSAGES,
} from "./choices.ts";
export {
  comuneIdOf,
  salaryChoiceChange,
  type SalaryChoiceChange,
  type SalaryChoices,
} from "./salaryChoices.ts";

export interface EmployeeState {
  readonly mode: SalaryMode;
  readonly gross: string;
  readonly targetNet: string;
  readonly year: SupportedYear;
  readonly paymentFrequency: PaymentFrequency;
  readonly ccnl: CcnlId | null;
  readonly contractType: ContractType;
  readonly region: RegionCode;
  readonly comune: string | null;
  readonly municipalRate: string;
  readonly companySize: CompanySize;
  readonly isPublicEmployee: boolean;
  readonly insuredBefore1996: boolean;
  readonly inpsOverride: boolean;
  readonly inpsEmployeeRate: string;
  readonly inpsEmployerRate: string;
  readonly hasSpouse: boolean;
  readonly spouseIncome: string;
  readonly childrenOver21: string;
  readonly otherDependents: string;
  readonly mortgageInterest: string;
  readonly medicalExpenses: string;
  readonly otherDeductions: string;
  readonly pensionFund: string;
  readonly impatriati: boolean;
  readonly impatriatiMinorChildren: boolean;
  readonly madreLavoratrice: boolean;
  readonly madreChildren: string;
  readonly madreYoungestChildAge: string;
  readonly premio: string;
  readonly carMode: CompanyCarMode;
  readonly carValue: string;
  readonly carPowertrain: FringePowertrainType;
  readonly carCo2: string;
  readonly carAciCost: string;
  readonly carKm: string;
  readonly mealVoucherType: MealVoucherType;
  readonly mealVoucherValue: string;
  readonly mealVoucherDays: string;
  readonly healthInsurance: string;
  readonly welfare: string;
  readonly welfareHasChildren: boolean;
}

export type EmployeeField = keyof EmployeeState;

export const TEXT_FIELDS = [
  "gross",
  "targetNet",
  "municipalRate",
  "inpsEmployeeRate",
  "inpsEmployerRate",
  "spouseIncome",
  "childrenOver21",
  "otherDependents",
  "mortgageInterest",
  "medicalExpenses",
  "otherDeductions",
  "pensionFund",
  "madreChildren",
  "madreYoungestChildAge",
  "premio",
  "carValue",
  "carCo2",
  "carAciCost",
  "carKm",
  "mealVoucherValue",
  "mealVoucherDays",
  "healthInsurance",
  "welfare",
] as const satisfies readonly EmployeeField[];

export const BOOLEAN_FIELDS = [
  "isPublicEmployee",
  "insuredBefore1996",
  "inpsOverride",
  "hasSpouse",
  "impatriati",
  "impatriatiMinorChildren",
  "madreLavoratrice",
  "welfareHasChildren",
] as const satisfies readonly EmployeeField[];

export type EmployeeTextField = (typeof TEXT_FIELDS)[number];

export type EmployeeGroup =
  "contract" | "dependents" | "expenses" | "specialConditions" | "premio" | "fringe";

export const GROUP_FIELDS: Readonly<Record<EmployeeGroup, readonly EmployeeField[]>> = {
  contract: [
    "contractType",
    "ccnl",
    "companySize",
    "isPublicEmployee",
    "insuredBefore1996",
    "inpsOverride",
    "inpsEmployeeRate",
    "inpsEmployerRate",
  ],
  dependents: ["hasSpouse", "spouseIncome", "childrenOver21", "otherDependents"],
  expenses: ["mortgageInterest", "medicalExpenses", "otherDeductions", "pensionFund"],
  specialConditions: [
    "impatriati",
    "impatriatiMinorChildren",
    "madreLavoratrice",
    "madreChildren",
    "madreYoungestChildAge",
  ],
  premio: ["premio"],
  fringe: [
    "mealVoucherValue",
    "mealVoucherType",
    "mealVoucherDays",
    "welfare",
    "welfareHasChildren",
    "healthInsurance",
    "carMode",
    "carValue",
    "carPowertrain",
    "carCo2",
    "carAciCost",
    "carKm",
  ],
};

const NET_MONTHLY_MESSAGES: FieldMessages = {
  required: "field.error.netMonthly.required",
  invalid: "field.error.netMonthly.invalid",
  range: "field.error.netMonthly.range",
};

export const EMPLOYEE_RULES = {
  gross: { kind: "money", min: 1, max: 1_000_000, messages: RAL_MESSAGES },
  targetNet: { kind: "money", min: 1, max: 100_000, messages: NET_MONTHLY_MESSAGES },
  municipalRate: MUNICIPAL_RATE_RULE,
  inpsRate: { kind: "percent", min: 0, max: 50 },
  spouseIncome: { kind: "money", min: 0, max: 100_000 },
  dependentsCount: { kind: "integer", min: 0, max: 10 },
  expense: { kind: "money", min: 0, max: 100_000 },
  madreChildren: { kind: "integer", min: 1, max: 10 },
  madreYoungestChildAge: { kind: "integer", min: 0, max: 99 },
  carValue: { kind: "money", min: 0, max: 100_000 },
  carCo2: { kind: "integer", min: 0, max: 500 },
  carAciCost: { kind: "number", min: 0, max: 200 },
  carKm: { kind: "integer", min: 0, max: 50_000 },
  mealVoucherValue: { kind: "money", min: 0, max: 20 },
  mealVoucherDays: { kind: "integer", min: 1, max: 26 },
  healthInsurance: { kind: "money", min: 0, max: 50_000 },
  welfare: { kind: "money", min: 0, max: 20_000 },
} as const satisfies Readonly<Record<string, NumberRule>>;

export function premioRule(year: SupportedYear): NumberRule {
  return { kind: "money", min: 0, max: getTaxConfig(year).pdrSostitutiva.maxAmount };
}

const defaultsByLocale = new Map<Locale, EmployeeState>();

function buildDefaults(locale: Locale): EmployeeState {
  const config = getTaxConfig(DEFAULT_YEAR);
  return {
    mode: "gross",
    gross: moneyText(DEFAULT_GROSS_ANNUAL, locale),
    targetNet: moneyText(DEFAULT_TARGET_NET_MONTHLY, locale),
    year: DEFAULT_YEAR,
    paymentFrequency: DEFAULT_PAYMENT_FREQUENCY,
    ccnl: null,
    contractType: DEFAULT_CONTRACT_TYPE,
    region: DEFAULT_REGION,
    comune: null,
    municipalRate: percentText(DEFAULT_MUNICIPAL_RATE, locale),
    companySize: "small",
    isPublicEmployee: false,
    insuredBefore1996: false,
    inpsOverride: false,
    inpsEmployeeRate: percentText(config.inps.standardRate, locale),
    inpsEmployerRate: percentText(config.employerInps.rate, locale),
    hasSpouse: false,
    spouseIncome: "",
    childrenOver21: "0",
    otherDependents: "0",
    mortgageInterest: "",
    medicalExpenses: "",
    otherDeductions: "",
    pensionFund: "",
    impatriati: false,
    impatriatiMinorChildren: false,
    madreLavoratrice: false,
    madreChildren: plainNumberText(DEFAULT_MADRE_CHILDREN, locale),
    madreYoungestChildAge: plainNumberText(DEFAULT_MADRE_YOUNGEST_CHILD_AGE, locale),
    premio: "",
    carMode: "simple",
    carValue: "",
    carPowertrain: "other",
    carCo2: "0",
    carAciCost: "0",
    carKm: numberText(DEFAULT_CONVENTIONAL_KM, locale),
    mealVoucherType: "electronic",
    mealVoucherValue: "",
    mealVoucherDays: plainNumberText(DEFAULT_MEAL_VOUCHER_DAYS, locale),
    healthInsurance: "",
    welfare: "",
    welfareHasChildren: false,
  };
}

export function employeeDefaults(locale: Locale): EmployeeState {
  let defaults = defaultsByLocale.get(locale);
  if (defaults === undefined) {
    defaults = buildDefaults(locale);
    defaultsByLocale.set(locale, defaults);
  }
  return defaults;
}

export type EmployeeChange = {
  readonly [K in EmployeeField]: { readonly field: K; readonly value: EmployeeState[K] };
}[EmployeeField];

export function applyChange(state: EmployeeState, change: EmployeeChange): EmployeeState {
  if (Object.is(state[change.field], change.value)) return state;
  switch (change.field) {
    case "region":
      return { ...state, region: change.value, comune: null };
    case "ccnl":
      return change.value === null
        ? { ...state, ccnl: null }
        : {
            ...state,
            ccnl: change.value,
            paymentFrequency: CCNL_PRESETS[change.value].paymentFrequency,
          };
    case "paymentFrequency": {
      const keepsCcnl =
        state.ccnl !== null && CCNL_PRESETS[state.ccnl].paymentFrequency === change.value;
      return { ...state, paymentFrequency: change.value, ccnl: keepsCcnl ? state.ccnl : null };
    }
    default:
      return { ...state, [change.field]: change.value };
  }
}

export function setField<K extends EmployeeField>(
  state: EmployeeState,
  field: K,
  value: EmployeeState[K],
): EmployeeState {
  return applyChange(state, { field, value } as EmployeeChange);
}

export interface ModeSeed {
  readonly grossAnnual: number;
  readonly netMonthly: number;
}

export function switchMode(
  state: EmployeeState,
  mode: SalaryMode,
  seed: ModeSeed | null,
  locale: Locale,
): EmployeeState {
  if (state.mode === mode) return state;
  if (seed === null) return { ...state, mode };
  return mode === "net"
    ? { ...state, mode, targetNet: moneyText(Math.round(seed.netMonthly), locale) }
    : { ...state, mode, gross: moneyText(seed.grossAnnual, locale) };
}

export function resetGroup(
  state: EmployeeState,
  group: EmployeeGroup,
  locale: Locale,
): EmployeeState {
  const defaults = employeeDefaults(locale);
  return GROUP_FIELDS[group].reduce<EmployeeState>(
    (next, field) => ({ ...next, [field]: defaults[field] }),
    state,
  );
}

function employeeChoiceChange(name: string, value: string): EmployeeChange | null {
  switch (name) {
    case "mode":
      return isOneOf(value, SALARY_MODES) ? { field: "mode", value } : null;
    case "ccnl":
      if (value === "") return { field: "ccnl", value: null };
      return isOneOf(value, CCNL_PRESET_IDS) ? { field: "ccnl", value } : null;
    case "carMode":
      return isOneOf(value, COMPANY_CAR_MODES) ? { field: "carMode", value } : null;
    case "carPowertrain":
      return isOneOf(value, POWERTRAINS) ? { field: "carPowertrain", value } : null;
    case "mealVoucherType":
      return isOneOf(value, MEAL_VOUCHER_TYPES) ? { field: "mealVoucherType", value } : null;
    default:
      return salaryChoiceChange(name, value);
  }
}

function controlChange(name: string, value: FormControlValue): EmployeeChange | null {
  if (isOneOf(name, TEXT_FIELDS)) {
    return typeof value === "string" ? { field: name, value } : null;
  }
  if (isOneOf(name, BOOLEAN_FIELDS)) {
    return typeof value === "boolean" ? { field: name, value } : null;
  }
  if (typeof value === "boolean") return salaryChoiceChange(name, value);
  return employeeChoiceChange(name, value);
}

export function adoptEmployeeField(
  state: EmployeeState,
  name: string,
  value: FormControlValue,
): EmployeeState {
  const change = controlChange(name, value);
  return change === null ? state : applyChange(state, change);
}

export type EmployeeAmount =
  | { readonly mode: "gross"; readonly grossAnnual: number }
  | { readonly mode: "net"; readonly targetNetMonthly: number };

export interface EmployeeValues {
  readonly amount: EmployeeAmount;
  readonly taxYear: SupportedYear;
  readonly paymentFrequency: PaymentFrequency;
  readonly contractType: ContractType;
  readonly regionCode: RegionCode;
  readonly comune: string | null;
  readonly municipalRate: number;
  readonly companySize: CompanySize;
  readonly isPublicEmployee: boolean;
  readonly insuredBefore1996: boolean;
  readonly inpsOverride: InpsRateOverride | null;
  readonly dependents: DependentsInput | null;
  readonly expenseDeductions: ExpenseDeductionsInput | null;
  readonly specialConditions: SpecialConditionsInput | null;
  readonly premioRisultato: PremioRisultatoInput | null;
  readonly fringeBenefits: FringeBenefitsInput | null;
}

export type EmployeeErrors = Readonly<Partial<Record<EmployeeField, FieldError>>>;

export interface EmployeeCheck {
  readonly values: EmployeeValues | null;
  readonly errors: EmployeeErrors;
}

type Read = (field: EmployeeTextField, rule: NumberRule) => number;

function manualRateOrDefault(state: EmployeeState, locale: Locale): number {
  const checked = checkNumber(state.municipalRate, MUNICIPAL_RATE_RULE, locale);
  return checked.ok ? rateFromPercent(checked.value) : DEFAULT_MUNICIPAL_RATE;
}

function amountOf(state: EmployeeState, read: Read): EmployeeAmount {
  return state.mode === "gross"
    ? { mode: "gross", grossAnnual: read("gross", EMPLOYEE_RULES.gross) }
    : { mode: "net", targetNetMonthly: read("targetNet", EMPLOYEE_RULES.targetNet) };
}

function inpsOverrideOf(state: EmployeeState, read: Read): InpsRateOverride | null {
  if (!state.inpsOverride) return null;
  return {
    employeeRate: rateFromPercent(read("inpsEmployeeRate", EMPLOYEE_RULES.inpsRate)),
    employerRate: rateFromPercent(read("inpsEmployerRate", EMPLOYEE_RULES.inpsRate)),
  };
}

function dependentsOf(state: EmployeeState, read: Read): DependentsInput | null {
  const spouseIncome = state.hasSpouse ? read("spouseIncome", EMPLOYEE_RULES.spouseIncome) : 0;
  const childrenOver21 = read("childrenOver21", EMPLOYEE_RULES.dependentsCount);
  const otherDependents = read("otherDependents", EMPLOYEE_RULES.dependentsCount);
  if (!state.hasSpouse && childrenOver21 === 0 && otherDependents === 0) return null;
  return state.hasSpouse
    ? { hasSpouse: true, spouseIncome, childrenOver21, otherDependents }
    : { hasSpouse: false, childrenOver21, otherDependents };
}

function expensesOf(read: Read): ExpenseDeductionsInput | null {
  const expenses = {
    mortgageInterest: read("mortgageInterest", EMPLOYEE_RULES.expense),
    medicalExpenses: read("medicalExpenses", EMPLOYEE_RULES.expense),
    otherDeductions: read("otherDeductions", EMPLOYEE_RULES.expense),
    pensionFund: read("pensionFund", EMPLOYEE_RULES.expense),
  };
  return Object.values(expenses).some((amount) => amount > 0) ? expenses : null;
}

function specialConditionsOf(state: EmployeeState, read: Read): SpecialConditionsInput | null {
  const regimeImpatriati: RegimeImpatriatiInput | undefined = state.impatriati
    ? { enabled: true, hasMinorChildren: state.impatriatiMinorChildren }
    : undefined;
  const madreLavoratrice: MadreLavoratriceInput | undefined = state.madreLavoratrice
    ? {
        enabled: true,
        numberOfChildren: read("madreChildren", EMPLOYEE_RULES.madreChildren),
        youngestChildAge: read("madreYoungestChildAge", EMPLOYEE_RULES.madreYoungestChildAge),
      }
    : undefined;
  if (regimeImpatriati === undefined && madreLavoratrice === undefined) return null;
  return {
    ...(regimeImpatriati === undefined ? {} : { regimeImpatriati }),
    ...(madreLavoratrice === undefined ? {} : { madreLavoratrice }),
  };
}

function premioOf(state: EmployeeState, read: Read): PremioRisultatoInput | null {
  const amount = read("premio", premioRule(state.year));
  return amount > 0 ? { amount } : null;
}

function companyCarOf(state: EmployeeState, read: Read): CompanyCarInput | undefined {
  if (state.carMode === "simple") {
    const annualBenefitValue = read("carValue", EMPLOYEE_RULES.carValue);
    return annualBenefitValue > 0 ? { mode: "simple", annualBenefitValue } : undefined;
  }
  const aciCostPerKm = read("carAciCost", EMPLOYEE_RULES.carAciCost) / 100;
  const conventionalKm = read("carKm", EMPLOYEE_RULES.carKm);
  const emissions = usesPowertrainRates(state.year)
    ? { powertrainType: state.carPowertrain }
    : { co2Emissions: read("carCo2", EMPLOYEE_RULES.carCo2) };
  if (aciCostPerKm <= 0 || conventionalKm <= 0) return undefined;
  return { mode: "detailed", aciCostPerKm, conventionalKm, ...emissions };
}

function mealVouchersOf(state: EmployeeState, read: Read): MealVouchersInput | undefined {
  const dailyValue = read("mealVoucherValue", EMPLOYEE_RULES.mealVoucherValue);
  if (dailyValue <= 0) return undefined;
  return {
    dailyValue,
    workingDaysPerMonth: read("mealVoucherDays", EMPLOYEE_RULES.mealVoucherDays),
    type: state.mealVoucherType,
  };
}

function healthInsuranceOf(read: Read): HealthInsuranceInput | undefined {
  const annualPremium = read("healthInsurance", EMPLOYEE_RULES.healthInsurance);
  return annualPremium > 0 ? { annualPremium } : undefined;
}

function welfareOf(state: EmployeeState, read: Read): WelfareInput | undefined {
  const annualAmount = read("welfare", EMPLOYEE_RULES.welfare);
  return annualAmount > 0
    ? { annualAmount, hasDependentChildren: state.welfareHasChildren }
    : undefined;
}

function fringeBenefitsOf(state: EmployeeState, read: Read): FringeBenefitsInput | null {
  const companyCar = companyCarOf(state, read);
  const mealVouchers = mealVouchersOf(state, read);
  const healthInsurance = healthInsuranceOf(read);
  const welfare = welfareOf(state, read);
  const benefits: FringeBenefitsInput = {
    ...(companyCar === undefined ? {} : { companyCar }),
    ...(mealVouchers === undefined ? {} : { mealVouchers }),
    ...(healthInsurance === undefined ? {} : { healthInsurance }),
    ...(welfare === undefined ? {} : { welfare }),
  };
  return Object.keys(benefits).length > 0 ? benefits : null;
}

export function checkEmployee(state: EmployeeState, locale: Locale): EmployeeCheck {
  const errors: Partial<Record<EmployeeField, FieldError>> = {};
  const read: Read = (field, rule) => {
    const checked = checkNumber(state[field], rule, locale);
    if (checked.ok) return checked.value;
    errors[field] = checked.error;
    return 0;
  };

  const amount = amountOf(state, read);
  const municipalRate =
    state.comune === null
      ? rateFromPercent(read("municipalRate", MUNICIPAL_RATE_RULE))
      : manualRateOrDefault(state, locale);
  const values: EmployeeValues = {
    amount,
    taxYear: state.year,
    paymentFrequency: state.paymentFrequency,
    contractType: state.contractType,
    regionCode: state.region,
    comune: state.comune,
    municipalRate,
    companySize: state.companySize,
    isPublicEmployee: state.isPublicEmployee,
    insuredBefore1996: state.insuredBefore1996,
    inpsOverride: inpsOverrideOf(state, read),
    dependents: dependentsOf(state, read),
    expenseDeductions: expensesOf(read),
    specialConditions: specialConditionsOf(state, read),
    premioRisultato: premioOf(state, read),
    fringeBenefits: fringeBenefitsOf(state, read),
  };
  return Object.keys(errors).length > 0 ? { values: null, errors } : { values, errors };
}
