import { DEFAULT_LOCALE, type Locale } from "@/i18n/locales.ts";
import { formatAmountInput, parseMoneyInput } from "@/i18n/numbers.ts";
import type { QueryValues } from "@/islands/runtime/query.ts";
import {
  DEFAULT_TARGET_GROSS_ANNUAL,
  MAX_TARGET_GROSS_ANNUAL,
  type ApprenticeshipState,
} from "./state.ts";

export function fromQuery(
  values: QueryValues,
  initial: ApprenticeshipState,
  locale: Locale = DEFAULT_LOCALE,
): ApprenticeshipState {
  const raw = values.l;
  if (raw === undefined) return initial;
  const lordo = Number(raw);
  if (!Number.isFinite(lordo) || lordo <= 0) return initial;
  return {
    ...initial,
    targetGrossAnnual: formatAmountInput(
      Math.min(Math.floor(lordo), MAX_TARGET_GROSS_ANNUAL),
      locale,
    ),
  };
}

export function toQuery(state: ApprenticeshipState, locale: Locale = DEFAULT_LOCALE): QueryValues {
  const parsed = parseMoneyInput(state.targetGrossAnnual, locale);
  if (parsed === null) return { l: undefined };
  const value = Math.min(Math.max(Math.floor(parsed), 0), MAX_TARGET_GROSS_ANNUAL);
  return { l: value === DEFAULT_TARGET_GROSS_ANNUAL ? undefined : String(value) };
}
