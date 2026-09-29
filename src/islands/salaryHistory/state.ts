import type { DependentsInput } from "@/domain/index.ts";
import { FOI_LATEST_YEAR } from "@/data/index.ts";
import type { Locale } from "@/i18n/locales.ts";
import type { MessageKey } from "@/i18n/messages/salaryHistory/it.ts";
import { parseNumberText, type FieldError } from "@/islands/home/fields.ts";
import { parseMoneyInput } from "@/i18n/numbers.ts";
import { defaultGrowthRate } from "./derive.ts";
import {
  DEFAULT_ENTRY_SETTINGS,
  isCompanySize,
  isContractType,
  isPaymentFrequency,
  isRegionCode,
  type SalaryEntrySettings,
} from "./storage.ts";

export interface SalaryHistoryDraft {
  readonly year: number;
  readonly grossAnnual: number;
  readonly settings: SalaryEntrySettings;
  readonly note: string;
}

export interface SalaryHistoryState {
  readonly draft: SalaryHistoryDraft;
  readonly horizon: number;
  readonly growthPct: number;
}

const DEFAULT_HORIZON = 5;

function emptyDependents(): DependentsInput {
  return { hasSpouse: false, childrenOver21: 0, otherDependents: 0 };
}

function defaultDraft(settings: SalaryEntrySettings = DEFAULT_ENTRY_SETTINGS): SalaryHistoryDraft {
  return { year: FOI_LATEST_YEAR, grossAnnual: 30_000, settings, note: "" };
}

export const DEFAULT_STATE: SalaryHistoryState = {
  draft: defaultDraft(),
  horizon: DEFAULT_HORIZON,
  growthPct: Number((defaultGrowthRate() * 100).toFixed(2)),
};

export const MAX_GROSS = 1_000_000;
export const MAX_SPOUSE_INCOME = 1_000_000;
export const MAX_MUNICIPAL_TAX_RATE = 0.02;
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;
export const MIN_HORIZON = 1;
export const MAX_HORIZON = 10;
export const MIN_GROWTH_PCT = -50;
export const MAX_GROWTH_PCT = 50;
export const MAX_DEPENDENT_COUNT = 20;

export function patchDraft(
  state: SalaryHistoryState,
  changes: Partial<Pick<SalaryHistoryDraft, "year" | "grossAnnual" | "note">>,
): SalaryHistoryState {
  return { ...state, draft: { ...state.draft, ...changes } };
}

export function patchSettings(
  state: SalaryHistoryState,
  changes: Partial<SalaryEntrySettings>,
): SalaryHistoryState {
  return {
    ...state,
    draft: { ...state.draft, settings: { ...state.draft.settings, ...changes } },
  };
}

function isEmptyDependents(dependents: DependentsInput): boolean {
  return (
    !dependents.hasSpouse &&
    dependents.childrenOver21 === 0 &&
    dependents.otherDependents === 0 &&
    (dependents.spouseIncome === undefined || dependents.spouseIncome === 0)
  );
}

function withoutDependents(settings: SalaryEntrySettings): SalaryEntrySettings {
  return {
    contractType: settings.contractType,
    regionCode: settings.regionCode,
    municipalTaxRate: settings.municipalTaxRate,
    paymentFrequency: settings.paymentFrequency,
    ...(settings.companySize !== undefined ? { companySize: settings.companySize } : {}),
  };
}

export function withoutCompanySize(settings: SalaryEntrySettings): SalaryEntrySettings {
  return {
    contractType: settings.contractType,
    regionCode: settings.regionCode,
    municipalTaxRate: settings.municipalTaxRate,
    paymentFrequency: settings.paymentFrequency,
    ...(settings.dependents !== undefined ? { dependents: settings.dependents } : {}),
  };
}

export function patchDependents(
  state: SalaryHistoryState,
  changes: Partial<DependentsInput>,
): SalaryHistoryState {
  const current = state.draft.settings.dependents ?? emptyDependents();
  const next = { ...current, ...changes };
  const rest = withoutDependents(state.draft.settings);
  return {
    ...state,
    draft: {
      ...state.draft,
      settings: isEmptyDependents(next) ? rest : { ...rest, dependents: next },
    },
  };
}

export function updateHorizon(state: SalaryHistoryState, value: number): SalaryHistoryState {
  return { ...state, horizon: value };
}

export function updateGrowthPct(state: SalaryHistoryState, value: number): SalaryHistoryState {
  return { ...state, growthPct: value };
}

export function resetDraftAfterSubmit(state: SalaryHistoryState): SalaryHistoryState {
  return { ...state, draft: { ...defaultDraft(state.draft.settings), year: state.draft.year } };
}

export function resetAll(): SalaryHistoryState {
  return DEFAULT_STATE;
}

export type SalaryHistoryDraftField =
  | "year"
  | "grossAnnual"
  | "municipalTaxRate"
  | "spouseIncome"
  | "childrenOver21"
  | "otherDependents";

export type SalaryHistoryProjectionField = "horizon" | "growthPct";

export type SalaryHistoryField = SalaryHistoryDraftField | SalaryHistoryProjectionField;

export type SalaryHistoryErrorValue = MessageKey | FieldError;

export type SalaryHistoryErrors = Partial<Record<SalaryHistoryField, SalaryHistoryErrorValue>>;

export function validateDraft(
  draft: SalaryHistoryDraft,
): Partial<Record<SalaryHistoryDraftField, SalaryHistoryErrorValue>> {
  const errors: Partial<Record<SalaryHistoryDraftField, SalaryHistoryErrorValue>> = {};

  if (!Number.isInteger(draft.year) || draft.year < MIN_YEAR || draft.year > MAX_YEAR) {
    errors.year = { key: "field.error.integerRange", values: { min: MIN_YEAR, max: MAX_YEAR } };
  }

  if (
    !Number.isFinite(draft.grossAnnual) ||
    draft.grossAnnual <= 0 ||
    draft.grossAnnual > MAX_GROSS
  ) {
    errors.grossAnnual = {
      key: "field.error.ral.range",
      values: { min: 0, max: MAX_GROSS },
    };
  }

  const rate = draft.settings.municipalTaxRate;
  if (!Number.isFinite(rate) || rate < 0 || rate > MAX_MUNICIPAL_TAX_RATE) {
    errors.municipalTaxRate = {
      key: "field.error.percentRange",
      values: { min: 0, max: MAX_MUNICIPAL_TAX_RATE * 100 },
    };
  }

  const dependents = draft.settings.dependents;
  if (dependents) {
    if (
      dependents.spouseIncome !== undefined &&
      (!Number.isFinite(dependents.spouseIncome) ||
        dependents.spouseIncome < 0 ||
        dependents.spouseIncome > MAX_SPOUSE_INCOME)
    ) {
      errors.spouseIncome = {
        key: "field.error.moneyRange",
        values: { min: 0, max: MAX_SPOUSE_INCOME },
      };
    }
    if (
      !Number.isInteger(dependents.childrenOver21) ||
      dependents.childrenOver21 < 0 ||
      dependents.childrenOver21 > MAX_DEPENDENT_COUNT
    ) {
      errors.childrenOver21 = {
        key: "field.error.integerRange",
        values: { min: 0, max: MAX_DEPENDENT_COUNT },
      };
    }
    if (
      !Number.isInteger(dependents.otherDependents) ||
      dependents.otherDependents < 0 ||
      dependents.otherDependents > MAX_DEPENDENT_COUNT
    ) {
      errors.otherDependents = {
        key: "field.error.integerRange",
        values: { min: 0, max: MAX_DEPENDENT_COUNT },
      };
    }
  }

  return errors;
}

export function validateProjection(
  state: Pick<SalaryHistoryState, "horizon" | "growthPct">,
): Partial<Record<SalaryHistoryProjectionField, SalaryHistoryErrorValue>> {
  const errors: Partial<Record<SalaryHistoryProjectionField, SalaryHistoryErrorValue>> = {};

  if (
    !Number.isInteger(state.horizon) ||
    state.horizon < MIN_HORIZON ||
    state.horizon > MAX_HORIZON
  ) {
    errors.horizon = {
      key: "field.error.integerRange",
      values: { min: MIN_HORIZON, max: MAX_HORIZON },
    };
  }

  if (
    !Number.isFinite(state.growthPct) ||
    state.growthPct < MIN_GROWTH_PCT ||
    state.growthPct > MAX_GROWTH_PCT
  ) {
    errors.growthPct = {
      key: "field.error.percentRange",
      values: { min: MIN_GROWTH_PCT, max: MAX_GROWTH_PCT },
    };
  }

  return errors;
}

export function validate(state: SalaryHistoryState): SalaryHistoryErrors {
  return { ...validateDraft(state.draft), ...validateProjection(state) };
}

export function adoptField(
  state: SalaryHistoryState,
  field: string,
  raw: string,
  locale: Locale,
): SalaryHistoryState {
  switch (field) {
    case "year": {
      const value = parseNumberText(raw, "integer", locale);
      return value === null ? state : patchDraft(state, { year: value });
    }
    case "grossAnnual": {
      const value = parseMoneyInput(raw, locale);
      return value === null ? state : patchDraft(state, { grossAnnual: value });
    }
    case "note":
      return patchDraft(state, { note: raw });
    case "municipalTaxRate": {
      const value = parseNumberText(raw, "percent", locale);
      const rate = value === null ? null : value / 100;
      return rate === null || rate < 0 || rate > MAX_MUNICIPAL_TAX_RATE
        ? state
        : patchSettings(state, { municipalTaxRate: rate });
    }
    case "contractType":
      return isContractType(raw) ? patchSettings(state, { contractType: raw }) : state;
    case "regionCode":
      return isRegionCode(raw) ? patchSettings(state, { regionCode: raw }) : state;
    case "paymentFrequency": {
      const value = Number(raw);
      return isPaymentFrequency(value) ? patchSettings(state, { paymentFrequency: value }) : state;
    }
    case "companySize": {
      if (raw === "") {
        return {
          ...state,
          draft: { ...state.draft, settings: withoutCompanySize(state.draft.settings) },
        };
      }
      return isCompanySize(raw) ? patchSettings(state, { companySize: raw }) : state;
    }
    case "hasSpouse":
      return patchDependents(state, { hasSpouse: raw === "true" });
    case "spouseIncome": {
      const value = parseMoneyInput(raw, locale);
      return value === null ? state : patchDependents(state, { spouseIncome: value });
    }
    case "childrenOver21": {
      const value = parseNumberText(raw, "integer", locale);
      return value === null || value < 0 || value > MAX_DEPENDENT_COUNT
        ? state
        : patchDependents(state, { childrenOver21: value });
    }
    case "otherDependents": {
      const value = parseNumberText(raw, "integer", locale);
      return value === null || value < 0 || value > MAX_DEPENDENT_COUNT
        ? state
        : patchDependents(state, { otherDependents: value });
    }
    case "horizon": {
      const value = parseNumberText(raw, "integer", locale);
      return value === null ? state : updateHorizon(state, value);
    }
    case "growthPct": {
      const value = parseNumberText(raw, "percent", locale);
      return value === null || value < MIN_GROWTH_PCT || value > MAX_GROWTH_PCT
        ? state
        : updateGrowthPct(state, value);
    }
    default:
      return state;
  }
}
