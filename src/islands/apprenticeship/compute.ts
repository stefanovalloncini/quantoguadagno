import {
  calculateApprenticeship,
  DEFAULT_APPRENTICESHIP_PROGRESSION,
  type ApprenticeshipBreakdown,
} from "@/domain/index.ts";
import type { Locale } from "@/i18n/locales.ts";
import {
  APPRENTICESHIP_DEFAULTS,
  MAX_TARGET_GROSS_ANNUAL,
  parseTargetGrossAnnual,
  type ApprenticeshipState,
} from "./state.ts";

export function computeApprenticeship(
  state: ApprenticeshipState,
  locale: Locale,
): ApprenticeshipBreakdown {
  const parsedTarget = parseTargetGrossAnnual(state, locale);
  const targetGrossAnnual = Math.min(Math.max(parsedTarget ?? 0, 0), MAX_TARGET_GROSS_ANNUAL);
  const years = Number.isInteger(state.years) ? state.years : APPRENTICESHIP_DEFAULTS.years;

  return calculateApprenticeship({
    targetGrossAnnual,
    years,
    progression: DEFAULT_APPRENTICESHIP_PROGRESSION,
  });
}
